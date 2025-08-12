import React, { useState, useRef } from 'react';
import { Line, Text, Plane } from '@react-three/drei';

// Utility function to format bearing
const formatBearing = (bearing) => {
  return `${bearing.toFixed(1)}°`;
};

// 3D compass rose component
const CompassRose3D = ({ position, darkMode, size = 15 }) => {
  const compassRef = useRef();
  
  // Removed animation to prevent potential rendering issues
  // useFrame((state) => {
  //   if (compassRef.current) {
  //     // Subtle rotation animation
  //     compassRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.02;
  //   }
  // });

  const compassColor = darkMode ? '#60a5fa' : '#2563eb';
  const textColor = darkMode ? 'white' : 'black';

  return (
    <group ref={compassRef} position={position}>
      {/* Compass base circle */}
      <Line
        points={(() => {
          const points = [];
          for (let i = 0; i <= 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            points.push([
              Math.sin(angle) * size,
              0.1,
              Math.cos(angle) * size
            ]);
          }
          return points;
        })()}
        color={compassColor}
        lineWidth={2}
      />
      
      {/* Cardinal direction indicators */}
      {[
        { angle: 0, label: 'N', color: '#ef4444' }, // North - Red
        { angle: 90, label: 'E', color: compassColor },
        { angle: 180, label: 'S', color: compassColor },
        { angle: 270, label: 'W', color: compassColor }
      ].map(({ angle, label, color }, index) => {
        const radians = (angle * Math.PI) / 180;
        const x = Math.sin(radians) * size * 0.8;
        const z = Math.cos(radians) * size * 0.8;
        
        return (
          <group key={index}>
            {/* Direction line */}
            <Line
              points={[
                [Math.sin(radians) * size * 0.7, 0.1, Math.cos(radians) * size * 0.7],
                [Math.sin(radians) * size * 0.9, 0.1, Math.cos(radians) * size * 0.9]
              ]}
              color={color}
              lineWidth={3}
            />
            
            {/* Direction label */}
            <Text
              position={[x, 0.5, z]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={3}
              color={label === 'N' ? '#ef4444' : textColor}
              anchorX="center"
              anchorY="middle"
              font="arial"
              fontWeight="bold"
            >
              {label}
            </Text>
          </group>
        );
      })}
      
      {/* Degree markings every 30 degrees */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = i * 30;
        if (angle % 90 !== 0) { // Skip cardinal directions
          const radians = (angle * Math.PI) / 180;
          const x = Math.sin(radians) * size * 0.85;
          const z = Math.cos(radians) * size * 0.85;
          
          return (
            <Text
              key={angle}
              position={[x, 0.3, z]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={1.5}
              color={darkMode ? '#9ca3af' : '#6b7280'}
              anchorX="center"
              anchorY="middle"
            >
              {angle}°
            </Text>
          );
        }
        return null;
      })}
    </group>
  );
};

