import React, { useState, useRef, useCallback } from 'react';
import { Box, Sphere } from '@react-three/drei';

// Interactive corner system for subdivision editing
export const InteractiveCorners = ({ 
  subdivision, 
  isSelected, 
  onUpdateSubdivision, 
  onSelectSubdivision,
  darkMode,
  showCorners = false 
}) => {
  const [dragState, setDragState] = useState({ isDragging: false, cornerIndex: -1 });
  const [hoveredCorner, setHoveredCorner] = useState(-1);
  const dragStart = useRef({ x: 0, z: 0 });
  const originalPoints = useRef([]);

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
    }
    
    return [];
  }, [subdivision]);

  const cornerPoints = getCornerPoints();

  // Handle corner drag start
  const handleCornerPointerDown = useCallback((event, cornerIndex) => {
    event.stopPropagation();
    
    if (!isSelected) {
      onSelectSubdivision(subdivision.id);
      return;
    }

    setDragState({ isDragging: true, cornerIndex });
    const point = event.point;
    dragStart.current = { x: point.x, z: point.z };
    originalPoints.current = [...cornerPoints];
  }, [isSelected, onSelectSubdivision, subdivision.id, cornerPoints]);

  // Handle corner drag
  const handleCornerPointerMove = useCallback((event, cornerIndex) => {
    if (!dragState.isDragging || dragState.cornerIndex !== cornerIndex) return;
    
    event.stopPropagation();
    const point = event.point;
    const deltaX = point.x - dragStart.current.x;
    const deltaZ = point.z - dragStart.current.z;

    // Calculate new corner position
    const newCornerPoints = [...originalPoints.current];
    newCornerPoints[cornerIndex] = {
      x: originalPoints.current[cornerIndex].x + deltaX,
      z: originalPoints.current[cornerIndex].z + deltaZ
    };

    // Update subdivision based on type
    let updatedSubdivision = { ...subdivision };

    if (subdivision.type === 'rectangle') {
      // Recalculate rectangle properties from corners
      const minX = Math.min(...newCornerPoints.map(p => p.x));
      const maxX = Math.max(...newCornerPoints.map(p => p.x));
      const minZ = Math.min(...newCornerPoints.map(p => p.z));
      const maxZ = Math.max(...newCornerPoints.map(p => p.z));
      
      updatedSubdivision.position = { x: (minX + maxX) / 2, z: (minZ + maxZ) / 2 };
      updatedSubdivision.width = maxX - minX;
      updatedSubdivision.height = maxZ - minZ;
      updatedSubdivision.area = updatedSubdivision.width * updatedSubdivision.height;
    } else if (subdivision.type === 'polygon' || subdivision.type === 'freeform') {
      updatedSubdivision.points = newCornerPoints;
      
      // Recalculate centroid and area
      const area = calculatePolygonArea(newCornerPoints);
      const centroid = calculatePolygonCentroid(newCornerPoints);
      updatedSubdivision.area = area;
      updatedSubdivision.position = centroid;
    }

    onUpdateSubdivision(updatedSubdivision);
  }, [dragState, subdivision, onUpdateSubdivision]);

  // Handle corner drag end
  const handleCornerPointerUp = useCallback((event) => {
    if (dragState.isDragging) {
      event.stopPropagation();
      setDragState({ isDragging: false, cornerIndex: -1 });
    }
  }, [dragState.isDragging]);

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

  // Render corner handles
  const renderCorners = () => {
    if (!showCorners || !isSelected) return null;

    return cornerPoints.map((corner, index) => (
      <group key={`corner-${index}`}>
        {/* Main corner handle */}
        <Sphere
          args={[0.5, 8, 6]}
          position={[corner.x, 0.5, corner.z]}
          onPointerDown={(e) => handleCornerPointerDown(e, index)}
          onPointerMove={(e) => handleCornerPointerMove(e, index)}
          onPointerUp={handleCornerPointerUp}
          onPointerEnter={() => setHoveredCorner(index)}
          onPointerLeave={() => setHoveredCorner(-1)}
        >
          <meshLambertMaterial 
            color={
              dragState.isDragging && dragState.cornerIndex === index 
                ? '#ff4444' 
                : hoveredCorner === index 
                  ? '#ffaa44' 
                  : '#4444ff'
            }
            transparent
            opacity={0.8}
          />
        </Sphere>

        {/* Corner index label */}
        <mesh position={[corner.x, 1.2, corner.z]}>
          <planeGeometry args={[1, 0.6]} />
          <meshBasicMaterial 
            color={darkMode ? '#1a1a1a' : '#ffffff'} 
            transparent 
            opacity={0.8} 
          />
        </mesh>

        {/* Add corner button (for polygons) */}
        {subdivision.type !== 'rectangle' && (
          <Box
            args={[0.3, 0.3, 0.1]}
            position={[
              (corner.x + cornerPoints[(index + 1) % cornerPoints.length].x) / 2,
              0.3,
              (corner.z + cornerPoints[(index + 1) % cornerPoints.length].z) / 2
            ]}
            onClick={(e) => {
              e.stopPropagation();
              handleAddCorner(index);
            }}
          >
            <meshLambertMaterial color="#22c55e" transparent opacity={0.7} />
          </Box>
        )}

        {/* Remove corner button (for polygons with >3 corners) */}
        {subdivision.type !== 'rectangle' && cornerPoints.length > 3 && (
          <Box
            args={[0.3, 0.3, 0.1]}
            position={[corner.x + 0.8, 0.8, corner.z]}
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveCorner(index);
            }}
          >
            <meshLambertMaterial color="#ef4444" transparent opacity={0.7} />
          </Box>
        )}
      </group>
    ));
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