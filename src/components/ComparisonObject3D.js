import React, { useMemo } from 'react';
import { Box, Cylinder, Ring, Torus } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Renders a single 3D comparison object based on its geometry3D definition
 * Supports LOD (Level of Detail) and multiple geometry types
 */
const ComparisonObject3D = ({ 
  objectData, 
  position = [0, 0, 0], 
  scale = 1,
  visible = true 
}) => {
  const { camera } = useThree();
  
  // Calculate LOD based on camera distance
  const currentLOD = useMemo(() => {
    const objectPosition = new THREE.Vector3(...position);
    const distance = camera.position.distanceTo(objectPosition);
    
    if (distance > 200) return 'far';
    if (distance > 100) return 'medium';
    return 'near';
  }, [camera.position, position]);
  
  // Get hidden features based on LOD
  const hiddenFeatures = useMemo(() => {
    if (!objectData.renderSettings?.LOD) return [];
    return objectData.renderSettings.LOD[currentLOD]?.hideFeatures || [];
  }, [objectData.renderSettings, currentLOD]);
  
  // Render individual geometry based on type
  const renderGeometry = (geom, material = {}, geomPosition = [0, 0, 0], geomRotation = [0, 0, 0]) => {
    if (!visible) return null;
    
    const finalPosition = [
      position[0] + geomPosition[0] * scale,
      position[1] + geomPosition[1] * scale,
      position[2] + geomPosition[2] * scale
    ];
    
    const materialProps = {
      color: material.color || '#ffffff',
      roughness: material.roughness || 0.5,
      metalness: material.metalness || 0.0,
      transparent: material.transparent || false,
      opacity: material.opacity || 1.0,
      ...material
    };
    
    const commonProps = {
      position: finalPosition,
      rotation: geomRotation,
      castShadow: objectData.renderSettings?.castShadow || false,
      receiveShadow: objectData.renderSettings?.receiveShadow || false
    };
    
    switch(geom.type) {
      case 'box':
        return (
          <Box 
            key={`box-${JSON.stringify(finalPosition)}`}
            args={geom.size ? geom.size.map(s => s * scale) : [1, 1, 1]}
            {...commonProps}
          >
            <meshStandardMaterial {...materialProps} />
          </Box>
        );
        
      case 'cylinder':
        return (
          <Cylinder 
            key={`cylinder-${JSON.stringify(finalPosition)}`}
            args={[
              (geom.radius || 0.5) * scale, 
              (geom.radius || 0.5) * scale, 
              (geom.height || 1) * scale,
              geom.segments || 32
            ]}
            {...commonProps}
          >
            <meshStandardMaterial {...materialProps} />
          </Cylinder>
        );
        
      case 'ring':
        return (
          <Ring 
            key={`ring-${JSON.stringify(finalPosition)}`}
            args={[
              (geom.innerRadius || 0.5) * scale,
              (geom.outerRadius || 1) * scale,
              geom.segments || 64
            ]}
            {...commonProps}
          >
            <meshStandardMaterial {...materialProps} />
          </Ring>
        );
        
      case 'torus':
        return (
          <Torus 
            key={`torus-${JSON.stringify(finalPosition)}`}
            args={[
              (geom.innerRadius || 0.5) * scale,
              (geom.outerRadius || 0.1) * scale,
              geom.radialSegments || 16,
              geom.tubularSegments || 100
            ]}
            {...commonProps}
          >
            <meshStandardMaterial {...materialProps} />
          </Torus>
        );
        
      case 'group':
        return (
          <group 
            key={`group-${JSON.stringify(finalPosition)}`}
            position={finalPosition}
            rotation={geomRotation}
          >
            {geom.children?.map((child, index) => 
              renderGeometry(
                child,
                child.material || material,
                child.position || [0, 0, 0],
                child.rotation || [0, 0, 0]
              )
            )}
          </group>
        );
        
      default:
        console.warn(`Unknown geometry type: ${geom.type}`);
        return null;
    }
  };
  
  if (!objectData?.geometry3D || !visible) return null;
  
  return (
    <group>
      {/* Base geometry */}
      {renderGeometry(
        objectData.geometry3D.base,
        objectData.geometry3D.base.material,
        objectData.geometry3D.base.position || [0, 0, 0],
        objectData.geometry3D.base.rotation || [0, 0, 0]
      )}
      
      {/* Feature geometries (filtered by LOD) */}
      {objectData.geometry3D.features?.map((feature, index) => {
        // Skip hidden features based on LOD
        if (hiddenFeatures.includes(feature.name)) return null;
        
        return renderGeometry(
          feature,
          feature.material || objectData.geometry3D.base.material,
          feature.position || [0, 0, 0],
          feature.rotation || [0, 0, 0]
        );
      })}
    </group>
  );
};

export default ComparisonObject3D;