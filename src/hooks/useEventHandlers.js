import { useCallback, startTransition } from 'react';
import { calculateTotalArea, unitToSquareMeters } from '../services/unitConversions';
import { showToast } from '../components/Toast';

/**
 * Event handlers and business logic for the Land Visualizer application
 * Centralizes all user interaction handling and data manipulation
 */
export function useEventHandlers(state) {
  const {
    units,
    subdivisions,
    setUnits,
    setSubdivisions,
    setSelectedSubdivision,
    updateTrackableStateGrouped,
    setDrawingMode,
    setPolylinePoints,
    setActiveTool,
    setShowMeasuringTape,
    setShowAreaCalculator,
    setShowCompassBearing,
    setShowPresetSelector,
    setShowInsertAreaModal,
    setShowAddAreaModal,
    setAreaInputValue,
    setDarkMode
  } = state;

  // Calculate total area across all units
  const totalAreaSquareMeters = calculateTotalArea(units);

  // Handle unit changes
  const handleUnitChange = useCallback((index, field, value) => {
    setUnits(prevUnits => {
      const newUnits = [...prevUnits];
      if (field === 'value') {
        newUnits[index] = { ...newUnits[index], value: parseFloat(value) || 0 };
      } else if (field === 'unit') {
        newUnits[index] = { ...newUnits[index], unit: value };
      }
      return newUnits;
    });
  }, [setUnits]);

  // Add new unit entry
  const addUnit = useCallback(() => {
    setUnits(prevUnits => [...prevUnits, { value: 1000, unit: 'm²' }]);
  }, [setUnits]);

  // Remove unit entry
  const removeUnit = useCallback((index) => {
    setUnits(prevUnits => prevUnits.filter((_, i) => i !== index));
  }, [setUnits]);

  // Handle subdivision updates
  const handleSubdivisionUpdate = useCallback((subdivisionId, updates) => {
    setSubdivisions(prevSubdivisions => {
      return prevSubdivisions.map(sub => 
        sub.id === subdivisionId ? { ...sub, ...updates } : sub
      );
    });
  }, [setSubdivisions]);

  // Handle subdivision selection
  const handleSubdivisionSelect = useCallback((subdivisionId) => {
    const subdivision = subdivisions.find(sub => sub.id === subdivisionId);
    setSelectedSubdivision(subdivision);
  }, [subdivisions, setSelectedSubdivision]);

  // Handle subdivision deletion
  const handleDeleteSubdivision = useCallback((subdivisionId) => {
    setSubdivisions(prevSubdivisions => 
      prevSubdivisions.filter(sub => sub.id !== subdivisionId)
    );
    
    // Clear selection if deleted subdivision was selected
    setSelectedSubdivision(prevSelected => 
      prevSelected?.id === subdivisionId ? null : prevSelected
    );
    
    showToast('Subdivision deleted', 'success');
  }, [setSubdivisions, setSelectedSubdivision]);

  // Handle drawing mode changes
  const handleDrawingModeChange = useCallback((mode) => {
    setDrawingMode(mode);
    setActiveTool(mode);
    
    // Clear polyline points when changing modes
    if (mode !== 'polyline') {
      setPolylinePoints([]);
    }
  }, [setDrawingMode, setActiveTool, setPolylinePoints]);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    startTransition(() => {
      setDarkMode(prev => !prev);
    });
  }, [setDarkMode]);

  // Toggle measuring tape
  const toggleMeasuringTape = useCallback(() => {
    setShowMeasuringTape(prev => {
      const newValue = !prev;
      if (newValue) {
        setShowAreaCalculator(false);
        setShowCompassBearing(false);
        setActiveTool('measure');
      } else {
        setActiveTool(null);
      }
      return newValue;
    });
  }, [setShowMeasuringTape, setShowAreaCalculator, setShowCompassBearing, setActiveTool]);

  // Toggle compass bearing
  const toggleCompassBearing = useCallback(() => {
    setShowCompassBearing(prev => {
      const newValue = !prev;
      if (newValue) {
        setShowMeasuringTape(false);
        setShowAreaCalculator(false);
        setActiveTool('bearing');
      } else {
        setActiveTool(null);
      }
      return newValue;
    });
  }, [setShowCompassBearing, setShowMeasuringTape, setShowAreaCalculator, setActiveTool]);

  // Handle preset selection
  const handlePresetSelect = useCallback((preset) => {
    setUnits([{ value: preset.value, unit: preset.unit }]);
    setShowPresetSelector(false);
    showToast(`Applied preset: ${preset.name}`, 'success');
  }, [setUnits, setShowPresetSelector]);

  // Handle area insertion
  const handleInsertArea = useCallback((value, unit) => {
    const squareMeters = value * unitToSquareMeters[unit];
    const sideLength = Math.sqrt(squareMeters);
    
    const newSubdivision = {
      id: `subdivision-${Date.now()}`,
      type: 'editable-polygon',
      position: { x: 0, z: 0 },
      corners: [
        { id: 'corner-1', x: -sideLength/2, z: -sideLength/2 },
        { id: 'corner-2', x: sideLength/2, z: -sideLength/2 },
        { id: 'corner-3', x: sideLength/2, z: sideLength/2 },
        { id: 'corner-4', x: -sideLength/2, z: sideLength/2 }
      ],
      area: squareMeters,
      label: `Area ${subdivisions.length + 1}`,
      color: `hsl(${(subdivisions.length * 60) % 360}, 70%, 50%)`,
      created: new Date().toISOString(),
      editable: true,
      order: subdivisions.length + 1
    };
    
    setSubdivisions(prev => [...prev, newSubdivision]);
    setShowInsertAreaModal(false);
    setAreaInputValue('');
    showToast('Area inserted successfully', 'success');
  }, [setSubdivisions, subdivisions.length, setShowInsertAreaModal, setAreaInputValue]);

  // Handle area addition
  const handleAddArea = useCallback((value, unit) => {
    setUnits(prev => [...prev, { value: parseFloat(value), unit }]);
    setShowAddAreaModal(false);
    setAreaInputValue('');
    showToast('Area added successfully', 'success');
  }, [setUnits, setShowAddAreaModal, setAreaInputValue]);

  // Create new subdivision
  const createSubdivision = useCallback((type, position, dimensions = {}) => {
    const newSubdivision = {
      id: `subdivision-${Date.now()}`,
      type,
      position,
      ...dimensions,
      label: `${type} ${subdivisions.length + 1}`,
      color: `hsl(${(subdivisions.length * 60) % 360}, 70%, 50%)`,
      created: new Date().toISOString(),
      editable: true,
      order: subdivisions.length + 1
    };
    
    setSubdivisions(prev => [...prev, newSubdivision]);
    return newSubdivision;
  }, [subdivisions.length, setSubdivisions]);

  // Batch update subdivisions (for performance)
  const batchUpdateSubdivisions = useCallback((updates) => {
    updateTrackableStateGrouped({ subdivisions: updates });
  }, [updateTrackableStateGrouped]);

  return {
    // Basic handlers
    handleUnitChange,
    addUnit,
    removeUnit,
    handleSubdivisionUpdate,
    handleSubdivisionSelect,
    handleDeleteSubdivision,
    handleDrawingModeChange,
    
    // UI handlers
    toggleDarkMode,
    toggleMeasuringTape,
    toggleCompassBearing,
    
    // Modal handlers
    handlePresetSelect,
    handleInsertArea,
    handleAddArea,
    
    // Advanced handlers
    createSubdivision,
    batchUpdateSubdivisions,
    
    // Computed values
    totalAreaSquareMeters
  };
}

export default useEventHandlers;