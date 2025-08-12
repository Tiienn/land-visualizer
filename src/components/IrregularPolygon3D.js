import React, { useState, useMemo } from 'react';
import { Line, Text } from '@react-three/drei';
import * as THREE from 'three';

// Individual irregular polygon component
export const IrregularPolygon3D = ({ 
  polygon, 
  onUpdate,
  onDelete,
  isActive,
  onSelect,
  darkMode 
}) => {
  const [hovered, setHovered] = useState(false);
  
  // Create polygon geometry for filled area
  const polygonGeometry = useMemo(() => {
    if (polygon.points.length < 3) return null;
    
    const shape = new THREE.Shape();
    shape.moveTo(polygon.points[0].x, polygon.points[0].z);
    
    for (let i = 1; i < polygon.points.length; i++) {
      shape.lineTo(polygon.points[i].x, polygon.points[i].z);
    }
    shape.lineTo(polygon.points[0].x, polygon.points[0].z); // Close the shape
    
    const geometry = new THREE.ShapeGeometry(shape);
    geometry.rotateX(-Math.PI / 2); // Rotate to lay flat on ground
    
    return geometry;
  }, [polygon.points]);
  
  // Create outline points
  const outlinePoints = useMemo(() => {
    if (polygon.points.length < 2) return [];
    
    const points = [];
    for (let i = 0; i < polygon.points.length; i++) {
      points.push([polygon.points[i].x, 0.02, polygon.points[i].z]);
    }
    // Close the loop
    if (polygon.points.length >= 3) {
      points.push([polygon.points[0].x, 0.02, polygon.points[0].z]);
    }
    
    return points;
  }, [polygon.points]);
  
  // Calculate polygon center for label
  const center = useMemo(() => {
    if (polygon.points.length === 0) return { x: 0, z: 0 };
    
    const sum = polygon.points.reduce((acc, point) => ({
      x: acc.x + point.x,
      z: acc.z + point.z
    }), { x: 0, z: 0 });
    
    return {
      x: sum.x / polygon.points.length,
      z: sum.z / polygon.points.length
    };
  }, [polygon.points]);
  
  const fillOpacity = isActive ? 0.4 : hovered ? 0.3 : 0.2;
  const lineWidth = isActive ? 3 : hovered ? 2.5 : 2;
  const lineColor = isActive ? '#10b981' : polygon.color;

  return (
    <group 
      onClick={() => onSelect(polygon.id)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Filled polygon area */}
      {polygonGeometry && polygon.isComplete && (
        <mesh 
          geometry={polygonGeometry} 
          position={[0, 0.01, 0]}
        >
          <meshBasicMaterial 
            color={polygon.color} 
            transparent 
            opacity={fillOpacity}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Polygon outline */}
      {outlinePoints.length > 1 && (
        <Line
          points={outlinePoints}
          color={lineColor}
          lineWidth={lineWidth}
          dashed={!polygon.isComplete}
          dashSize={0.2}
          gapSize={0.1}
        />
      )}
      
      {/* Point markers */}
      {polygon.points.map((point, index) => (
        <group key={index} position={[point.x, 0.5, point.z]}>
          <mesh>
            <sphereGeometry args={[0.2, 8, 6]} />
            <meshStandardMaterial 
              color={isActive ? '#10b981' : polygon.color}
              transparent
              opacity={hovered || isActive ? 1 : 0.8}
            />
          </mesh>
          
          {/* Point number */}
          <Text
            position={[0, 0.8, 0]}
            fontSize={0.3}
            color={darkMode ? '#ffffff' : '#000000'}
            anchorX="center"
            anchorY="middle"
          >
            {index + 1}
          </Text>
        </group>
      ))}
      
      {/* Area label */}
      {polygon.isComplete && polygon.area > 0 && (
        <group position={[center.x, 1.5, center.z]}>
          {/* Background for better readability */}
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[polygon.name.length * 0.5 + 2, 1.5]} />
            <meshBasicMaterial 
              color={darkMode ? '#1f2937' : '#ffffff'} 
              transparent 
              opacity={0.9}
            />
          </mesh>
          
          {/* Area name */}
          <Text
            fontSize={0.6}
            color={darkMode ? '#ffffff' : '#1f2937'}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor={darkMode ? '#000000' : '#ffffff'}
          >
            {polygon.name}
          </Text>
          
          {/* Area value */}
          <Text
            position={[0, -0.6, 0]}
            fontSize={0.4}
            color={polygon.color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor={darkMode ? '#000000' : '#ffffff'}
          >
            {polygon.area >= 1 ? `${polygon.area.toFixed(2)} m²` : `${(polygon.area * 10000).toFixed(1)} cm²`}
          </Text>
        </group>
      )}
      
      {/* Preview line for active polygon */}
      {isActive && !polygon.isComplete && polygon.points.length > 0 && (
        <Line
          points={[
            [polygon.points[polygon.points.length - 1].x, 0.02, polygon.points[polygon.points.length - 1].z],
            [polygon.points[0].x, 0.02, polygon.points[0].z]
          ]}
          color="#10b981"
          lineWidth={1}
          dashed
          dashSize={0.1}
          gapSize={0.05}
          transparent
          opacity={0.5}
        />
      )}
    </group>
  );
};

// Container for all irregular polygons
const IrregularPolygons3D = ({ 
  polygons,
  onUpdatePolygon,
  onDeletePolygon, 
  selectedPolygon,
  onSelectPolygon,
  activePolygon,
  darkMode 
}) => {
  return (
    <group>
      {polygons.map((polygon) => (
        <IrregularPolygon3D
          key={polygon.id}
          polygon={polygon}
          onUpdate={onUpdatePolygon}
          onDelete={onDeletePolygon}
          isActive={polygon.id === activePolygon}
          onSelect={onSelectPolygon}
          darkMode={darkMode}
        />
      ))}
    </group>
  );
};

export default IrregularPolygons3D;