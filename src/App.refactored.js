import { useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';

// Import modular hooks and utilities
import { useAppState } from './hooks/useAppState';
import { useEventHandlers } from './hooks/useEventHandlers';
import { useSEO } from './hooks/useSEO';

// Import UI components
import Ribbon from './components/Ribbon';
import LeftSidebar from './components/LeftSidebar';
import PropertiesPanel from './components/PropertiesPanel';
import AreaPresetSelector from './components/AreaPresetSelector';
import { ToastContainer } from './components/Toast';
import KeyboardNavigation from './components/KeyboardShortcuts';
import Scene from './components/Scene';

// Import modal components (to be created)
import AreaInputModal from './components/AreaInputModal';

import './App.css';

/**
 * Main Land Visualizer Component - Refactored
 * Clean, modular architecture with separated concerns
 */
function LandVisualizer() {
  // Centralized state management
  const state = useAppState();
  
  // Event handlers and business logic
  const handlers = useEventHandlers(state);
  
  // SEO management
  useSEO({
    title: 'Land Visualizer - Professional 3D Land Analysis Tool',
    description: 'Visualize, measure, and analyze land areas with our professional 3D tool. Convert between units, create subdivisions, and generate professional reports.',
    canonical: 'https://landvisualizer.com',
    image: 'https://landvisualizer.com/og-image.jpg'
  });

  // Global context menu prevention (right-click rotates camera)
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // 3D Scene event handlers
  const handlePointerDown = useCallback((event) => {
    // Implement pointer down logic for drawing
    console.log('Pointer down:', event);
  }, []);

  const handlePointerMove = useCallback((event) => {
    // Implement pointer move logic for drawing
    console.log('Pointer move:', event);
  }, []);

  const handlePointerUp = useCallback((event) => {
    // Implement pointer up logic for drawing
    console.log('Pointer up:', event);
  }, []);

  const handleMeasurementUpdate = useCallback((measurementData) => {
    state.setMeasurementData(measurementData);
  }, [state.setMeasurementData]);

  const handleBearingUpdate = useCallback((bearingData) => {
    state.setBearingData(bearingData);
  }, [state.setBearingData]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      state.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Main Ribbon Toolbar */}
      <Ribbon
        darkMode={state.darkMode}
        toggleDarkMode={handlers.toggleDarkMode}
        drawingMode={state.drawingMode}
        setDrawingMode={handlers.handleDrawingModeChange}
        showMeasuringTape={state.showMeasuringTape}
        toggleMeasuringTape={handlers.toggleMeasuringTape}
        showAreaCalculator={state.showAreaCalculator}
        setShowAreaCalculator={state.setShowAreaCalculator}
        showCompassBearing={state.showCompassBearing}
        toggleCompassBearing={handlers.toggleCompassBearing}
        setShowPresetSelector={state.setShowPresetSelector}
        terrainEnabled={state.terrainEnabled}
        setTerrainEnabled={state.setTerrainEnabled}
        showDimensionLines={state.showDimensionLines}
        setShowDimensionLines={state.setShowDimensionLines}
        showAllConversions={state.showAllConversions}
        setShowAllConversions={state.setShowAllConversions}
        showExpandableComparisons={state.showExpandableComparisons}
        setShowExpandableComparisons={state.setShowExpandableComparisons}
        comparisonFilter={state.comparisonFilter}
        setComparisonFilter={state.setComparisonFilter}
        units={state.units}
        subdivisions={state.subdivisions}
        canUndo={state.canUndo}
        canRedo={state.canRedo}
        undo={state.undo}
        redo={state.redo}
        setShowInsertAreaModal={state.setShowInsertAreaModal}
        setShowAddAreaModal={state.setShowAddAreaModal}
      />

      {/* Main Content Area */}
      <div className="flex h-screen pt-16">
        {/* Left Sidebar */}
        <LeftSidebar
          units={state.units}
          onUnitChange={handlers.handleUnitChange}
          onAddUnit={handlers.addUnit}
          onRemoveUnit={handlers.removeUnit}
          totalAreaSquareMeters={handlers.totalAreaSquareMeters}
          darkMode={state.darkMode}
          isExpanded={state.isLeftSidebarExpanded}
          setIsExpanded={state.setIsLeftSidebarExpanded}
        />

        {/* 3D Visualization */}
        <div className={`flex-1 transition-all duration-200 ${
          state.isLeftSidebarExpanded ? 'ml-80' : 'ml-20'
        } ${
          state.isPropertiesPanelExpanded ? 'mr-80' : 'mr-20'
        }`}>
          <div className="h-[80vh] min-h-[600px]">
            <Canvas
              camera={{ 
                position: [50, 50, 50], 
                fov: 50,
                near: 0.1,
                far: 2000,
                up: [0, 1, 0]
              }}
              style={{ 
                width: '100%',
                height: '70vh',
                background: state.darkMode ? '#1e293b' : '#87ceeb',
                pointerEvents: 'auto'
              }}
              dpr={[1, 2]}
              performance={{ min: 0.5 }}
              gl={{ preserveDrawingBuffer: true }}
            >
              <Scene
                subdivisions={state.subdivisions}
                selectedSubdivision={state.selectedSubdivision}
                drawingMode={state.drawingMode}
                polylinePoints={state.polylinePoints}
                darkMode={state.darkMode}
                terrainEnabled={state.terrainEnabled}
                terrainSettings={state.terrainSettings}
                totalAreaSquareMeters={handlers.totalAreaSquareMeters}
                selectedComparison={state.selectedComparison}
                measurementData={state.measurementData}
                bearingData={state.bearingData}
                showMeasuringTape={state.showMeasuringTape}
                showAreaCalculator={state.showAreaCalculator}
                showCompassBearing={state.showCompassBearing}
                showDimensionLines={state.showDimensionLines}
                showExpandableComparisons={state.showExpandableComparisons}
                comparisonFilter={state.comparisonFilter}
                onSubdivisionUpdate={handlers.handleSubdivisionUpdate}
                onSubdivisionSelect={handlers.handleSubdivisionSelect}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onMeasurementUpdate={handleMeasurementUpdate}
                onBearingUpdate={handleBearingUpdate}
                onUpdateCorner={handlers.handleSubdivisionUpdate}
                onSelectCorner={state.setSelectedCorner}
                onSelectEdge={state.setSelectedEdge}
                selectedCorner={state.selectedCorner}
                selectedEdge={state.selectedEdge}
                performanceStats={state.performanceStats}
                setPerformanceStats={state.setPerformanceStats}
              />
            </Canvas>
          </div>
        </div>

        {/* Properties Panel */}
        <PropertiesPanel
          selectedSubdivision={state.selectedSubdivision}
          onUpdateSubdivision={handlers.handleSubdivisionUpdate}
          onDeleteSubdivision={handlers.handleDeleteSubdivision}
          selectedCorner={state.selectedCorner}
          selectedEdge={state.selectedEdge}
          darkMode={state.darkMode}
          isExpanded={state.isPropertiesPanelExpanded}
          setIsExpanded={state.setIsPropertiesPanelExpanded}
          drawingMode={state.drawingMode}
          activeTool={state.activeTool}
        />
      </div>

      {/* Footer */}
      <footer className={`border-t transition-colors duration-300 ${
        state.darkMode 
          ? 'bg-gray-800 border-gray-700 text-gray-300' 
          : 'bg-white border-gray-200 text-gray-600'
      } ${
        state.isLeftSidebarExpanded ? 'ml-80' : 'ml-20'
      } ${
        state.isPropertiesPanelExpanded ? 'mr-80' : 'mr-20'
      } transition-all duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-10 text-sm">
            <div className="flex items-center space-x-4">
              <span>© 2024 Land Visualizer</span>
              <span>•</span>
              <span>Professional 3D Land Analysis</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Version 2.0</span>
              <span>•</span>
              <span className="text-xs opacity-75">Powered by Three.js & React</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AreaInputModal
        isOpen={state.showInsertAreaModal}
        onClose={() => state.setShowInsertAreaModal(false)}
        onSubmit={handlers.handleInsertArea}
        title="Insert Area"
        buttonText="Insert Area"
        value={state.areaInputValue}
        setValue={state.setAreaInputValue}
        unit={state.areaInputUnit}
        setUnit={state.setAreaInputUnit}
        darkMode={state.darkMode}
      />
      
      <AreaInputModal
        isOpen={state.showAddAreaModal}
        onClose={() => state.setShowAddAreaModal(false)}
        onSubmit={handlers.handleAddArea}
        title="Add Area"
        buttonText="Add Area"
        value={state.areaInputValue}
        setValue={state.setAreaInputValue}
        unit={state.areaInputUnit}
        setUnit={state.setAreaInputUnit}
        darkMode={state.darkMode}
      />

      {/* Area Preset Selector Modal */}
      {state.showPresetSelector && (
        <AreaPresetSelector
          onSelectPreset={handlers.handlePresetSelect}
          onClose={() => state.setShowPresetSelector(false)}
          darkMode={state.darkMode}
        />
      )}

      {/* Keyboard Navigation */}
      <KeyboardNavigation
        darkMode={state.darkMode}
        toggleMeasuringTape={handlers.toggleMeasuringTape}
        toggleAreaCalculator={() => state.setShowAreaCalculator(prev => !prev)}
        toggleCompassBearing={handlers.toggleCompassBearing}
        toggleTerrain={() => state.setTerrainEnabled(prev => !prev)}
        setDrawingMode={handlers.handleDrawingModeChange}
        drawingMode={state.drawingMode}
        toggleDarkMode={handlers.toggleDarkMode}
        exportToExcel={() => console.log('Export to Excel')}
        undo={state.undo}
        redo={state.redo}
        deleteSelected={() => {
          if (state.selectedSubdivision) {
            handlers.handleDeleteSubdivision(state.selectedSubdivision.id);
          }
        }}
        setUnits={state.setUnits}
      />

      {/* Toast Container */}
      <ToastContainer darkMode={state.darkMode} />
    </div>
  );
}

/**
 * App Router Component
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandVisualizer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;