// Individual bearing line component
export const BearingLine3D = ({ 
  bearing, 
  onUpdate, 
  onDelete, 
  isSelected, 
  onSelect, 
  darkMode, 
  index,
  showCompass = false 
}) => {
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  const lineRef = useRef();
  const startPointRef = useRef();
  const endPointRef = useRef();
  
  // Safety check
  if (!bearing || !bearing.startPoint || !bearing.endPoint) {
    return null;
  }
  
  // Calculate midpoint for labels
  const midpoint = {
    x: (bearing.startPoint.x + bearing.endPoint.x) / 2,
    z: (bearing.startPoint.z + bearing.endPoint.z) / 2
  };

  const handleStartDrag = (event) => {
    try {
      if (!isDraggingStart || !event || !event.point) return;
      
      const newPoint = { x: event.point.x, z: event.point.z };
      const distance = Math.sqrt(
        Math.pow(newPoint.x - bearing.endPoint.x, 2) + 
        Math.pow(newPoint.z - bearing.endPoint.z, 2)
      );
      
      const deltaX = bearing.endPoint.x - newPoint.x;
      const deltaZ = bearing.endPoint.z - newPoint.z;
      let newBearing = Math.atan2(deltaX, deltaZ) * (180 / Math.PI);
      if (newBearing < 0) newBearing += 360;
      
      onUpdate(bearing.id, {
        ...bearing,
        startPoint: newPoint,
        distance,
        bearing: newBearing
      });
    } catch (error) {
      console.warn('Error in handleStartDrag:', error);
    }
  };

  const handleEndDrag = (event) => {
    try {
      if (!isDraggingEnd || !event || !event.point) return;
      
      const newPoint = { x: event.point.x, z: event.point.z };
      const distance = Math.sqrt(
        Math.pow(newPoint.x - bearing.startPoint.x, 2) + 
        Math.pow(newPoint.z - bearing.startPoint.z, 2)
      );
      
      const deltaX = newPoint.x - bearing.startPoint.x;
      const deltaZ = newPoint.z - bearing.startPoint.z;
      let newBearing = Math.atan2(deltaX, deltaZ) * (180 / Math.PI);
      if (newBearing < 0) newBearing += 360;
      
      onUpdate(bearing.id, {
        ...bearing,
        endPoint: newPoint,
        distance,
        bearing: newBearing
      });
    } catch (error) {
      console.warn('Error in handleEndDrag:', error);
    }
  };

  // Color coding based on bearing ranges
  const getBearingColor = () => {
    if (isSelected) return darkMode ? '#60a5fa' : '#3b82f6';
    if (hovered) return darkMode ? '#34d399' : '#10b981';
    
    // Color code by quadrant
    if (bearing.bearing <= 90) return '#ef4444'; // North-East: Red
    if (bearing.bearing <= 180) return '#f59e0b'; // South-East: Amber
    if (bearing.bearing <= 270) return '#8b5cf6'; // South-West: Purple
    return '#06b6d4'; // North-West: Cyan
  };

  const lineColor = getBearingColor();

  return (
    <group>
      {/* Main bearing line */}
      <Line
        ref={lineRef}
        points={[
          [bearing.startPoint.x, 0.5, bearing.startPoint.z],
          [bearing.endPoint.x, 0.5, bearing.endPoint.z]
        ]}
        color={lineColor}
        lineWidth={isSelected ? 4 : hovered ? 3 : 2}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(bearing.id);
        }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      />
      
      {/* Directional arrow at end point */}
      <group position={[bearing.endPoint.x, 0.6, bearing.endPoint.z]}>
        <Line
          points={(() => {
            const angle = (bearing.bearing * Math.PI) / 180;
            const size = 0.8;
            return [
              [-Math.sin(angle + Math.PI/6) * size, 0, -Math.cos(angle + Math.PI/6) * size],
              [0, 0, 0],
              [-Math.sin(angle - Math.PI/6) * size, 0, -Math.cos(angle - Math.PI/6) * size]
            ];
          })()}
          color={lineColor}
          lineWidth={3}
        />
      </group>

      {/* Start point (draggable) */}
      <mesh
        ref={startPointRef}
        position={[bearing.startPoint.x, 0.8, bearing.startPoint.z]}
        onPointerDown={(e) => {
          e.stopPropagation();
          setIsDraggingStart(true);
          onSelect(bearing.id);
        }}
        onPointerUp={() => setIsDraggingStart(false)}
        onPointerMove={handleStartDrag}
      >
        <sphereGeometry args={[0.3]} />
        <meshLambertMaterial color={isDraggingStart ? '#10b981' : lineColor} />
      </mesh>

      {/* End point (draggable) */}
      <mesh
        ref={endPointRef}
        position={[bearing.endPoint.x, 0.8, bearing.endPoint.z]}
        onPointerDown={(e) => {
          e.stopPropagation();
          setIsDraggingEnd(true);
          onSelect(bearing.id);
        }}
        onPointerUp={() => setIsDraggingEnd(false)}
        onPointerMove={handleEndDrag}
      >
        <sphereGeometry args={[0.3]} />
        <meshLambertMaterial color={isDraggingEnd ? '#10b981' : lineColor} />
      </mesh>

      {/* Bearing label */}
      <group position={[midpoint.x, 3, midpoint.z]}>
        {/* Background for text */}
        <Plane
          args={[6, 2]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <meshLambertMaterial 
            color={darkMode ? "#374151" : "white"} 
            transparent 
            opacity={0.9} 
          />
        </Plane>
        
        {/* Bearing text */}
        <Text
          position={[0, 0.1, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={1.8}
          color={darkMode ? "white" : "black"}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {formatBearing(bearing.bearing)}
        </Text>
        
        {/* Distance text */}
        <Text
          position={[0, 0.1, -1.2]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={1.2}
          color={darkMode ? "#9ca3af" : "#6b7280"}
          anchorX="center"
          anchorY="middle"
        >
          {bearing.distance.toFixed(2)}m
        </Text>
      </group>

      {/* Show mini compass at start point when selected */}
      {isSelected && showCompass && (
        <CompassRose3D 
          position={[bearing.startPoint.x, 0.1, bearing.startPoint.z]} 
          darkMode={darkMode}
          size={5}
        />
      )}
    </group>
  );
};

// Compass rose visualization component
export const CompassRose3DStandalone = ({ position = [0, 0, 0], darkMode, size = 20, show = true }) => {
  if (!show) return null;
  
  try {
    return <CompassRose3D position={position} darkMode={darkMode} size={size} />;
  } catch (error) {
    console.warn('CompassRose3D rendering failed:', error);
    return null;
  }
};

export default BearingLine3D;