import React, { useMemo } from 'react';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Simplified Scene component that works reliably on older hardware
 * Shows the basic land visualization without complex features
 */
export function SimpleScene({ 
  subdivisions = [], 
  darkMode = false,
  onPointerDown,
  onPointerMove,
  onPointerUp
}) {
  console.log('SimpleScene rendering with', subdivisions.length, 'subdivisions');
  
  // Get the default subdivision (main land area)
  const defaultSubdivision = useMemo(() => {
    return subdivisions.find(s => s.id === 'default-square');
  }, [subdivisions]);
  
  // Render a simple polygon from corners
  const renderLandArea = () => {
    if (!defaultSubdivision || !defaultSubdivision.corners || defaultSubdivision.corners.length < 3) {
      return null;
    }
    
    const corners = defaultSubdivision.corners;
    
    // Create simple geometry from corners using Triangle Fan
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    
    // Add center point
    vertices.push(0, 0.01, 0); // Center at origin, slightly above ground
    
    // Add corner vertices
    corners.forEach(corner => {
      vertices.push(corner.x, 0.01, corner.z);
    });
    
    // Create triangles from center to each edge
    for (let i = 1; i < corners.length; i++) {
      indices.push(0, i, i + 1);
    }
    // Close the shape
    indices.push(0, corners.length, 1);
    
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    
    return (
      <mesh 
        geometry={geometry} 
        position={[defaultSubdivision.position.x, 0, defaultSubdivision.position.z]}
      >
        <meshBasicMaterial 
          color={defaultSubdivision.color || '#3b82f6'} 
          transparent 
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    );
  };
  
  return (
    <>
      {/* Simple lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[50, 50, 25]} intensity={0.8} />
      
      {/* Ground plane */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial color={darkMode ? "#1a202c" : "#86efac"} />
      </mesh>
      
      {/* Simple grid */}
      <Grid
        position={[0, 0, 0]}
        args={[100, 100]}
        cellSize={10}
        cellColor={darkMode ? '#4a5568' : '#9ca3af'}
        sectionSize={50}
        sectionColor={darkMode ? '#6b7280' : '#6b7280'}
      />
      
      {/* Main land area */}
      {renderLandArea()}
      
      {/* Additional subdivisions (simplified) */}
      {subdivisions
        .filter(s => s.id !== 'default-square' && s.visible !== false)
        .map(subdivision => (
          <mesh
            key={subdivision.id}
            position={[subdivision.position.x, 0.02, subdivision.position.z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            {subdivision.type === 'rectangle' ? (
              <planeGeometry args={[subdivision.width, subdivision.height]} />
            ) : subdivision.type === 'circle' ? (
              <circleGeometry args={[subdivision.radius || subdivision.width / 2, 32]} />
            ) : (
              <planeGeometry args={[10, 10]} /> // fallback
            )}
            <meshBasicMaterial 
              color={subdivision.color || '#ff6b6b'} 
              transparent 
              opacity={0.7}
            />
          </mesh>
        ))
      }
      
      {/* Interactive plane for drawing */}
      <mesh 
        position={[0, 0.05, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        visible={false}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <planeGeometry args={[300, 300]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={200}
        minDistance={5}
        target={[0, 0, 0]}
        mouseButtons={{
          LEFT: THREE.MOUSE.NONE,
          MIDDLE: THREE.MOUSE.PAN,
          RIGHT: THREE.MOUSE.ROTATE
        }}
      />
    </>
  );
}

export default SimpleScene;