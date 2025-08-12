import React from 'react';
import { Line, Text } from '@react-three/drei';

// Simple, robust compass rose that won't crash the scene
const SimpleCompass = ({ position = [0, 0, 0], darkMode = false, size = 8 }) => {
  const compassColor = darkMode ? '#60a5fa' : '#2563eb';
  const textColor = darkMode ? 'white' : 'black';

  return (
    <group position={position}>
      {/* Simple compass circle */}
      <Line
        points={[
          [0, 0.1, size], [size * 0.7, 0.1, size * 0.7], [size, 0.1, 0], 
          [size * 0.7, 0.1, -size * 0.7], [0, 0.1, -size], [-size * 0.7, 0.1, -size * 0.7],
          [-size, 0.1, 0], [-size * 0.7, 0.1, size * 0.7], [0, 0.1, size]
        ]}
        color={compassColor}
        lineWidth={2}
      />
      
      {/* Cardinal directions */}
      <Line
        points={[[0, 0.1, 0], [0, 0.1, size * 0.9]]}
        color="#ef4444"
        lineWidth={3}
      />
      <Line
        points={[[0, 0.1, 0], [size * 0.9, 0.1, 0]]}
        color={compassColor}
        lineWidth={2}
      />
      <Line
        points={[[0, 0.1, 0], [0, 0.1, -size * 0.9]]}
        color={compassColor}
        lineWidth={2}
      />
      <Line
        points={[[0, 0.1, 0], [-size * 0.9, 0.1, 0]]}
        color={compassColor}
        lineWidth={2}
      />
      
      {/* Direction labels */}
      <Text
        position={[0, 0.5, size * 0.8]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2}
        color="#ef4444"
        anchorX="center"
        anchorY="middle"
      >
        N
      </Text>
      <Text
        position={[size * 0.8, 0.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2}
        color={textColor}
        anchorX="center"
        anchorY="middle"
      >
        E
      </Text>
      <Text
        position={[0, 0.5, -size * 0.8]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2}
        color={textColor}
        anchorX="center"
        anchorY="middle"
      >
        S
      </Text>
      <Text
        position={[-size * 0.8, 0.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2}
        color={textColor}
        anchorX="center"
        anchorY="middle"
      >
        W
      </Text>
    </group>
  );
};

export default SimpleCompass;