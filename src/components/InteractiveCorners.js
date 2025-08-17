import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Box, Sphere } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

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
  const { camera, gl } = useThree();

  // Get corner points based on subdivision type
  const getCornerPoints = useCallback(() => {
    if (!subdivision) return [];

    if (subdivision.type === 'rectangle') {
      const halfWidth = subdivision.width / 2;
      const halfHeight = subdivision.height / 2;
      const { x, z } = subdivision.position;
      
      return [
        { x: x - halfWidth, z: z - halfHeight }, // bottom-left
        { x: x + halfWidth, z: z - halfHeight }, // bottom-right
        { x: x + halfWidth, z: z + halfHeight }, // top-right
        { x: x - halfWidth, z: z + halfHeight }  // top-left
      ];
    } else if (subdivision.type === 'polygon' || subdivision.type === 'freeform') {
      return subdivision.points || [];
    } else if (subdivision.type === 'editable-polygon') {
      return subdivision.corners || [];
    }
    
    return [];
  }, [subdivision]);

  const cornerPoints = getCornerPoints();

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
          const newCornerPoints = [...originalPoints.current];
          newCornerPoints[dragState.cornerIndex] = {
            x: intersection.x,
            z: intersection.z
          };

          if (subdivision.type === 'editable-polygon') {
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
  }, [dragState, camera, gl, subdivision, onUpdateSubdivision]);

  // Add corner between two existing corners (for polygons)
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

  // Remove corner (for polygons with more than 3 corners)
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

  // Add edge selection handler
  const handleEdgeClick = useCallback((event, edgeIndex) => {
    event.stopPropagation();
    if (onSelectEdge) {
      onSelectEdge({ index: edgeIndex });
    }
  }, [onSelectEdge]);

  // Render corner handles - simplified for editable-polygon only
  const renderCorners = () => {
    if (!showCorners || subdivision.type !== 'editable-polygon') return null;


    return cornerPoints.map((corner, index) => {
      // Use temporary drag position if this corner is being dragged
      const isBeingDragged = tempDragPosition && tempDragPosition.cornerIndex === index;
      const position = isBeingDragged 
        ? [tempDragPosition.x, 0.8, tempDragPosition.z]
        : [corner.x, 0.8, corner.z];

      return (
        <Sphere
          key={`corner-${index}`}
          args={[1, 8, 6]}
          position={position}
          onClick={(e) => handleCornerClick(e, index)}
          onPointerDown={(e) => handleCornerPointerDown(e, index)}
          onPointerEnter={() => setHoveredCorner(index)}
          onPointerLeave={() => setHoveredCorner(-1)}
        >
          <meshLambertMaterial 
            color={
              dragState.isDragging && dragState.cornerIndex === index 
                ? '#ff4444' 
                : selectedCorner?.id === corner.id
                  ? '#ffff00'
                  : hoveredCorner === index 
                    ? '#ffaa44' 
                    : '#ff6b35'
            }
            transparent
            opacity={0.8}
          />
        </Sphere>
      );
    });
  };

  return <>{renderCorners()}</>;
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