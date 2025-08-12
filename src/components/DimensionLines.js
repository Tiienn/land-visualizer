import React from 'react';
import { Line, Text } from '@react-three/drei';

// Dimension line component that shows measurements on subdivision borders - Optimized
export const DimensionLines = React.memo(({ 
  subdivision, 
  isSelected, 
  darkMode = false,
  showDimensions = true 
}) => {
  if (!subdivision || !showDimensions) return null;

  const renderRectangleDimensions = () => {
    if (subdivision.type !== 'rectangle') return null;

    const { position, width, height } = subdivision;
    const { x, z } = position;
    
    // Calculate positions for dimension text on each side
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    // Offset for dimension text (outside the rectangle)
    const offset = Math.min(width, height) * 0.1 + 1.5;
    const textHeight = 10; // High up for top view visibility

    return (
      <group>
        {/* Bottom dimension text (width) */}
        <Text
          position={[x, textHeight, z - halfHeight - offset]}
          rotation={[-Math.PI / 2, 0, 0]}
          color={darkMode ? '#ffffff' : '#000000'}
          anchorX="center"
          anchorY="middle"
          fontSize={1.2}
          outlineWidth={0.1}
          outlineColor={darkMode ? '#000000' : '#ffffff'}
        >
          {width.toFixed(1)}m
        </Text>

        {/* Top dimension text (width) */}
        <Text
          position={[x, textHeight, z + halfHeight + offset]}
          rotation={[-Math.PI / 2, 0, 0]}
          color={darkMode ? '#ffffff' : '#000000'}
          anchorX="center"
          anchorY="middle"
          fontSize={1.2}
          outlineWidth={0.1}
          outlineColor={darkMode ? '#000000' : '#ffffff'}
        >
          {width.toFixed(1)}m
        </Text>

        {/* Left dimension text (height) */}
        <Text
          position={[x - halfWidth - offset, textHeight, z]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
          color={darkMode ? '#ffffff' : '#000000'}
          anchorX="center"
          anchorY="middle"
          fontSize={1.2}
          outlineWidth={0.1}
          outlineColor={darkMode ? '#000000' : '#ffffff'}
        >
          {height.toFixed(1)}m
        </Text>

        {/* Right dimension text (height) */}
        <Text
          position={[x + halfWidth + offset, textHeight, z]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
          color={darkMode ? '#ffffff' : '#000000'}
          anchorX="center"
          anchorY="middle"
          fontSize={1.2}
          outlineWidth={0.1}
          outlineColor={darkMode ? '#000000' : '#ffffff'}
        >
          {height.toFixed(1)}m
        </Text>
      </group>
    );
  };

  const renderPolygonDimensions = () => {
    if (subdivision.type === 'rectangle' || !subdivision.points || subdivision.points.length < 3) return null;

    const points = subdivision.points;
    const offset = 1.5;
    const textHeight = 1.5;

    return (
      <group>
        {points.map((point, index) => {
          const nextPoint = points[(index + 1) % points.length];
          
          // Calculate distance between points
          const distance = Math.sqrt(
            Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.z - point.z, 2)
          );

          // Calculate midpoint
          const midX = (point.x + nextPoint.x) / 2;
          const midZ = (point.z + nextPoint.z) / 2;

          // Calculate perpendicular offset for text positioning
          const dx = nextPoint.x - point.x;
          const dz = nextPoint.z - point.z;
          const length = Math.sqrt(dx * dx + dz * dz);
          const perpX = -dz / length * offset;
          const perpZ = dx / length * offset;

          // Calculate rotation for text alignment
          const angle = Math.atan2(dz, dx);

          return (
            <group key={`dimension-${index}`}>
              {/* Dimension line */}
              <Line
                points={[
                  [point.x + perpX, 0.01, point.z + perpZ],
                  [nextPoint.x + perpX, 0.01, nextPoint.z + perpZ]
                ]}
                color={darkMode ? '#ffffff' : '#333333'}
                lineWidth={2}
              />
              
              {/* Extension lines */}
              <Line
                points={[
                  [point.x, 0.01, point.z],
                  [point.x + perpX * 1.2, 0.01, point.z + perpZ * 1.2]
                ]}
                color={darkMode ? '#ffffff' : '#333333'}
                lineWidth={1}
              />
              <Line
                points={[
                  [nextPoint.x, 0.01, nextPoint.z],
                  [nextPoint.x + perpX * 1.2, 0.01, nextPoint.z + perpZ * 1.2]
                ]}
                color={darkMode ? '#ffffff' : '#333333'}
                lineWidth={1}
              />

              {/* Distance text with background */}
              <group position={[midX + perpX, textHeight, midZ + perpZ]}>
                <mesh rotation={[0, angle, 0]}>
                  <planeGeometry args={[distance.toString().length * 0.5 + 1, 0.6]} />
                  <meshBasicMaterial 
                    color={darkMode ? '#1a1a1a' : '#ffffff'} 
                    transparent 
                    opacity={0.9}
                  />
                </mesh>
                <Text
                  position={[0, 0, 0.01]}
                  rotation={[0, angle, 0]}
                  color={darkMode ? '#ffffff' : '#000000'}
                  anchorX="center"
                  anchorY="middle"
                  fontSize={0.8}
                >
                  {distance.toFixed(1)}m
                </Text>
              </group>
            </group>
          );
        })}
      </group>
    );
  };

  return (
    <group>
      {subdivision.type === 'rectangle' && renderRectangleDimensions()}
      {(subdivision.type === 'polygon' || subdivision.type === 'freeform') && renderPolygonDimensions()}
    </group>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for React.memo
  return (
    prevProps.subdivision.id === nextProps.subdivision.id &&
    prevProps.subdivision.width === nextProps.subdivision.width &&
    prevProps.subdivision.height === nextProps.subdivision.height &&
    prevProps.subdivision.position?.x === nextProps.subdivision.position?.x &&
    prevProps.subdivision.position?.z === nextProps.subdivision.position?.z &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.darkMode === nextProps.darkMode &&
    prevProps.showDimensions === nextProps.showDimensions
  );
});

export default DimensionLines;