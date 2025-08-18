import { useState, useCallback } from 'react';
import useUndoRedo from './useUndoRedo';

/**
 * Central state management hook for the Land Visualizer application
 * Manages all application state including undo/redo functionality
 */
export function useAppState() {
  // Initialize undo/redo system with tracked state
  const {
    present: trackableState,
    executeWithHistory: updateTrackableState,
    updateGrouped: updateTrackableStateGrouped,
    undo,
    redo,
    canUndo,
    canRedo
  } = useUndoRedo({
    units: [{ value: 5000, unit: 'm²' }],
    subdivisions: [
      {
        id: 'default-square',
        type: 'editable-polygon',
        position: { x: 0, z: 0 }, // Center position
        // Initial 4 corners of a square
        corners: [
          { id: 'corner-1', x: -Math.sqrt(5000)/2, z: -Math.sqrt(5000)/2 }, // Bottom-left
          { id: 'corner-2', x: Math.sqrt(5000)/2, z: -Math.sqrt(5000)/2 },  // Bottom-right
          { id: 'corner-3', x: Math.sqrt(5000)/2, z: Math.sqrt(5000)/2 },   // Top-right
          { id: 'corner-4', x: -Math.sqrt(5000)/2, z: Math.sqrt(5000)/2 }   // Top-left
        ],
        area: 5000,
        label: 'Land Area',
        color: '#3b82f6',
        created: new Date().toISOString(),
        editable: true,
        order: 0 // Keep the base land area at the bottom
      }
    ],
    selectedSubdivision: null
  }, {
    trackedKeys: ['units', 'subdivisions', 'selectedSubdivision'],
    maxHistorySize: 100,
    groupingTimeout: 200
  });

  // Extract trackable state for easier access
  const units = trackableState.units || [];
  const subdivisions = trackableState.subdivisions || [];
  const selectedSubdivision = trackableState.selectedSubdivision;

  // Create wrapper functions for backward compatibility
  const setUnits = useCallback((newUnits) => {
    if (typeof newUnits === 'function') {
      updateTrackableState(prevState => ({ units: newUnits(prevState.units) }));
    } else {
      updateTrackableState({ units: newUnits });
    }
  }, [updateTrackableState]);

  const setSubdivisions = useCallback((newSubdivisions) => {
    if (typeof newSubdivisions === 'function') {
      updateTrackableState(prevState => ({ subdivisions: newSubdivisions(prevState.subdivisions) }));
    } else {
      updateTrackableState({ subdivisions: newSubdivisions });
    }
  }, [updateTrackableState]);

  const setSelectedSubdivision = useCallback((newSelectedSubdivision) => {
    if (typeof newSelectedSubdivision === 'function') {
      updateTrackableState(prevState => ({ selectedSubdivision: newSelectedSubdivision(prevState.selectedSubdivision) }));
    } else {
      updateTrackableState({ selectedSubdivision: newSelectedSubdivision });
    }
  }, [updateTrackableState]);

  // Non-trackable UI state
  const [darkMode, setDarkMode] = useState(false);
  const [drawingMode, setDrawingMode] = useState(null);
  const [polylinePoints, setPolylinePoints] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const [selectedCorner, setSelectedCorner] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [selectedComparison, setSelectedComparison] = useState(null);
  
  // Tool and UI state
  const [showMeasuringTape, setShowMeasuringTape] = useState(false);
  const [showAreaCalculator, setShowAreaCalculator] = useState(false);
  const [showCompassBearing, setShowCompassBearing] = useState(false);
  const [showPresetSelector, setShowPresetSelector] = useState(false);
  const [showAreaConfiguration, setShowAreaConfiguration] = useState(false);
  const [showInsertAreaDropdown, setShowInsertAreaDropdown] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState(false);
  const [isPropertiesPanelExpanded, setIsPropertiesPanelExpanded] = useState(false);
  
  // Modal state
  const [showInsertAreaModal, setShowInsertAreaModal] = useState(false);
  const [showAddAreaModal, setShowAddAreaModal] = useState(false);
  const [areaInputValue, setAreaInputValue] = useState('');
  const [areaInputUnit, setAreaInputUnit] = useState('m²');

  // Performance and camera state
  const [performanceStats, setPerformanceStats] = useState(null);
  const [terrainEnabled, setTerrainEnabled] = useState(false);
  const [terrainSettings, setTerrainSettings] = useState({
    elevationScale: 1.0,
    hillsEnabled: true,
    valleysEnabled: true,
    randomSeed: 42
  });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [cameraTarget, setCameraTarget] = useState({ x: 0, y: 0, z: 0 });
  const [currentZoom, setCurrentZoom] = useState(1);

  // Measurement and drawing state  
  const [measurementData, setMeasurementData] = useState({
    startPoint: null,
    endPoint: null,
    distance: 0,
    bearing: 0
  });
  const [bearingData, setBearingData] = useState({
    startPoint: null,
    endPoint: null,
    bearing: null,
    distance: null
  });
  const [showDimensionLines, setShowDimensionLines] = useState(false);
  const [showAllConversions, setShowAllConversions] = useState(false);
  const [showExpandableComparisons, setShowExpandableComparisons] = useState(false);
  const [comparisonFilter, setComparisonFilter] = useState('all');

  return {
    // Trackable state
    units,
    subdivisions,
    selectedSubdivision,
    setUnits,
    setSubdivisions,
    setSelectedSubdivision,
    
    // Undo/Redo
    undo,
    redo,
    canUndo,
    canRedo,
    updateTrackableState,
    updateTrackableStateGrouped,
    
    // UI State
    darkMode,
    setDarkMode,
    drawingMode,
    setDrawingMode,
    polylinePoints,
    setPolylinePoints,
    selectedObject,
    setSelectedObject,
    selectedCorner,
    setSelectedCorner,
    selectedEdge,
    setSelectedEdge,
    selectedComparison,
    setSelectedComparison,
    
    // Tool State
    showMeasuringTape,
    setShowMeasuringTape,
    showAreaCalculator,
    setShowAreaCalculator,
    showCompassBearing,
    setShowCompassBearing,
    showPresetSelector,
    setShowPresetSelector,
    showAreaConfiguration,
    setShowAreaConfiguration,
    showInsertAreaDropdown,
    setShowInsertAreaDropdown,
    activeTool,
    setActiveTool,
    isLeftSidebarExpanded,
    setIsLeftSidebarExpanded,
    isPropertiesPanelExpanded,
    setIsPropertiesPanelExpanded,
    
    // Modal State
    showInsertAreaModal,
    setShowInsertAreaModal,
    showAddAreaModal,
    setShowAddAreaModal,
    areaInputValue,
    setAreaInputValue,
    areaInputUnit,
    setAreaInputUnit,
    
    // Performance State
    performanceStats,
    setPerformanceStats,
    terrainEnabled,
    setTerrainEnabled,
    terrainSettings,
    setTerrainSettings,
    zoomLevel,
    setZoomLevel,
    cameraTarget,
    setCameraTarget,
    currentZoom,
    setCurrentZoom,
    
    // Measurement State
    measurementData,
    setMeasurementData,
    bearingData,
    setBearingData,
    showDimensionLines,
    setShowDimensionLines,
    showAllConversions,
    setShowAllConversions,
    showExpandableComparisons,
    setShowExpandableComparisons,
    comparisonFilter,
    setComparisonFilter
  };
}

export default useAppState;