import React, { useMemo } from 'react';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import TerrainElevation from './TerrainElevation';
import EnhancedSubdivision from './EnhancedSubdivision';
import InteractiveCorners from './InteractiveCorners';
import ComparisonObjectsGroup from './ComparisonObjectsGroup';

/**
 * Adaptive Scene Component
 * Automatically adjusts visual quality based on real-time performance monitoring
 * Provides optimal experience across all hardware configurations
 */
export function AdaptiveScene({ 
  // State props
  subdivisions = [],
  selectedSubdivision,
  drawingMode,
  polylinePoints = [],
  darkMode = false,
  terrainEnabled = true,
  selectedComparison,
  units = [],
  
  // Event handlers
  onSubdivisionUpdate,
  onSubdivisionSelect,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onUpdateCorner,
  onSelectCorner,
  onSelectEdge,
  
  // UI state
  selectedCorner,
  selectedEdge,
  showDimensions = true,
  
  // Performance debugging
  debugPerformance = false
}) {
  const {
    currentLevel,
    qualitySettings,
    metrics,
    score,
    isStable
  } = usePerformanceMonitor({ 
    enableAutoAdjust: true,
    debugMode: debugPerformance 
  });
  
  // Calculate scene bounds for terrain and camera
  const sceneBounds = useMemo(() => {
    if (subdivisions.length === 0) {
      return { min: { x: -50, z: -50 }, max: { x: 50, z: 50 } };
    }
    
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    
    subdivisions.forEach(sub => {
      if (sub.type === 'editable-polygon' && sub.corners) {
        sub.corners.forEach(corner => {
          minX = Math.min(minX, corner.x);
          maxX = Math.max(maxX, corner.x);
          minZ = Math.min(minZ, corner.z);
          maxZ = Math.max(maxZ, corner.z);
        });
      } else if (sub.position) {
        const padding = Math.max(sub.width || 10, sub.height || 10) / 2;
        minX = Math.min(minX, sub.position.x - padding);
        maxX = Math.max(maxX, sub.position.x + padding);
        minZ = Math.min(minZ, sub.position.z - padding);
        maxZ = Math.max(maxZ, sub.position.z + padding);
      }
    });
    
    const padding = 20;
    return {
      min: { x: minX - padding, z: minZ - padding },
      max: { x: maxX + padding, z: maxZ + padding }
    };
  }, [subdivisions]);
  
  // Adaptive lighting based on quality level
  const lightingConfig = useMemo(() => {
    const { lighting } = qualitySettings;
    
    switch (lighting.complexity) {
      case 'high':
        return {
          ambient: { intensity: darkMode ? 0.4 : 0.3, color: darkMode ? '#4a5568' : '#ffffff' },
          directional: {
            position: [100, 100, 50],
            intensity: darkMode ? 1.2 : 1.0,
            color: darkMode ? '#e2e8f0' : '#ffffff',
            castShadow: lighting.shadows,
            shadowMapSize: 2048
          },
          hemisphere: {
            skyColor: darkMode ? '#1e293b' : '#87ceeb',
            groundColor: darkMode ? '#0f172a' : '#90ee90',
            intensity: 0.3
          }
        };
        
      case 'medium':
        return {
          ambient: { intensity: 0.5, color: darkMode ? '#4a5568' : '#ffffff' },
          directional: {
            position: [50, 50, 25],
            intensity: 0.8,
            color: darkMode ? '#e2e8f0' : '#ffffff',
            castShadow: false
          }
        };
        
      case 'low':
      case 'minimal':
      default:
        return {
          ambient: { intensity: 0.6, color: darkMode ? '#4a5568' : '#ffffff' },
          directional: {
            position: [50, 50, 25],
            intensity: 0.8,
            color: darkMode ? '#e2e8f0' : '#ffffff',
            castShadow: false
          }
        };
    }
  }, [qualitySettings, darkMode]);
  
  // Adaptive grid configuration
  const gridConfig = useMemo(() => {
    const { grid } = qualitySettings;
    
    const configs = {
      high: { size: 200, cellSize: 5, sectionSize: 25 },
      medium: { size: 150, cellSize: 10, sectionSize: 50 },
      low: { size: 100, cellSize: 15, sectionSize: 75 },
      minimal: { size: 50, cellSize: 25, sectionSize: 100 }
    };
    
    return configs[grid.resolution] || configs.low;
  }, [qualitySettings]);
  
  // Calculate total area for comparisons
  const totalAreaSquareMeters = useMemo(() => {
    return units.reduce((total, unit) => {
      const unitToSquareMeters = {
        'm²': 1,
        'ft²': 0.092903,
        'hectares': 10000,
        'acres': 4046.86
      };
      return total + (unit.value * (unitToSquareMeters[unit.unit] || 1));
    }, 0);
  }, [units]);
  
  console.log(`🎭 AdaptiveScene: ${currentLevel} mode (Score: ${score.toFixed(0)}, GPU: ${metrics?.gpu.tier})`);
  
  return (
    <>
      
      {/* Adaptive Lighting */}
      <ambientLight 
        intensity={lightingConfig.ambient.intensity}
        color={lightingConfig.ambient.color}
      />
      <directionalLight
        position={lightingConfig.directional.position}
        intensity={lightingConfig.directional.intensity}
        color={lightingConfig.directional.color}
        castShadow={lightingConfig.directional.castShadow}
        shadow-mapSize-width={lightingConfig.directional.shadowMapSize}
        shadow-mapSize-height={lightingConfig.directional.shadowMapSize}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-bias={-0.0001}
      />
      {lightingConfig.hemisphere && (
        <hemisphereLight
          skyColor={lightingConfig.hemisphere.skyColor}
          groundColor={lightingConfig.hemisphere.groundColor}
          intensity={lightingConfig.hemisphere.intensity}
        />
      )}
      
      {/* Adaptive Grid */}
      <Grid
        position={[0, -0.1, 0]}
        args={[gridConfig.size, gridConfig.size]}
        cellSize={gridConfig.cellSize}
        cellThickness={0.5}
        cellColor={darkMode ? '#4a5568' : '#9ca3af'}
        sectionSize={gridConfig.sectionSize}
        sectionThickness={1}
        sectionColor={darkMode ? '#6b7280' : '#6b7280'}
        fadeDistance={gridConfig.size * 0.75}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
      />
      
      {/* Adaptive Ground Plane */}
      <mesh 
        position={[0, -0.2, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow={qualitySettings.lighting.shadows}
      >
        <planeGeometry args={[gridConfig.size * 2, gridConfig.size * 2]} />
        <meshLambertMaterial 
          color={darkMode ? '#1a202c' : '#86efac'}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Adaptive Terrain */}
      {terrainEnabled && qualitySettings.terrain.enabled && (
        <TerrainElevation
          enabled={true}
          preset={qualitySettings.terrain.complexity === 'high' ? 'gentle_hills' : 'flat'}
          opacity={0.9}
          darkMode={darkMode}
          customPreset={qualitySettings.terrain.complexity === 'minimal' ? {
            name: 'Minimal Flat',
            patterns: [{ frequency: 1, amplitude: 0, intensity: 0, octaves: 1 }],
            maxElevation: 0
          } : null}
        />
      )}
      
      {/* Subdivisions with quality-aware rendering */}
      {subdivisions.map((subdivision) => (
        <group key={subdivision.id}>
          <EnhancedSubdivision
            subdivision={subdivision}
            isSelected={selectedSubdivision?.id === subdivision.id}
            onSelect={onSubdivisionSelect}
            onSelectSubdivision={onSubdivisionSelect}
            onUpdateSubdivision={onSubdivisionUpdate}
            darkMode={darkMode}
            drawingMode={drawingMode}
            showDimensions={showDimensions && currentLevel !== 'EMERGENCY'}
          />
          
          {/* Interactive Corners (only in higher quality modes) */}
          {subdivision.type === 'editable-polygon' && currentLevel !== 'EMERGENCY' && (
            <InteractiveCorners
              subdivision={subdivision}
              isSelected={selectedSubdivision?.id === subdivision.id}
              onUpdateSubdivision={onSubdivisionUpdate}
              onSelectSubdivision={onSubdivisionSelect}
              onUpdateCorner={onUpdateCorner}
              onSelectCorner={onSelectCorner}
              onSelectEdge={onSelectEdge}
              selectedCorner={selectedCorner}
              selectedEdge={selectedEdge}
              darkMode={darkMode}
              showCorners={drawingMode === 'select'}
              drawingMode={drawingMode}
            />
          )}
        </group>
      ))}
      
      {/* Visual Comparisons (disabled in performance modes) */}
      {selectedComparison && qualitySettings.effects.enabled && (
        <ComparisonObjectsGroup
          selectedComparison={selectedComparison}
          totalAreaSquareMeters={totalAreaSquareMeters}
          maxObjects={currentLevel === 'FULL' ? 50 : 20}
          darkMode={darkMode}
          showLabel={true}
          scale={currentLevel === 'FULL' ? 1.0 : 0.8}
        />
      )}
      
      {/* Drawing preview and polyline points */}
      {drawingMode === 'polyline' && polylinePoints.length > 0 && (
        <group>
          {polylinePoints.map((point, index) => (
            <mesh
              key={index}
              position={[point.x, 1, point.z]}
            >
              <boxGeometry args={[1, 2, 1]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>
          ))}
          
          {polylinePoints.length > 1 && (
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  array={new Float32Array(polylinePoints.flatMap(p => [p.x, 0.02, p.z]))}
                  count={polylinePoints.length}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#f59e0b" linewidth={3} />
            </line>
          )}
        </group>
      )}
      
      {/* Interactive drawing plane */}
      <mesh
        position={[0, 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <planeGeometry args={[gridConfig.size * 3, gridConfig.size * 3]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Camera Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI * 0.495}
        minPolarAngle={0.1}
        maxDistance={currentLevel === 'EMERGENCY' ? 500 : 1000}
        minDistance={currentLevel === 'EMERGENCY' ? 10 : 5}
        target={[0, 0, 0]}
        mouseButtons={{
          LEFT: THREE.MOUSE.NONE,
          MIDDLE: THREE.MOUSE.PAN,
          RIGHT: THREE.MOUSE.ROTATE
        }}
        enableDamping={currentLevel !== 'EMERGENCY'}
        dampingFactor={0.25}
      />
    </>
  );
}

export default AdaptiveScene;