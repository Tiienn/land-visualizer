import React, { useState, useRef } from 'react';
import { Line, Sphere, Text } from '@react-three/drei';

// Individual measuring line component
export const MeasuringLine3D = ({ 
  measurement, 
  onUpdate, 
  onDelete, 
  isSelected, 
  onSelect, 
  darkMode,
  index 
}) => {
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  const startRef = useRef();
  const endRef = useRef();
  
  // Handle dragging of measurement points
  const handleStartDrag = (event) => {
    if (isDraggingStart) {
      const newStart = { 
        x: event.point.x, 
        z: event.point.z 
      };
      const newDistance = Math.sqrt(
        Math.pow(measurement.end.x - newStart.x, 2) + 
        Math.pow(measurement.end.z - newStart.z, 2)
      );
      onUpdate(measurement.id, {
        ...measurement,
        start: newStart,
        distance: newDistance
      });
    }
  };
  
  const handleEndDrag = (event) => {
    if (isDraggingEnd) {
      const newEnd = { 
        x: event.point.x, 
        z: event.point.z 
      };
      const newDistance = Math.sqrt(
        Math.pow(newEnd.x - measurement.start.x, 2) + 
        Math.pow(newEnd.z - measurement.start.z, 2)
      );
      onUpdate(measurement.id, {
        ...measurement,
        end: newEnd,
        distance: newDistance
      });
    }
  };
  
  // Calculate midpoint for distance label
  const midpoint = {
    x: (measurement.start.x + measurement.end.x) / 2,
    y: 2,
    z: (measurement.start.z + measurement.end.z) / 2
  };
  
  const lineColor = isSelected ? '#3b82f6' : hovered ? '#ef4444' : '#f59e0b';
  const pointColor = isSelected ? '#1d4ed8' : hovered ? '#dc2626' : '#d97706';
  
  return (
    <group>
      {/* Measuring line */}
      <Line
        points={[
          [measurement.start.x, 0.1, measurement.start.z],
          [measurement.end.x, 0.1, measurement.end.z]
        ]}
        color={lineColor}
        lineWidth={isSelected ? 4 : hovered ? 3 : 2}
        onClick={() => onSelect(measurement.id)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      />
      
      {/* Start point */}
      <Sphere
        ref={startRef}
        args={[0.3, 8, 6]}
        position={[measurement.start.x, 0.5, measurement.start.z]}
        onClick={() => onSelect(measurement.id)}
        onPointerDown={(e) => {
          e.stopPropagation();
          setIsDraggingStart(true);
        }}
        onPointerUp={() => setIsDraggingStart(false)}
        onPointerMove={handleStartDrag}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={pointColor} 
          transparent 
          opacity={hovered || isSelected ? 0.9 : 0.7}
        />
      </Sphere>
      
      {/* End point */}
      <Sphere
        ref={endRef}
        args={[0.3, 8, 6]}
        position={[measurement.end.x, 0.5, measurement.end.z]}
        onClick={() => onSelect(measurement.id)}
        onPointerDown={(e) => {
          e.stopPropagation();
          setIsDraggingEnd(true);
        }}
        onPointerUp={() => setIsDraggingEnd(false)}
        onPointerMove={handleEndDrag}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={pointColor} 
          transparent 
          opacity={hovered || isSelected ? 0.9 : 0.7}
        />
      </Sphere>
      
      {/* Distance label */}
      <group position={[midpoint.x, midpoint.y, midpoint.z]}>
        {/* Background for better readability */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[measurement.distance.toFixed(1).length * 1.2 + 2, 2]} />
          <meshBasicMaterial 
            color={darkMode ? '#1f2937' : '#ffffff'} 
            transparent 
            opacity={0.9}
          />
        </mesh>
        
        {/* Distance text */}
        <Text
          fontSize={0.8}
          color={darkMode ? '#ffffff' : '#1f2937'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor={darkMode ? '#000000' : '#ffffff'}
        >
          {measurement.distance.toFixed(1)}m
        </Text>
        
        {/* Measurement number */}
        <Text
          position={[0, -0.8, 0]}
          fontSize={0.5}
          color={darkMode ? '#9ca3af' : '#6b7280'}
          anchorX="center"
          anchorY="middle"
        >
          #{index + 1}
        </Text>
      </group>
      
      {/* Dashed helper lines to ground */}
      <Line
        points={[
          [measurement.start.x, 0, measurement.start.z],
          [measurement.start.x, 0.5, measurement.start.z]
        ]}
        color={pointColor}
        lineWidth={1}
        dashed
        dashSize={0.1}
        gapSize={0.05}
      />
      
      <Line
        points={[
          [measurement.end.x, 0, measurement.end.z],
          [measurement.end.x, 0.5, measurement.end.z]
        ]}
        color={pointColor}
        lineWidth={1}
        dashed
        dashSize={0.1}
        gapSize={0.05}
      />
    </group>
  );
};

// Container for all measuring lines
const MeasuringLines3D = ({ 
  measurements, 
  onUpdateMeasurement, 
  onDeleteMeasurement,
  selectedMeasurement,
  onSelectMeasurement,
  darkMode 
}) => {
  return (
    <group>
      {measurements.map((measurement, index) => (
        <MeasuringLine3D
          key={measurement.id}
          measurement={measurement}
          index={index}
          onUpdate={onUpdateMeasurement}
          onDelete={onDeleteMeasurement}
          isSelected={selectedMeasurement === measurement.id}
          onSelect={onSelectMeasurement}
          darkMode={darkMode}
        />
      ))}
    </group>
  );
};

export default MeasuringLines3D;