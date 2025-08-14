import React, { useState, useCallback } from 'react';
import { Plane, Line, Text } from '@react-three/drei';
import { InteractiveCorners } from './InteractiveCorners';
import DimensionLines from './DimensionLines';
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

  // Handle subdivision selection - only works in normal mode and select mode  
  const handleSubdivisionClick = useCallback((event) => {
    // Only handle selection when NOT in drawing mode (rectangle, polyline, etc.)
    if (!drawingMode || drawingMode === 'select') {
      if (event.nativeEvent && event.nativeEvent.button === 0) {
        event.stopPropagation(); // Stop propagation for left-clicks on subdivisions
        if (onSelect) {
          // Set userData for identification
          event.eventObject.userData = { subdivisionId: subdivision.id };
          onSelect(event);
        } else if (onSelectSubdivision) {
          onSelectSubdivision(subdivision.id);
        }
        return; // Exit early to prevent other event handlers
      }
    }
    // In drawing mode: DON'T stop propagation - let drawing plane handle left-clicks
  }, [subdivision.id, onSelect, onSelectSubdivision, drawingMode]);

  // Handle subdivision hover
  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Get visual properties based on state
  const getVisualProps = () => {
    const baseOpacity = 0.4;
    const selectedOpacity = 0.7;
    const hoveredOpacity = 0.55;

    return {
      opacity: isSelected ? selectedOpacity : (isHovered ? hoveredOpacity : baseOpacity),
      borderColor: isSelected ? '#ffffff' : (isHovered ? '#cccccc' : '#888888'),
      borderWidth: isSelected ? 3 : (isHovered ? 2 : 1),
      labelColor: darkMode ? '#ffffff' : '#000000'
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
            args={[subdivision.width, subdivision.height]} 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[subdivision.position.x, 0.002, subdivision.position.z]}
            onClick={handleSubdivisionClick}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
          >
            <meshLambertMaterial 
              color={subdivision.color} 
              transparent 
              opacity={visualProps.opacity}
            />
          </Plane>
          
          {/* Rectangle border */}
          <Line
            points={[
              [subdivision.position.x - subdivision.width/2, 0.003, subdivision.position.z - subdivision.height/2], 
              [subdivision.position.x + subdivision.width/2, 0.003, subdivision.position.z - subdivision.height/2],
              [subdivision.position.x + subdivision.width/2, 0.003, subdivision.position.z + subdivision.height/2], 
              [subdivision.position.x - subdivision.width/2, 0.003, subdivision.position.z + subdivision.height/2],
              [subdivision.position.x - subdivision.width/2, 0.003, subdivision.position.z - subdivision.height/2]
            ]}
            color={visualProps.borderColor}
            lineWidth={visualProps.borderWidth}
          />
        </>
      );
    } else if (subdivision.type === 'polygon' || subdivision.type === 'freeform') {
      // Create polygon from points
      const points = subdivision.points || [];
      if (points.length < 3) return null;

      // Create geometry for polygon
      const shape = new THREE.Shape();
      const firstPoint = points[0];
      shape.moveTo(firstPoint.x - subdivision.position.x, firstPoint.z - subdivision.position.z);
      
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        shape.lineTo(point.x - subdivision.position.x, point.z - subdivision.position.z);
      }
      shape.closePath();

      const geometry = new THREE.ShapeGeometry(shape);
      geometry.rotateX(-Math.PI / 2);

      // Create border points for Line component
      const borderPoints = [
        ...points.map(p => [p.x, 0.003, p.z]),
        [points[0].x, 0.003, points[0].z] // Close the loop
      ];

      return (
        <>
          {/* Polygon mesh */}
          <mesh 
            geometry={geometry}
            position={[subdivision.position.x, 0.002, subdivision.position.z]}
            onClick={handleSubdivisionClick}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
          >
            <meshLambertMaterial 
              color={subdivision.color} 
              transparent 
              opacity={visualProps.opacity}
            />
          </mesh>
          
          {/* Polygon border */}
          <Line
            points={borderPoints}
            color={visualProps.borderColor}
            lineWidth={visualProps.borderWidth}
          />
        </>
      );
    }

    return null;
  };

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
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.showCorners === nextProps.showCorners &&
    prevProps.showDimensions === nextProps.showDimensions &&
    prevProps.darkMode === nextProps.darkMode &&
    prevProps.drawingMode === nextProps.drawingMode
  );
});

export default EnhancedSubdivision;