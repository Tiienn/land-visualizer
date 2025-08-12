import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Plane } from '@react-three/drei';
import * as THREE from 'three';

// Create custom terrain geometry
function createTerrainGeometry(width, height, widthSegments, heightSegments, elevationMap, maxElevation) {
  const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
  const vertices = geometry.attributes.position;
  
  // Apply elevation to each vertex based on the elevation map
  for (let i = 0; i < vertices.count; i++) {
    const x = vertices.getX(i);
    const z = vertices.getY(i); // Y becomes Z in plane geometry
    
    // Convert world coordinates to elevation map coordinates
    const mapX = Math.floor((x + width/2) / width * elevationMap.length);
    const mapZ = Math.floor((z + height/2) / height * elevationMap[0].length);
    
    // Clamp coordinates to valid range
    const clampedX = Math.max(0, Math.min(elevationMap.length - 1, mapX));
    const clampedZ = Math.max(0, Math.min(elevationMap[0].length - 1, mapZ));
    
    // Get elevation from map and apply max elevation scaling
    const elevation = elevationMap[clampedX][clampedZ] * maxElevation;
    vertices.setZ(i, elevation);
  }
  
  // Recompute normals for proper lighting
  geometry.computeVertexNormals();
  return geometry;
}

// Generate procedural elevation data using multiple noise patterns
function generateElevationMap(size, patterns) {
  const map = [];
  
  for (let x = 0; x < size; x++) {
    map[x] = [];
    for (let z = 0; z < size; z++) {
      let elevation = 0;
      
      patterns.forEach(pattern => {
        const nx = x / size * pattern.frequency;
        const nz = z / size * pattern.frequency;
        
        // Simple fractal noise approximation
        let noise = 0;
        let amplitude = pattern.amplitude;
        let freq = 1;
        
        for (let i = 0; i < pattern.octaves; i++) {
          noise += amplitude * (Math.sin(nx * freq) * Math.cos(nz * freq) + Math.sin(nz * freq * 1.3) * Math.cos(nx * freq * 0.7));
          amplitude *= 0.5;
          freq *= 2;
        }
        
        elevation += noise * pattern.intensity;
      });
      
      // Normalize and smooth
      elevation = (elevation + 1) * 0.5; // Convert from [-1,1] to [0,1]
      map[x][z] = Math.max(0, Math.min(1, elevation));
    }
  }
  
  return map;
}

// Terrain patterns presets
export const TERRAIN_PRESETS = {
  flat: {
    name: 'Flat',
    description: 'Completely flat terrain',
    patterns: [{ frequency: 1, amplitude: 0, intensity: 0, octaves: 1 }],
    maxElevation: 0
  },
  gentle_hills: {
    name: 'Gentle Hills',
    description: 'Soft rolling hills',
    patterns: [
      { frequency: 2, amplitude: 1, intensity: 0.3, octaves: 2 },
      { frequency: 4, amplitude: 0.5, intensity: 0.2, octaves: 1 }
    ],
    maxElevation: 8
  },
  rolling_terrain: {
    name: 'Rolling Terrain',
    description: 'Moderate hills and valleys',
    patterns: [
      { frequency: 1.5, amplitude: 1, intensity: 0.4, octaves: 3 },
      { frequency: 3, amplitude: 0.7, intensity: 0.3, octaves: 2 },
      { frequency: 6, amplitude: 0.3, intensity: 0.15, octaves: 1 }
    ],
    maxElevation: 15
  },
  mountainous: {
    name: 'Mountainous',
    description: 'Steep hills and dramatic elevation changes',
    patterns: [
      { frequency: 1, amplitude: 1, intensity: 0.6, octaves: 4 },
      { frequency: 2, amplitude: 0.8, intensity: 0.4, octaves: 3 },
      { frequency: 4, amplitude: 0.4, intensity: 0.2, octaves: 2 }
    ],
    maxElevation: 25
  },
  valley: {
    name: 'Valley',
    description: 'Central valley surrounded by elevated edges',
    patterns: [
      { frequency: 0.8, amplitude: 1, intensity: 0.5, octaves: 2 }
    ],
    maxElevation: 12,
    centerDepression: true
  },
  ridge: {
    name: 'Ridge',
    description: 'Central ridge running through the terrain',
    patterns: [
      { frequency: 1.2, amplitude: 1, intensity: 0.4, octaves: 3 }
    ],
    maxElevation: 18,
    centralRidge: true
  }
};

