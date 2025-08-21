import React from 'react';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Minimal test scene to debug 3D rendering issues
 */
export function TestScene({ darkMode }) {
  console.log('TestScene rendering...');
  
  return (
    <>
      {/* Basic lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Test cube to verify 3D rendering */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[10, 2, 10]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>
      
      {/* Ground plane */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color={darkMode ? "#1a202c" : "#86efac"} />
      </mesh>
      
      {/* Grid helper (visible wireframe) */}
      <gridHelper args={[100, 20, "#999999", "#666666"]} position={[0, -1.9, 0]} />
      
      {/* Simple controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={200}
        minDistance={10}
        target={[0, 0, 0]}
      />
    </>
  );
}

export default TestScene;