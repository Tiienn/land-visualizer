import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

// Import scene components
import EnhancedSubdivision from './EnhancedSubdivision';
import InteractiveCorners from './InteractiveCorners';
import MeasuringTape from './MeasuringTape';
import MeasuringLine3D from './MeasuringLine3D';
import IrregularPolygon3D from './IrregularPolygon3D';
import CompassBearing from './CompassBearing';
import BearingLine3D from './BearingLine3D';
import TerrainElevation from './TerrainElevation';
import DimensionLines from './DimensionLines';
import AreaCalculator from './AreaCalculator';
import SimpleCompass from './SimpleCompass';
import ExpandableVisualComparisons from './ExpandableVisualComparisons';

/**
 * Main 3D Scene component
 * Manages all 3D rendering, lighting, and scene organization
 */
export function Scene({
  // State props
  subdivisions = [],
  selectedSubdivision,
  drawingMode,
  polylinePoints,
  darkMode,
  terrainEnabled,
  terrainSettings,
  totalAreaSquareMeters,
  selectedComparison,
  measurementData,
  bearingData,
  showMeasuringTape,
  showAreaCalculator,
  showCompassBearing,
  showDimensionLines,
  showExpandableComparisons,
  comparisonFilter,
  
  // Event handlers
  onSubdivisionUpdate,
  onSubdivisionSelect,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onMeasurementUpdate,
  onBearingUpdate,
  onUpdateCorner,
  onSelectCorner,
  onSelectEdge,
  
  // UI state
  selectedCorner,
  selectedEdge,
  performanceStats,
  setPerformanceStats
}) {
  const { gl } = useThree();
  const controlsRef = useRef();
  const frameCount = useRef(0);
  const lastPerformanceUpdate = useRef(0);

  // Performance monitoring
  useFrame((state, delta) => {
    frameCount.current++;
    
    // Update performance stats every 60 frames
    if (frameCount.current % 60 === 0) {
      const now = performance.now();
      const fps = 1000 / (delta * 1000);
      
      if (setPerformanceStats) {
        setPerformanceStats({
          fps: Math.round(fps),
          frameTime: Math.round(delta * 1000),
          memoryUsage: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 0,
          subdivisionCount: subdivisions.length,
          lastUpdate: now
        });
      }
      
      lastPerformanceUpdate.current = now;
    }
  });

  // Calculate scene bounds based on subdivisions
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
      }
    });
    
    // Add padding
    const padding = 20;
    return {
      min: { x: minX - padding, z: minZ - padding },
      max: { x: maxX + padding, z: maxZ + padding }
    };
  }, [subdivisions]);

  // Dynamic lighting based on scene size
  const lightingSetup = useMemo(() => {
    const sceneSize = Math.max(
      sceneBounds.max.x - sceneBounds.min.x,
      sceneBounds.max.z - sceneBounds.min.z
    );
    
    return {
      ambientIntensity: darkMode ? 0.4 : 0.6,
      directionalIntensity: darkMode ? 0.8 : 1.0,
      shadowMapSize: sceneSize > 200 ? 2048 : 1024,
      lightPosition: [sceneSize * 0.3, sceneSize * 0.5, sceneSize * 0.3]
    };
  }, [sceneBounds, darkMode]);

  // Handle camera controls
  const handleCameraChange = useCallback(() => {
    if (controlsRef.current) {
      // You can add camera change logic here if needed
    }
  }, []);

  // Setup shadow settings
  useEffect(() => {
    if (gl.shadowMap) {
      gl.shadowMap.enabled = true;
      gl.shadowMap.type = THREE.PCFSoftShadowMap;
    }
  }, [gl]);

  return (
    <>
      {/* Camera Controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI * 0.495}
        minPolarAngle={0.1}
        maxDistance={1000}
        minDistance={5}
        onChange={handleCameraChange}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN
        }}
      />

      {/* Lighting Setup */}
      <ambientLight 
        intensity={lightingSetup.ambientIntensity} 
        color={darkMode ? '#4a5568' : '#ffffff'} 
      />
      <directionalLight
        position={lightingSetup.lightPosition}
        intensity={lightingSetup.directionalIntensity}
        color={darkMode ? '#e2e8f0' : '#ffffff'}
        castShadow
        shadow-mapSize-width={lightingSetup.shadowMapSize}
        shadow-mapSize-height={lightingSetup.shadowMapSize}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-bias={-0.0001}
      />

      {/* Ground and Grid */}
      <Grid
        position={[0, -0.1, 0]}
        args={[200, 200]}
        cellSize={5}
        cellThickness={0.5}
        cellColor={darkMode ? '#4a5568' : '#9ca3af'}
        sectionSize={25}
        sectionThickness={1}
        sectionColor={darkMode ? '#6b7280' : '#6b7280'}
        fadeDistance={150}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
      />

      {/* Ground Plane */}
      <mesh 
        position={[0, -0.2, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[400, 400]} />
        <meshLambertMaterial 
          color={darkMode ? '#1a202c' : '#86efac'}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Main Land Area Visualization */}
      {totalAreaSquareMeters > 0 && (
        <mesh 
          position={[0, 0, 0]} 
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[Math.sqrt(totalAreaSquareMeters), Math.sqrt(totalAreaSquareMeters)]} />
          <meshLambertMaterial
            color="#3b82f6"
            transparent
            opacity={0.3}
          />
        </mesh>
      )}

      {/* Terrain */}
      {terrainEnabled && (
        <TerrainElevation
          enabled={terrainEnabled}
          settings={terrainSettings}
          bounds={sceneBounds}
          darkMode={darkMode}
        />
      )}

      {/* Subdivisions */}
      {subdivisions.map((subdivision) => (
        <group key={subdivision.id}>
          <EnhancedSubdivision
            subdivision={subdivision}
            isSelected={selectedSubdivision?.id === subdivision.id}
            onSelect={onSubdivisionSelect}
            onUpdate={onSubdivisionUpdate}
            darkMode={darkMode}
          />
          
          {/* Interactive Corners */}
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
            showCorners={selectedSubdivision?.id === subdivision.id}
            drawingMode={drawingMode}
          />
        </group>
      ))}

      {/* Drawing Tools */}
      {drawingMode === 'polygon' && (
        <IrregularPolygon3D
          points={polylinePoints}
          isComplete={false}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          darkMode={darkMode}
        />
      )}

      {/* Measurement Tools */}
      {showMeasuringTape && (
        <MeasuringTape
          onMeasurement={onMeasurementUpdate}
          darkMode={darkMode}
        />
      )}

      {measurementData.startPoint && measurementData.endPoint && (
        <MeasuringLine3D
          startPoint={measurementData.startPoint}
          endPoint={measurementData.endPoint}
          distance={measurementData.distance}
          darkMode={darkMode}
        />
      )}

      {/* Compass and Bearing */}
      {showCompassBearing && (
        <CompassBearing
          onBearingUpdate={onBearingUpdate}
          darkMode={darkMode}
        />
      )}

      {bearingData.startPoint && bearingData.endPoint && (
        <BearingLine3D
          startPoint={bearingData.startPoint}
          endPoint={bearingData.endPoint}
          bearing={bearingData.bearing}
          distance={bearingData.distance}
          darkMode={darkMode}
        />
      )}

      {/* Area Calculator */}
      {showAreaCalculator && (
        <AreaCalculator
          darkMode={darkMode}
        />
      )}

      {/* Dimension Lines */}
      {showDimensionLines && selectedSubdivision && (
        <DimensionLines
          subdivision={selectedSubdivision}
          darkMode={darkMode}
        />
      )}

      {/* Compass Widget */}
      <SimpleCompass
        position={[sceneBounds.max.x - 10, 2, sceneBounds.max.z - 10]}
        darkMode={darkMode}
      />

      {/* Visual Comparisons */}
      {showExpandableComparisons && selectedComparison && (
        <ExpandableVisualComparisons
          selectedComparison={selectedComparison}
          totalArea={totalAreaSquareMeters}
          filter={comparisonFilter}
          darkMode={darkMode}
        />
      )}

      {/* Interactive Plane for Drawing */}
      <mesh
        position={[0, 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <planeGeometry args={[500, 500]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}

export default Scene;