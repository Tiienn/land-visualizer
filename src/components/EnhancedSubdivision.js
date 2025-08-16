import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plane, Line, Text } from '@react-three/drei';
import { InteractiveCorners } from './InteractiveCorners';
import DimensionLines from './DimensionLines';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Enhanced Subdivision component with corner editing capabilities - Optimized
export const EnhancedSubdivision = React.memo(({ 
  subdivision, 
  index,
  isSelected,
  showCorners,
  showDimensions = true,
  onUpdateSubdivision,
  onSelectSubdivision,
  onDeleteSubdivision,
  onSelect, // New prop for selection handling
  darkMode,
  drawingMode 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);
  const dragStartPos = useRef(null);
  const originalPosition = useRef(null);
  const mouseDownTime = useRef(null);
  const meshRef = useRef(null);
  const lineRef = useRef(null);
  const currentMousePos = useRef({ x: 0, y: 0 });
  const { camera, gl } = useThree();

  // Handle subdivision selection - only works in normal mode and select mode  
  const handleSubdivisionClick = useCallback((event) => {
    // Don't handle click if we just finished dragging or are currently dragging
    if (isDragging || mouseDown) return;
    
    // Only handle selection when NOT in drawing mode (rectangle, polyline, etc.)
    if (!drawingMode || drawingMode === 'select') {
      if (event.nativeEvent && event.nativeEvent.button === 0) {
        // Use correct R3F event methods to prevent camera interference
        if (onSelect) {
          // Set userData for identification
          event.eventObject.userData = { subdivisionId: subdivision.id };
          // Stop event propagation using R3F methods
          event.stopPropagation();
          event.nativeEvent.stopPropagation();
          onSelect(event);
        } else if (onSelectSubdivision) {
          // Stop event propagation using R3F methods
          event.stopPropagation();
          event.nativeEvent.stopPropagation();
          onSelectSubdivision(subdivision.id);
        }
        return; // Exit early to prevent other event handlers
      }
    }
    // In drawing mode: DON'T stop propagation - let drawing plane handle left-clicks
  }, [subdivision.id, onSelect, onSelectSubdivision, drawingMode, isDragging, mouseDown]);

  // Handle subdivision hover
  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Smooth dragging with direct Three.js manipulation
  useEffect(() => {
    if (!mouseDown) return;

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event) => {
      // Store current mouse position
      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      
      currentMousePos.current = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((event.clientY - rect.top) / rect.height) * 2 + 1
      };

      // Start dragging on first mouse move
      if (!isDragging && mouseDownTime.current && originalPosition.current && dragStartPos.current) {
        setIsDragging(true);
      }

      // Immediate position update for smooth dragging
      if (meshRef.current && originalPosition.current && dragStartPos.current) {
        // Update raycaster
        mouse.set(currentMousePos.current.x, currentMousePos.current.y);
        raycaster.setFromCamera(mouse, camera);

        // Find intersection with ground plane
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersection);

        if (intersection) {
          const deltaX = intersection.x - dragStartPos.current.x;
          const deltaZ = intersection.z - dragStartPos.current.z;
          
          const newX = originalPosition.current.x + deltaX;
          const newZ = originalPosition.current.z + deltaZ;

          // Update mesh position directly
          meshRef.current.position.x = newX;
          meshRef.current.position.z = newZ;

          // Update line geometry if it exists
          if (lineRef.current) {
            if (subdivision.type === 'rectangle') {
              const points = [
                new THREE.Vector3(newX - subdivision.width/2, 0.003 + ((subdivision.order || 0) * 0.01), newZ - subdivision.height/2),
                new THREE.Vector3(newX + subdivision.width/2, 0.003 + ((subdivision.order || 0) * 0.01), newZ - subdivision.height/2),
                new THREE.Vector3(newX + subdivision.width/2, 0.003 + ((subdivision.order || 0) * 0.01), newZ + subdivision.height/2),
                new THREE.Vector3(newX - subdivision.width/2, 0.003 + ((subdivision.order || 0) * 0.01), newZ + subdivision.height/2),
                new THREE.Vector3(newX - subdivision.width/2, 0.003 + ((subdivision.order || 0) * 0.01), newZ - subdivision.height/2)
              ];
              lineRef.current.geometry.setFromPoints(points);
            } else if (subdivision.type === 'polyline' && subdivision.points) {
              // Update polyline border during drag
              const deltaX = newX - originalPosition.current.x;
              const deltaZ = newZ - originalPosition.current.z;
              
              const updatedPoints = subdivision.points.map(point => 
                new THREE.Vector3(
                  point.x + deltaX, 
                  0.003 + ((subdivision.order || 0) * 0.01), 
                  point.z + deltaZ
                )
              );
              // Close the loop
              updatedPoints.push(updatedPoints[0]);
              lineRef.current.geometry.setFromPoints(updatedPoints);
            }
          }
        }
      }
    };

    const handleMouseUp = () => {
      if (isDragging && meshRef.current && onUpdateSubdivision) {
        if (subdivision.type === 'polyline' && subdivision.points) {
          // For polylines, update all points by the movement offset
          const deltaX = meshRef.current.position.x - originalPosition.current.x;
          const deltaZ = meshRef.current.position.z - originalPosition.current.z;
          
          const newPoints = subdivision.points.map(point => ({
            x: point.x + deltaX,
            z: point.z + deltaZ
          }));
          
          // Update centroid position too
          const newCentroid = {
            x: subdivision.position.x + deltaX,
            z: subdivision.position.z + deltaZ
          };
          
          onUpdateSubdivision(subdivision.id, { 
            points: newPoints,
            position: newCentroid
          });
        } else {
          // For rectangles and other types, update position normally
          const finalPosition = {
            x: meshRef.current.position.x,
            z: meshRef.current.position.z
          };
          onUpdateSubdivision(subdivision.id, { position: finalPosition });
        }
      }

      setMouseDown(false);
      setIsDragging(false);
      dragStartPos.current = null;
      originalPosition.current = null;
      mouseDownTime.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mouseDown, isDragging, camera, gl, onUpdateSubdivision, subdivision.id, subdivision.width, subdivision.height, subdivision.order, subdivision.points, subdivision.position.x, subdivision.position.z, subdivision.type]);

  // Handle mouse down
  const handlePointerDown = useCallback((event) => {
    // Only handle left mouse button (button 0)
    const isLeftClick = event.nativeEvent && event.nativeEvent.button === 0;
    
    
    if (drawingMode === 'select' && isSelected && subdivision.id !== 'default-square' && isLeftClick) {
      event.stopPropagation();
      
      setMouseDown(true);
      mouseDownTime.current = Date.now();
      
      // Store initial intersection and subdivision position
      const intersectionPoint = event.point;
      dragStartPos.current = { x: intersectionPoint.x, z: intersectionPoint.z };
      originalPosition.current = { x: subdivision.position.x, z: subdivision.position.z };
      
      // Prevent camera controls during potential drag
      if (event.nativeEvent) {
        event.nativeEvent.stopPropagation();
      }
    }
  }, [drawingMode, isSelected, subdivision.position, subdivision.id]);

  // Get visual properties based on state
  const getVisualProps = () => {
    const baseOpacity = 0.4;
    const selectedOpacity = 0.7;
    const hoveredOpacity = 0.55;
    const draggingOpacity = 0.9; // Increased for better visibility while dragging

    // Helper function to get a darker/lighter version of the subdivision color
    const getDerivedBorderColor = () => {
      if (isDragging) return '#00ff88'; // Keep bright green for dragging
      if (isSelected) return '#ffffff'; // Keep white for selected
      
      // For normal and hovered states, derive from subdivision color
      if (subdivision.color) {
        try {
          // Parse the color and create a darker version for border
          const color = new THREE.Color(subdivision.color);
          if (isHovered) {
            // Lighter version for hover
            return `#${color.clone().multiplyScalar(1.3).getHexString()}`;
          } else {
            // Darker version for normal state
            return `#${color.clone().multiplyScalar(0.6).getHexString()}`;
          }
        } catch (e) {
          // Fallback to original logic if color parsing fails
          return isHovered ? '#cccccc' : '#888888';
        }
      }
      
      // Fallback for subdivisions without color
      return isHovered ? '#cccccc' : '#888888';
    };

    return {
      opacity: isDragging ? draggingOpacity : (isSelected ? selectedOpacity : (isHovered ? hoveredOpacity : baseOpacity)),
      borderColor: getDerivedBorderColor(),
      borderWidth: isDragging ? 4 : (isSelected ? 3 : (isHovered ? 2 : 1)),
      labelColor: darkMode ? '#ffffff' : '#000000',
      cursor: drawingMode === 'select' && isSelected && subdivision.id !== 'default-square' ? (isDragging ? 'grabbing' : 'grab') : 'pointer'
    };
  };

  const visualProps = getVisualProps();

  // Render based on subdivision type
  const renderSubdivision = () => {
    if (subdivision.type === 'rectangle') {
      return (
        <>
          {/* Rectangle plane */}
          <Plane 
            ref={meshRef}
            args={[subdivision.width, subdivision.height]} 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[subdivision.position.x, 0.002 + ((subdivision.order || 0) * 0.01), subdivision.position.z]}
            onClick={subdivision.id === 'default-square' && drawingMode === 'select' ? undefined : handleSubdivisionClick}
            onPointerEnter={subdivision.id === 'default-square' && drawingMode === 'select' ? undefined : handlePointerEnter}
            onPointerLeave={subdivision.id === 'default-square' && drawingMode === 'select' ? undefined : handlePointerLeave}
            onPointerDown={subdivision.id === 'default-square' && drawingMode === 'select' ? undefined : handlePointerDown}
            onMouseDown={subdivision.id === 'default-square' && drawingMode === 'select' ? undefined : handlePointerDown}
          >
            <meshLambertMaterial 
              color={subdivision.color} 
              transparent 
              opacity={visualProps.opacity}
            />
          </Plane>
          
          {/* Rectangle border */}
          <Line
            ref={lineRef}
            points={[
              [subdivision.position.x - subdivision.width/2, 0.003 + ((subdivision.order || 0) * 0.01), subdivision.position.z - subdivision.height/2], 
              [subdivision.position.x + subdivision.width/2, 0.003 + ((subdivision.order || 0) * 0.01), subdivision.position.z - subdivision.height/2],
              [subdivision.position.x + subdivision.width/2, 0.003 + ((subdivision.order || 0) * 0.01), subdivision.position.z + subdivision.height/2], 
              [subdivision.position.x - subdivision.width/2, 0.003 + ((subdivision.order || 0) * 0.01), subdivision.position.z + subdivision.height/2],
              [subdivision.position.x - subdivision.width/2, 0.003 + ((subdivision.order || 0) * 0.01), subdivision.position.z - subdivision.height/2]
            ]}
            color={visualProps.borderColor}
            lineWidth={visualProps.borderWidth}
          />
        </>
      );
    } else if (subdivision.type === 'polygon' || subdivision.type === 'freeform' || subdivision.type === 'polyline') {
      // Create polygon from points
      const points = subdivision.points || [];
      if (points.length < 3) return null;

      // Create geometry relative to centroid for proper mesh positioning
      const centroid = subdivision.position;
      
      // Create polygon geometry using direct triangulation for exact match
      const createPolygonGeometry = () => {
        const geometry = new THREE.BufferGeometry();
        
        // Simple fan triangulation from the first vertex
        const vertices = [];
        const indices = [];
        
        // Add all vertices relative to centroid, in XZ plane (Y=0)
        points.forEach(point => {
          vertices.push(
            point.x - centroid.x,  // X coordinate
            0,                     // Y coordinate (height)
            point.z - centroid.z   // Z coordinate
          );
        });
        
        // Create triangular faces using fan triangulation
        // For n points, we need n-2 triangles
        for (let i = 1; i < points.length - 1; i++) {
          indices.push(0, i, i + 1);
        }
        
        
        // Set the geometry attributes
        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        
        // Compute normals pointing upward
        geometry.computeVertexNormals();
        
        return geometry;
      };
      
      const geometry = createPolygonGeometry();

      // Create border points for Line component
      const borderPoints = [
        ...points.map(p => [p.x, 0.003 + ((subdivision.order || 0) * 0.01), p.z]),
        [points[0].x, 0.003 + ((subdivision.order || 0) * 0.01), points[0].z] // Close the loop
      ];

      return (
        <>
          {/* Polygon mesh with same rotation pattern as Plane component */}
          <mesh 
            ref={meshRef}
            geometry={geometry}
            position={[subdivision.position.x, 0.002 + ((subdivision.order || 0) * 0.01), subdivision.position.z]}
            onClick={subdivision.id === 'default-square' && drawingMode === 'select' ? undefined : handleSubdivisionClick}
            onPointerEnter={subdivision.id === 'default-square' && drawingMode === 'select' ? undefined : handlePointerEnter}
            onPointerLeave={subdivision.id === 'default-square' && drawingMode === 'select' ? undefined : handlePointerLeave}
            onPointerDown={subdivision.id === 'default-square' && drawingMode === 'select' ? undefined : handlePointerDown}
            onMouseDown={subdivision.id === 'default-square' && drawingMode === 'select' ? undefined : handlePointerDown}
          >
            <meshLambertMaterial 
              color={subdivision.color} 
              transparent 
              opacity={visualProps.opacity}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Polygon border */}
          <Line
            ref={lineRef}
            points={borderPoints}
            color={visualProps.borderColor}
            lineWidth={visualProps.borderWidth}
          />
        </>
      );
    }

    return null;
  };

  // Don't render if layer is hidden
  if (subdivision.visible === false) {
    return null;
  }

  return (
    <group>
      {/* Main subdivision geometry */}
      {renderSubdivision()}
      
      {/* Subdivision label - positioned for top view visibility */}
      <Text
        position={[subdivision.position.x, 10, subdivision.position.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        color={visualProps.labelColor}
        anchorX="center"
        anchorY="middle"
        fontSize={isSelected ? 1.5 : 1.2}
        maxWidth={20}
        outlineWidth={0.1}
        outlineColor={darkMode ? '#000000' : '#ffffff'}
      >
        {subdivision.label}
      </Text>

      {/* Area text - positioned for top view visibility */}
      {isSelected && (
        <Text
          position={[subdivision.position.x, 10, subdivision.position.z + 3]}
          rotation={[-Math.PI / 2, 0, 0]}
          color={visualProps.labelColor}
          anchorX="center"
          anchorY="middle"
          fontSize={1.2}
          maxWidth={20}
          outlineWidth={0.1}
          outlineColor={darkMode ? '#000000' : '#ffffff'}
        >
          {subdivision.area.toFixed(1)} m²
        </Text>
      )}

      {/* Dimension lines */}
      <DimensionLines
        subdivision={subdivision}
        isSelected={isSelected}
        darkMode={darkMode}
        showDimensions={showDimensions}
      />

      {/* Interactive corners */}
      <InteractiveCorners
        subdivision={subdivision}
        isSelected={isSelected}
        onUpdateSubdivision={onUpdateSubdivision}
        onSelectSubdivision={onSelectSubdivision}
        darkMode={darkMode}
        showCorners={showCorners}
      />

      {/* Delete button for selected subdivision */}
      {isSelected && showCorners && (
        <mesh
          position={[subdivision.position.x + (subdivision.width || 5) / 2 + 2, 1, subdivision.position.z]}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteSubdivision(subdivision.id);
          }}
        >
          <boxGeometry args={[1.5, 1.5, 0.2]} />
          <meshLambertMaterial color="#ef4444" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for React.memo to prevent unnecessary re-renders
  return (
    prevProps.subdivision.id === nextProps.subdivision.id &&
    prevProps.subdivision.position.x === nextProps.subdivision.position.x &&
    prevProps.subdivision.position.z === nextProps.subdivision.position.z &&
    prevProps.subdivision.width === nextProps.subdivision.width &&
    prevProps.subdivision.height === nextProps.subdivision.height &&
    prevProps.subdivision.color === nextProps.subdivision.color &&
    prevProps.subdivision.label === nextProps.subdivision.label &&
    prevProps.subdivision.visible === nextProps.subdivision.visible &&
    prevProps.subdivision.order === nextProps.subdivision.order &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.showCorners === nextProps.showCorners &&
    prevProps.showDimensions === nextProps.showDimensions &&
    prevProps.darkMode === nextProps.darkMode &&
    prevProps.drawingMode === nextProps.drawingMode
  );
});

export default EnhancedSubdivision;