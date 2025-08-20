import { useState, useRef, useCallback, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PointRenderingEngine } from '../points/PointRenderer';

// Interactive corner system for subdivision editing
export const InteractiveCorners = ({ 
  subdivision, 
  isSelected, 
  onUpdateSubdivision, 
  onSelectSubdivision,
  onUpdateCorner,
  onSelectCorner,
  onSelectEdge,
  selectedCorner,
  selectedEdge,
  darkMode,
  showCorners = false,
  drawingMode
}) => {
  const [dragState, setDragState] = useState({ isDragging: false, cornerIndex: -1 });
  const [hoveredCorner, setHoveredCorner] = useState(-1);
  const [tempDragPosition, setTempDragPosition] = useState(null);
  const dragStart = useRef({ x: 0, z: 0 });
  const originalPoints = useRef([]);
  const debounceTimeout = useRef(null);
  const { camera, gl, scene } = useThree();
  
  // Point renderer system
  const pointRenderer = useRef(null);
  
  // Disable screen-space optimization for corner markers - use fixed world size
  const optimizePoints = useCallback((points) => points, []); // Pass through without optimization

  // Get corner points based on subdivision type
  const getCornerPoints = useCallback(() => {
    if (!subdivision) return [];

    if (subdivision.type === 'rectangle') {
      const halfWidth = subdivision.width / 2;
      const halfHeight = subdivision.height / 2;
      const { x, z } = subdivision.position;
      // const rotation = subdivision.rotation || 0; // Future feature
      
      return [
        // Corner handles (4 circles) - for resizing from corners
        { id: 'corner-bl', x: x - halfWidth, z: z - halfHeight, type: 'corner', handleType: 'corner', corner: 'bl' },
        { id: 'corner-br', x: x + halfWidth, z: z - halfHeight, type: 'corner', handleType: 'corner', corner: 'br' },
        { id: 'corner-tr', x: x + halfWidth, z: z + halfHeight, type: 'corner', handleType: 'corner', corner: 'tr' },
        { id: 'corner-tl', x: x - halfWidth, z: z + halfHeight, type: 'corner', handleType: 'corner', corner: 'tl' },
        
        // Edge handles (4 rectangles) - for resizing along one dimension
        { id: 'edge-top', x: x, z: z + halfHeight, type: 'edge', handleType: 'edge', edge: 'top' },
        { id: 'edge-right', x: x + halfWidth, z: z, type: 'edge', handleType: 'edge', edge: 'right' },
        { id: 'edge-bottom', x: x, z: z - halfHeight, type: 'edge', handleType: 'edge', edge: 'bottom' },
        { id: 'edge-left', x: x - halfWidth, z: z, type: 'edge', handleType: 'edge', edge: 'left' },
        
        // Rotation handle (1 circle with rotation icon) - positioned above the top edge
        { id: 'rotation', x: x, z: z + halfHeight + 8, type: 'rotation', handleType: 'rotation' }
      ];
    } else if (subdivision.type === 'polygon' || subdivision.type === 'freeform' || subdivision.type === 'polyline') {
      return (subdivision.points || []).map((point, index) => ({
        id: `point-${index}`,
        x: point.x,
        z: point.z,
        type: 'point',
        index
      }));
    } else if (subdivision.type === 'editable-polygon') {
      return subdivision.corners || [];
    }
    
    return [];
  }, [subdivision]);

  const cornerPoints = getCornerPoints();

  // Corner handle - resize rectangle from corner (Canva-style)
  const updateRectangleCorners = useCallback((handleIndex, newPosition, corner) => {
    const center = subdivision.position;
    const originalWidth = subdivision.width;
    const originalHeight = subdivision.height;
    
    // Calculate new dimensions based on which corner is being dragged
    let newWidth, newHeight, newCenterX, newCenterZ;
    
    switch (corner) {
      case 'bl': // bottom-left
        newWidth = Math.abs((center.x + originalWidth / 2) - newPosition.x);
        newHeight = Math.abs((center.z + originalHeight / 2) - newPosition.z);
        newCenterX = newPosition.x + newWidth / 2;
        newCenterZ = newPosition.z + newHeight / 2;
        break;
      case 'br': // bottom-right
        newWidth = Math.abs(newPosition.x - (center.x - originalWidth / 2));
        newHeight = Math.abs((center.z + originalHeight / 2) - newPosition.z);
        newCenterX = (center.x - originalWidth / 2) + newWidth / 2;
        newCenterZ = newPosition.z + newHeight / 2;
        break;
      case 'tr': // top-right
        newWidth = Math.abs(newPosition.x - (center.x - originalWidth / 2));
        newHeight = Math.abs(newPosition.z - (center.z - originalHeight / 2));
        newCenterX = (center.x - originalWidth / 2) + newWidth / 2;
        newCenterZ = (center.z - originalHeight / 2) + newHeight / 2;
        break;
      case 'tl': // top-left
        newWidth = Math.abs((center.x + originalWidth / 2) - newPosition.x);
        newHeight = Math.abs(newPosition.z - (center.z - originalHeight / 2));
        newCenterX = newPosition.x + newWidth / 2;
        newCenterZ = (center.z - originalHeight / 2) + newHeight / 2;
        break;
      default:
        return;
    }
    
    // Ensure minimum size
    newWidth = Math.max(newWidth, 5);
    newHeight = Math.max(newHeight, 5);
    
    // Update the rectangle subdivision
    onUpdateSubdivision(subdivision.id, {
      width: newWidth,
      height: newHeight,
      position: { x: newCenterX, z: newCenterZ },
      area: newWidth * newHeight
    });
  }, [subdivision, onUpdateSubdivision]);

  // Edge handle - resize rectangle along one dimension (Canva-style)
  const updateRectangleEdge = useCallback((handleIndex, newPosition, edge) => {
    const center = subdivision.position;
    const currentWidth = subdivision.width;
    const currentHeight = subdivision.height;
    
    let newWidth = currentWidth;
    let newHeight = currentHeight;
    let newCenterX = center.x;
    let newCenterZ = center.z;
    
    switch (edge) {
      case 'top':
        newHeight = Math.abs(newPosition.z - (center.z - currentHeight / 2));
        newCenterZ = (center.z - currentHeight / 2) + newHeight / 2;
        break;
      case 'bottom':
        newHeight = Math.abs((center.z + currentHeight / 2) - newPosition.z);
        newCenterZ = newPosition.z + newHeight / 2;
        break;
      case 'left':
        newWidth = Math.abs((center.x + currentWidth / 2) - newPosition.x);
        newCenterX = newPosition.x + newWidth / 2;
        break;
      case 'right':
        newWidth = Math.abs(newPosition.x - (center.x - currentWidth / 2));
        newCenterX = (center.x - currentWidth / 2) + newWidth / 2;
        break;
      default:
        return;
    }
    
    // Ensure minimum size
    newWidth = Math.max(newWidth, 5);
    newHeight = Math.max(newHeight, 5);
    
    // Update the rectangle subdivision
    onUpdateSubdivision(subdivision.id, {
      width: newWidth,
      height: newHeight,
      position: { x: newCenterX, z: newCenterZ },
      area: newWidth * newHeight
    });
  }, [subdivision, onUpdateSubdivision]);

  // Rotation handle - rotate rectangle around center (Canva-style)
  const updateRectangleRotation = useCallback((newPosition) => {
    const center = subdivision.position;
    const dx = newPosition.x - center.x;
    const dz = newPosition.z - center.z;
    const rotation = Math.atan2(dz, dx);
    
    // Update the rectangle subdivision with rotation
    onUpdateSubdivision(subdivision.id, {
      rotation: rotation
    });
  }, [subdivision, onUpdateSubdivision]);

  // Initialize point renderer
  useEffect(() => {
    if (!scene) return;
    
    const maxPoints = Math.max(cornerPoints.length || 4, 10); // Minimum 10 points for flexibility
    pointRenderer.current = new PointRenderingEngine(scene, maxPoints);
    
    return () => {
      if (pointRenderer.current) {
        pointRenderer.current.dispose();
        pointRenderer.current = null;
      }
    };
  }, [scene, cornerPoints.length]);

  // Update points when corner data changes
  useEffect(() => {
    const supportedTypes = ['editable-polygon', 'rectangle', 'polygon', 'polyline', 'freeform'];
    
    // COMPREHENSIVE DEBUG LOGGING - Only log rectangle types to reduce noise
    if (subdivision?.type === 'rectangle') {
      console.log('=== RECTANGLE HANDLE DEBUG START ===');
      console.log('Rectangle Subdivision:', subdivision);
      console.log('Rectangle ID:', subdivision?.id);
      console.log('Rectangle Type:', subdivision?.type);
      console.log('ShowCorners prop:', showCorners);
      console.log('PointRenderer exists:', !!pointRenderer.current);
      console.log('=== RECTANGLE HANDLE DEBUG END ===');
    }
    
    if (!pointRenderer.current || !showCorners || !supportedTypes.includes(subdivision?.type)) {
      console.log('HANDLE DEBUG - Clearing points. Reason:', {
        noRenderer: !pointRenderer.current,
        noShowCorners: !showCorners,
        unsupportedType: !supportedTypes.includes(subdivision?.type)
      });
      if (pointRenderer.current) {
        pointRenderer.current.clearPoints();
      }
      return;
    }

    const points = cornerPoints.map((corner, index) => {
      // Calculate proper Y position - slightly above the rectangle plane for visibility
      const rectangleY = 0.002 + ((subdivision.order || 0) * 0.01);
      const handleY = rectangleY + 0.05; // 5cm above rectangle for visibility
      
      // Use temporary drag position if this corner is being dragged
      const isBeingDragged = tempDragPosition && tempDragPosition.cornerIndex === index;
      const position = isBeingDragged 
        ? { x: tempDragPosition.x, y: handleY, z: tempDragPosition.z }
        : { x: corner.x, y: handleY, z: corner.z };

      return {
        id: `corner-${subdivision.id}-${index}`,
        position,
        style: subdivision.type === 'rectangle' ? 
               (corner.handleType === 'corner' ? 'HANDLE_CORNER' : 
                corner.handleType === 'edge' ? 'HANDLE_EDGE' : 
                'HANDLE_ROTATION') :
               subdivision.type === 'polyline' ? 'CIRCLE' : 
               'X_MARKER', // Canva-style handles for rectangles
        state: dragState.isDragging && dragState.cornerIndex === index 
          ? 'DRAGGING'
          : selectedCorner?.id === corner.id
            ? 'SELECTED'
            : hoveredCorner === index 
              ? 'HOVERED' 
              : 'NORMAL',
        scale: subdivision.type === 'rectangle' ? 
               (corner.handleType === 'edge' ? 2.0 : 2.5) : 2.0, // Much larger for visibility
        color: subdivision.type === 'rectangle' ? 
               (dragState.isDragging && dragState.cornerIndex === index 
                ? '#4285f4'  // Google blue when dragging
                : hoveredCorner === index 
                  ? '#ffeb3b' // Bright yellow when hovered
                  : '#ff5722') // Bright orange for high visibility
               : (dragState.isDragging && dragState.cornerIndex === index 
                 ? '#ff4444' 
                 : selectedCorner?.id === corner.id
                   ? '#ffff00'
                   : hoveredCorner === index 
                     ? '#ffaa44' 
                     : '#ff6b35')
      };
    });

    // Use points directly without optimization to ensure all corners render
    
    // Set user data for each point to enable interaction
    points.forEach((point, index) => {
      pointRenderer.current.setPointUserData(index, { 
        cornerIndex: index, 
        corner: cornerPoints[index],
        subdivisionId: subdivision.id
      });
    });
    
    // Update the point renderer with all points
    pointRenderer.current.updatePoints(points);
  }, [cornerPoints, tempDragPosition, dragState, selectedCorner, hoveredCorner, showCorners, subdivision, optimizePoints, camera, gl, updateRectangleCorners, updateRectangleEdge, updateRectangleRotation]);

  // Handle corner click for selection
  const handleCornerClick = useCallback((event, cornerIndex) => {
    event.stopPropagation();
    
    if (!isSelected) {
      onSelectSubdivision(subdivision.id);
      return;
    }

    // Select this corner
    if (onSelectCorner && subdivision.type === 'editable-polygon') {
      const corner = cornerPoints[cornerIndex];
      onSelectCorner(corner);
    }
  }, [isSelected, onSelectSubdivision, subdivision.id, cornerPoints, onSelectCorner, subdivision.type]);

  // Handle corner drag start
  const handleCornerPointerDown = useCallback((event, cornerIndex) => {
    event.stopPropagation();
    
    // Also prevent the native event from bubbling
    if (event.nativeEvent) {
      event.nativeEvent.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();
    }
    
    setDragState({ isDragging: true, cornerIndex });
    
    // Get the current corner position as starting point
    const currentCorner = cornerPoints[cornerIndex];
    dragStart.current = { x: currentCorner.x, z: currentCorner.z };
    originalPoints.current = [...cornerPoints];
  }, [cornerPoints]);

  // Global mouse handling for dragging
  useEffect(() => {
    if (!dragState.isDragging) return;

    // Disable text selection and pointer events during drag
    document.body.style.userSelect = 'none';
    document.body.style.pointerEvents = 'none';
    gl.domElement.style.pointerEvents = 'auto'; // Keep canvas interactive

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event) => {
      // Prevent default behavior and stop propagation to prevent camera controls
      event.preventDefault();
      event.stopPropagation();
      
      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      
      mouse.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      raycaster.setFromCamera(mouse, camera);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);

      if (intersection) {
        // Update temporary drag position for immediate visual feedback
        setTempDragPosition({
          cornerIndex: dragState.cornerIndex,
          x: intersection.x,
          z: intersection.z
        });

        // Clear previous debounce
        if (debounceTimeout.current) {
          clearTimeout(debounceTimeout.current);
        }

        // Debounce the expensive subdivision recalculation
        debounceTimeout.current = setTimeout(() => {
          if (subdivision.type === 'rectangle') {
            // Rectangle constraint logic with different behaviors for different handle types
            const handleIndex = dragState.cornerIndex;
            const handle = cornerPoints[handleIndex];
            const newPosition = { x: intersection.x, z: intersection.z };
            
            if (handle.handleType === 'corner') {
              updateRectangleCorners(handleIndex, newPosition, handle.corner);
            } else if (handle.handleType === 'edge') {
              updateRectangleEdge(handleIndex, newPosition, handle.edge);
            } else if (handle.handleType === 'rotation') {
              updateRectangleRotation(newPosition);
            }
            
          } else if (subdivision.type === 'polyline' || subdivision.type === 'polygon' || subdivision.type === 'freeform') {
            // Free-form point editing
            const newPoints = [...originalPoints.current];
            newPoints[dragState.cornerIndex] = {
              x: intersection.x,
              z: intersection.z
            };
            
            const area = calculatePolygonArea(newPoints);
            const centroid = calculatePolygonCentroid(newPoints);
            
            onUpdateSubdivision(subdivision.id, {
              points: newPoints,
              area: area,
              position: centroid
            });
            
          } else if (subdivision.type === 'editable-polygon') {
            // Editable polygon logic (existing)
            const newCornerPoints = [...originalPoints.current];
            newCornerPoints[dragState.cornerIndex] = {
              x: intersection.x,
              z: intersection.z
            };

            const updatedCorners = newCornerPoints.map((point, index) => ({
              id: subdivision.corners[index]?.id || `corner-${index}`,
              x: point.x,
              z: point.z
            }));
            
            // Recalculate centroid and area
            const area = calculatePolygonArea(newCornerPoints);
            const centroid = calculatePolygonCentroid(newCornerPoints);

            onUpdateSubdivision(subdivision.id, {
              corners: updatedCorners,
              area: area,
              position: centroid
            });
          }
        }, 50); // 50ms debounce - frequent enough to feel responsive
      }
    };

    const handleMouseUp = (event) => {
      // Prevent default behavior and stop propagation
      event.preventDefault();
      event.stopPropagation();
      
      // Clear any pending debounced update
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
        debounceTimeout.current = null;
      }

      // Apply final position immediately if dragging
      if (dragState.isDragging && tempDragPosition && subdivision.type === 'editable-polygon') {
        const newCornerPoints = [...originalPoints.current];
        newCornerPoints[tempDragPosition.cornerIndex] = {
          x: tempDragPosition.x,
          z: tempDragPosition.z
        };

        const updatedCorners = newCornerPoints.map((point, index) => ({
          id: subdivision.corners[index]?.id || `corner-${index}`,
          x: point.x,
          z: point.z
        }));
        
        // Recalculate centroid and area
        const area = calculatePolygonArea(newCornerPoints);
        const centroid = calculatePolygonCentroid(newCornerPoints);

        onUpdateSubdivision(subdivision.id, {
          corners: updatedCorners,
          area: area,
          position: centroid
        });
      }

      setDragState({ isDragging: false, cornerIndex: -1 });
      setTempDragPosition(null);
      
      // Restore body styles immediately
      document.body.style.userSelect = '';
      document.body.style.pointerEvents = '';
      gl.domElement.style.pointerEvents = '';
    };

    document.addEventListener('mousemove', handleMouseMove, { capture: true, passive: false });
    document.addEventListener('mouseup', handleMouseUp, { capture: true, passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, { capture: true });
      document.removeEventListener('mouseup', handleMouseUp, { capture: true });
      
      // Restore body styles
      document.body.style.userSelect = '';
      document.body.style.pointerEvents = '';
      gl.domElement.style.pointerEvents = '';
    };
  }, [dragState, camera, gl, subdivision, onUpdateSubdivision, tempDragPosition, cornerPoints, updateRectangleCorners, updateRectangleEdge, updateRectangleRotation]);

  // Future feature: Add corner between two existing corners (for polygons)
  // eslint-disable-next-line no-unused-vars
  const handleAddCorner = useCallback((insertIndex) => {
    if (subdivision.type === 'rectangle') return; // Can't add corners to rectangles
    
    const points = [...cornerPoints];
    const currentPoint = points[insertIndex];
    const nextPoint = points[(insertIndex + 1) % points.length];
    
    // Calculate midpoint
    const midPoint = {
      x: (currentPoint.x + nextPoint.x) / 2,
      z: (currentPoint.z + nextPoint.z) / 2
    };
    
    // Insert new point
    points.splice(insertIndex + 1, 0, midPoint);
    
    // Update subdivision
    const updatedSubdivision = {
      ...subdivision,
      points: points,
      area: calculatePolygonArea(points),
      position: calculatePolygonCentroid(points)
    };
    
    onUpdateSubdivision(updatedSubdivision);
  }, [subdivision, cornerPoints, onUpdateSubdivision]);

  // Future feature: Remove corner (for polygons with more than 3 corners)
  // eslint-disable-next-line no-unused-vars
  const handleRemoveCorner = useCallback((cornerIndex) => {
    if (subdivision.type === 'rectangle') return; // Can't remove corners from rectangles
    if (cornerPoints.length <= 3) return; // Need at least 3 corners for polygon
    
    const points = [...cornerPoints];
    points.splice(cornerIndex, 1);
    
    // Update subdivision
    const updatedSubdivision = {
      ...subdivision,
      points: points,
      area: calculatePolygonArea(points),
      position: calculatePolygonCentroid(points)
    };
    
    onUpdateSubdivision(updatedSubdivision);
  }, [subdivision, cornerPoints, onUpdateSubdivision]);

  // Future feature: Add edge selection handler
  // eslint-disable-next-line no-unused-vars
  const handleEdgeClick = useCallback((event, edgeIndex) => {
    event.stopPropagation();
    if (onSelectEdge) {
      onSelectEdge({ index: edgeIndex });
    }
  }, [onSelectEdge]);

  // Handle point interactions via raycasting
  const handlePointInteraction = useCallback((event, interactionType) => {
    if (!pointRenderer.current || !showCorners) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const canvas = gl.domElement;
    const rect = canvas.getBoundingClientRect();
    
    mouse.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    raycaster.setFromCamera(mouse, camera);
    
    // Get all point intersections
    const intersections = pointRenderer.current.getIntersections(raycaster);
    
    if (intersections.length > 0) {
      const intersection = intersections[0];
      const cornerIndex = intersection.userData?.cornerIndex;
      
      if (cornerIndex !== undefined) {
        event.stopPropagation();
        
        switch (interactionType) {
          case 'click':
            handleCornerClick(event, cornerIndex);
            break;
          case 'pointerdown':
            handleCornerPointerDown(event, cornerIndex);
            break;
          case 'pointerenter':
            setHoveredCorner(cornerIndex);
            break;
          case 'pointerleave':
            setHoveredCorner(-1);
            break;
          default:
            // No action for unknown interaction types
            break;
        }
      }
    }
  }, [pointRenderer, showCorners, gl, camera, handleCornerClick, handleCornerPointerDown]);

  // Add global event listeners for point interactions
  useEffect(() => {
    if (!gl.domElement || !pointRenderer.current) return;

    const canvas = gl.domElement;
    
    const handleCanvasClick = (event) => handlePointInteraction(event, 'click');
    const handleCanvasPointerDown = (event) => handlePointInteraction(event, 'pointerdown');
    const handleCanvasPointerMove = (event) => {
      // Only handle hover when not dragging
      if (!dragState.isDragging) {
        handlePointInteraction(event, 'pointerenter');
      }
    };

    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('pointerdown', handleCanvasPointerDown);
    canvas.addEventListener('pointermove', handleCanvasPointerMove);
    
    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
      canvas.removeEventListener('pointerdown', handleCanvasPointerDown);
      canvas.removeEventListener('pointermove', handleCanvasPointerMove);
    };
  }, [gl.domElement, pointRenderer, handlePointInteraction, dragState.isDragging]);

  // Return null since rendering is handled by the point renderer
  return null;
};

// Utility functions for polygon calculations
function calculatePolygonArea(points) {
  if (points.length < 3) return 0;
  
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].z;
    area -= points[j].x * points[i].z;
  }
  return Math.abs(area) / 2;
}

function calculatePolygonCentroid(points) {
  if (points.length === 0) return { x: 0, z: 0 };
  
  const centroid = points.reduce(
    (acc, point) => ({
      x: acc.x + point.x,
      z: acc.z + point.z
    }),
    { x: 0, z: 0 }
  );
  
  return {
    x: centroid.x / points.length,
    z: centroid.z / points.length
  };
}

export default InteractiveCorners;