// Generate custom elevation map with special features
function generateCustomElevationMap(size, preset) {
  let map = generateElevationMap(size, preset.patterns);
  
  // Apply special terrain features
  if (preset.centerDepression) {
    const center = size / 2;
    const radius = size * 0.4;
    
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        const dist = Math.sqrt((x - center) ** 2 + (z - center) ** 2);
        if (dist < radius) {
          const factor = 1 - (dist / radius);
          map[x][z] *= (1 - factor * 0.6); // Create depression
        }
      }
    }
  }
  
  if (preset.centralRidge) {
    const center = size / 2;
    const ridgeWidth = size * 0.15;
    
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        const distFromRidge = Math.abs(z - center);
        if (distFromRidge < ridgeWidth) {
          const ridgeFactor = 1 - (distFromRidge / ridgeWidth);
          map[x][z] = Math.max(map[x][z], ridgeFactor * 0.8);
        }
      }
    }
  }
  
  return map;
}

// Main terrain component
export const TerrainElevation = ({ 
  preset = 'flat', 
  darkMode = false, 
  enabled = true, 
  customPreset = null,
  opacity = 0.9 
}) => {
  const meshRef = useRef();
  
  const terrainData = useMemo(() => {
    if (!enabled) return null;
    
    const currentPreset = customPreset || TERRAIN_PRESETS[preset] || TERRAIN_PRESETS.flat;
    const mapSize = 64; // Resolution of elevation map
    const elevationMap = generateCustomElevationMap(mapSize, currentPreset);
    const geometry = createTerrainGeometry(400, 400, mapSize - 1, mapSize - 1, elevationMap, currentPreset.maxElevation);
    
    return { geometry, maxElevation: currentPreset.maxElevation };
  }, [preset, enabled, customPreset]);
  
  // Optional animation for dynamic terrain
  useFrame((state) => {
    if (meshRef.current && terrainData?.maxElevation > 0) {
      // Subtle breathing effect for terrain
      const time = state.clock.getElapsedTime();
      meshRef.current.material.opacity = opacity + Math.sin(time * 0.5) * 0.05;
    }
  });
  
  if (!enabled || !terrainData) {
    // Return flat ground when terrain is disabled
    return (
      <Plane 
        args={[400, 400]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
      >
        <meshLambertMaterial color={darkMode ? "#2d3748" : "#4a7c59"} />
      </Plane>
    );
  }
  
  return (
    <mesh 
      ref={meshRef}
      geometry={terrainData.geometry} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0, 0]}
      receiveShadow
      castShadow
    >
      <meshLambertMaterial 
        color={darkMode ? "#2d3748" : "#4a7c59"} 
        transparent
        opacity={opacity}
        wireframe={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Terrain controls component for UI
export const TerrainControls = ({ 
  currentPreset, 
  onPresetChange, 
  enabled, 
  onToggle, 
  darkMode,
  opacity,
  onOpacityChange 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Terrain Elevation
        </h3>
        <button
          onClick={onToggle}
          className={`px-3 py-1 text-xs rounded-lg transition-all ${
            enabled
              ? darkMode
                ? 'bg-green-600 text-white'
                : 'bg-green-500 text-white'
              : darkMode
                ? 'bg-gray-600 text-gray-300'
                : 'bg-gray-300 text-gray-700'
          }`}
        >
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>
      
      {enabled && (
        <>
          <div className="space-y-2">
            <label className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Terrain Type
            </label>
            <select
              value={currentPreset}
              onChange={(e) => onPresetChange(e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
                darkMode
                  ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              }`}
            >
              {Object.entries(TERRAIN_PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>
                  {preset.name}
                </option>
              ))}
            </select>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {TERRAIN_PRESETS[currentPreset]?.description}
            </p>
          </div>
          
          <div className="space-y-2">
            <label className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Terrain Opacity: {Math.round(opacity * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default TerrainElevation;