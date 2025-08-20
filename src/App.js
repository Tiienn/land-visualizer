import React, { useState, useEffect, useCallback, useRef, startTransition } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Plane, Box, Text, Line } from '@react-three/drei';
import { Plus, Minus, Maximize2, Activity, Info, Share2, Copy, Check, Square as SquareIcon, MousePointer, Trash2, Edit3, Save, X, RotateCcw, RotateCw, Moon, Sun, FileDown } from 'lucide-react';
import * as THREE from 'three';
import jsPDF from 'jspdf';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Import modular components
import Ribbon from './components/Ribbon';
import LeftSidebar from './components/LeftSidebar';
import PropertiesPanel from './components/PropertiesPanel';
import AreaPresetSelector from './components/AreaPresetSelector';
import { ToastContainer } from './components/Toast';
import { defaultComparisons } from './services/landCalculations';
import EnhancedSubdivision from './components/EnhancedSubdivision';
import InteractiveCorners from './components/InteractiveCorners';
import KeyboardNavigation from './components/KeyboardShortcuts';
import EnterDimensionsModal from './components/EnterDimensionsModal';

// Import enhanced performance components
import EnhancedCameraController from './components/EnhancedCameraController';
import EnhancedEventHandler from './components/EnhancedEventHandler';
import OptimizedRenderer from './components/OptimizedRenderer';

// Import 3D comparison objects
import ComparisonObjectsGroup from './components/ComparisonObjectsGroup';

// Import undo/redo functionality
import useUndoRedo from './hooks/useUndoRedo';

import './App.css';

// Simple SEO hook to replace React Helmet for better React 19 compatibility
function useSEO(meta) {
  useEffect(() => {
    // Update document title
    if (meta.title) {
      document.title = meta.title;
    }
    
    // Update meta description
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta && meta.description) {
      descriptionMeta.setAttribute('content', meta.description);
    }
    
    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = meta.canonical || window.location.href;
    
    // Update Open Graph tags
    const updateOGTag = (property, content) => {
      let ogTag = document.querySelector(`meta[property="${property}"]`);
      if (!ogTag) {
        ogTag = document.createElement('meta');
        ogTag.setAttribute('property', property);
        document.head.appendChild(ogTag);
      }
      ogTag.setAttribute('content', content);
    };
    
    if (meta.title) updateOGTag('og:title', meta.title);
    if (meta.description) updateOGTag('og:description', meta.description);
    if (meta.image) updateOGTag('og:image', meta.image);
    updateOGTag('og:url', meta.canonical || window.location.href);
    updateOGTag('og:type', 'website');
    
    // Update Twitter Card tags
    const updateTwitterTag = (name, content) => {
      let twitterTag = document.querySelector(`meta[name="${name}"]`);
      if (!twitterTag) {
        twitterTag = document.createElement('meta');
        twitterTag.setAttribute('name', name);
        document.head.appendChild(twitterTag);
      }
      twitterTag.setAttribute('content', content);
    };
    
    updateTwitterTag('twitter:card', 'summary_large_image');
    if (meta.title) updateTwitterTag('twitter:title', meta.title);
    if (meta.description) updateTwitterTag('twitter:description', meta.description);
    if (meta.image) updateTwitterTag('twitter:image', meta.image);
  }, [meta]);
}

// Main Land Visualizer Component
function LandVisualizer() {
  // SEO and expandable content state
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Core state
  const [darkMode, setDarkMode] = useState(false);
  const [drawingMode, setDrawingMode] = useState(null);
  
  // Polyline drawing state
  const [polylinePoints, setPolylinePoints] = useState([]);
  
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

  // Non-trackable state (UI state, temporary state, etc.)
  const [selectedObject, setSelectedObject] = useState(null);
  const [selectedCorner, setSelectedCorner] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  
  // Disable right-click context menu globally (since right-click now rotates camera)
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);
  const [selectedComparison, setSelectedComparison] = useState(null);
  
  // UI state
  const [showAreaCalculator, setShowAreaCalculator] = useState(false);
  const [showPresetSelector, setShowPresetSelector] = useState(false);
  const [showAreaConfiguration, setShowAreaConfiguration] = useState(false);
  const [showInsertAreaDropdown, setShowInsertAreaDropdown] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState(false);
  const [isPropertiesPanelExpanded, setIsPropertiesPanelExpanded] = useState(false);
  
  // Insert Area and Add Area functionality
  const [showInsertAreaModal, setShowInsertAreaModal] = useState(false);
  const [showAddAreaModal, setShowAddAreaModal] = useState(false);
  const [areaInputValue, setAreaInputValue] = useState('');
  const [areaInputUnit, setAreaInputUnit] = useState('m²');

  // Unit conversion factors to square meters
  const unitToSquareMeters = {
    'm²': 1,
    'ft²': 0.092903,
    'hectares': 10000,
    'acres': 4046.86,
    'arpent': 3419, // Traditional French unit
    'perche': 42.21, // Traditional French unit  
    'toise': 3.799 // Traditional French unit (1 toise² = 3.799 m²)
  };

  // Available units for area input
  const availableUnits = [
    { value: 'm²', label: 'Square Meters (m²)' },
    { value: 'ft²', label: 'Square Feet (ft²)' },
    { value: 'hectares', label: 'Hectares' },
    { value: 'acres', label: 'Acres' },
    { value: 'arpent', label: 'Arpent (Traditional)' },
    { value: 'perche', label: 'Perche (Traditional)' },
    { value: 'toise', label: 'Toise (Traditional)' }
  ];
  
  // Contextual function box state
  const [activeFunction, setActiveFunction] = useState(null);
  const [functionBoxData, setFunctionBoxData] = useState(null);
  
  // Measuring state
  const [bearings, setBearings] = useState([]);
  
  // Terrain state
  const [terrainEnabled, setTerrainEnabled] = useState(false);
  const [terrainPreset, setTerrainPreset] = useState('hills');
  const [terrainOpacity, setTerrainOpacity] = useState(0.5);
  
  // Performance monitoring state
  const [performanceStats, setPerformanceStats] = useState({
    fps: 60,
    quality: 1.0,
    isInteracting: false
  });
  
  // Manual input state
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualDimensions, setManualDimensions] = useState({ width: '', length: '', unit: 'm' });
  
  // Dimension display state
  const [showDimensions, setShowDimensions] = useState(true);
  
  // Zoom and camera state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [cameraTarget, setCameraTarget] = useState(new THREE.Vector3(0, 0, 0));
  const [currentZoom, setCurrentZoom] = useState(1);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingStart, setDrawingStart] = useState(null);
  const [drawingCurrent, setDrawingCurrent] = useState(null);
  const [drawingPreview, setDrawingPreview] = useState(null);
  
  
  
  // Comparison options for visual reference
  const comparisonOptions = [
    { id: 'football-field', name: 'Football Field', area: 5351, unit: 'm²', color: '#22c55e' },
    { id: 'basketball-court', name: 'Basketball Court', area: 420, unit: 'm²', color: '#f97316' },
    { id: 'tennis-court', name: 'Tennis Court', area: 261, unit: 'm²', color: '#3b82f6' },
    { id: 'parking-space', name: 'Parking Space', area: 12.5, unit: 'm²', color: '#8b5cf6' },
    { id: 'house-average', name: 'Average House', area: 150, unit: 'm²', color: '#ef4444' }
  ];

  // Calculate total area
  const totalAreaInSqM = units.reduce((total, unit) => {
    if (unit.unit === 'm²') return total + unit.value;
    if (unit.unit === 'ft²') return total + (unit.value * 0.092903);
    if (unit.unit === 'hectares') return total + (unit.value * 10000);
    if (unit.unit === 'acres') return total + (unit.value * 4046.86);
    return total;
  }, 0);

  // Auto-select default subdivision when switching to select mode
  // Smart auto-selection for Select Mode: automatically select subdivision and first corner
  useEffect(() => {
    if (drawingMode === 'select') {
      // Auto-select subdivision if none selected
      if (!selectedSubdivision) {
        const defaultSubdivision = subdivisions.find(s => s.id === 'default-square');
        if (defaultSubdivision) {
          setSelectedSubdivision(defaultSubdivision);
          
          // Auto-select first corner to enable Corner Controls immediately
          if (defaultSubdivision.corners && defaultSubdivision.corners.length > 0 && !selectedCorner) {
            setSelectedCorner(defaultSubdivision.corners[0]);
          }
        }
      } 
      // If subdivision is selected but no corner is selected, auto-select first corner
      else if (selectedSubdivision && !selectedCorner) {
        const subdivision = subdivisions.find(s => s.id === selectedSubdivision.id || s.id === selectedSubdivision);
        if (subdivision && subdivision.corners && subdivision.corners.length > 0) {
          setSelectedCorner(subdivision.corners[0]);
        }
      }
    }
    // Clear corner selection when leaving select mode to prevent stale selections
    else if (selectedCorner) {
      setSelectedCorner(null);
    }
  }, [drawingMode, selectedSubdivision, subdivisions, selectedCorner]);

  // Event handlers

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const toggleDimensions = useCallback(() => {
    setShowDimensions(prev => !prev);
  }, []);

  const toggleLeftSidebar = useCallback(() => {
    setIsLeftSidebarExpanded(prev => !prev);
  }, []);

  // Insert Area: Replace the default blue subdivision with user's custom area
  const handleInsertArea = useCallback(() => {
    if (!areaInputValue || isNaN(areaInputValue) || parseFloat(areaInputValue) <= 0) {
      alert('Please enter a valid area value');
      return;
    }

    const inputArea = parseFloat(areaInputValue);
    const areaInSquareMeters = inputArea * unitToSquareMeters[areaInputUnit];
    
    // Calculate square dimensions (assuming square shape)
    const sideLength = Math.sqrt(areaInSquareMeters);
    
    // Update the default subdivision and units (both trackable)
    updateTrackableState({
      subdivisions: subdivisions.map(subdivision => 
        subdivision.id === 'default-square' 
          ? {
              ...subdivision,
              // Update corners for square shape based on new area
              corners: [
                { id: 'corner-1', x: -sideLength/2, z: -sideLength/2 }, // Bottom-left
                { id: 'corner-2', x: sideLength/2, z: -sideLength/2 },  // Bottom-right
                { id: 'corner-3', x: sideLength/2, z: sideLength/2 },   // Top-right
                { id: 'corner-4', x: -sideLength/2, z: sideLength/2 }   // Top-left
              ],
              area: areaInSquareMeters,
              label: `${inputArea} ${areaInputUnit}`
            }
          : subdivision
      ),
      units: [{ value: areaInSquareMeters, unit: 'm²' }]
    });
    
    // Auto-trigger Unit Metrics panel
    setActiveTool('unit-metrics');
    setIsPropertiesPanelExpanded(true);
    
    // Close modal and reset values
    setShowInsertAreaModal(false);
    setAreaInputValue('');
    setAreaInputUnit('m²');
  }, [areaInputValue, areaInputUnit, unitToSquareMeters, updateTrackableState, subdivisions, setActiveTool, setIsPropertiesPanelExpanded]);

  // Add Area: Add additional area to existing total
  const handleAddArea = useCallback(() => {
    if (!areaInputValue || isNaN(areaInputValue) || parseFloat(areaInputValue) <= 0) {
      alert('Please enter a valid area value');
      return;
    }

    const inputArea = parseFloat(areaInputValue);
    const additionalAreaInSquareMeters = inputArea * unitToSquareMeters[areaInputUnit];
    
    // Get current total area
    const currentDefaultSubdivision = subdivisions.find(s => s.id === 'default-square');
    const currentTotalArea = currentDefaultSubdivision ? currentDefaultSubdivision.area : 5000;
    const newTotalArea = currentTotalArea + additionalAreaInSquareMeters;
    
    // Calculate new square dimensions
    const newSideLength = Math.sqrt(newTotalArea);
    
    // Update subdivisions and units (both trackable)
    updateTrackableState({
      subdivisions: subdivisions.map(subdivision => 
        subdivision.id === 'default-square' 
          ? {
              ...subdivision,
              // Update corners for square shape based on new total area
              corners: [
                { id: 'corner-1', x: -newSideLength/2, z: -newSideLength/2 }, // Bottom-left
                { id: 'corner-2', x: newSideLength/2, z: -newSideLength/2 },  // Bottom-right
                { id: 'corner-3', x: newSideLength/2, z: newSideLength/2 },   // Top-right
                { id: 'corner-4', x: -newSideLength/2, z: newSideLength/2 }   // Top-left
              ],
              area: newTotalArea,
              label: `Total: ${newTotalArea.toFixed(0)} m²`
            }
          : subdivision
      ),
      units: [...units, { value: additionalAreaInSquareMeters, unit: 'm²' }]
    });
    
    // Close modal and reset values
    setShowAddAreaModal(false);
    setAreaInputValue('');
    setAreaInputUnit('m²');
  }, [areaInputValue, areaInputUnit, unitToSquareMeters, subdivisions, units, updateTrackableState]);

  // Handle preset selection
  const handlePresetSelect = useCallback((preset) => {
    const { area, dimensions, name } = preset;
    
    // Update subdivisions and units (both trackable)
    updateTrackableState({
      subdivisions: subdivisions.map(subdivision => 
        subdivision.id === 'default-square' 
          ? {
              ...subdivision,
              // Update corners for rectangle shape based on preset dimensions
              corners: [
                { id: 'corner-1', x: -dimensions.width/2, z: -dimensions.length/2 }, // Bottom-left
                { id: 'corner-2', x: dimensions.width/2, z: -dimensions.length/2 },  // Bottom-right
                { id: 'corner-3', x: dimensions.width/2, z: dimensions.length/2 },   // Top-right
                { id: 'corner-4', x: -dimensions.width/2, z: dimensions.length/2 }   // Top-left
              ],
              area: area,
              label: name
            }
          : subdivision
      ),
      units: [{ value: area, unit: 'm²' }]
    });
    
    // Close preset selector
    setShowPresetSelector(false);
  }, [updateTrackableState, subdivisions]);

  // Handle preview from dimensions modal
  const handlePreviewFromDimensions = useCallback((previewData) => {
    if (previewData === null) {
      // Clear preview
      setDrawingPreview(null);
      return;
    }
    
    // Set the preview data - this will be rendered in the 3D scene
    setDrawingPreview({
      ...previewData,
      id: 'dimensions-preview'
    });
  }, []);

  // Handle creating subdivision from dimensions modal
  const handleCreateSubdivisionFromDimensions = useCallback((dimensionData) => {
    const { shape, dimensions, name, area } = dimensionData;
    
    // Convert area from square meters to appropriate scale for 3D scene
    const sceneArea = area; // Area is already in square meters
    
    // Calculate dimensions for the subdivision based on shape
    let width, height;
    if (shape === 'rectangle') {
      // Convert linear dimensions to meters and use them directly
      const linearFactor = dimensions.linearUnit === 'm' ? 1 : (dimensions.linearUnit === 'ft' ? 0.3048 : 0.9144);
      width = parseFloat(dimensions.width) * linearFactor;
      height = parseFloat(dimensions.height) * linearFactor;
    } else if (shape === 'square') {
      // For squares, width and height are the same
      const linearFactor = dimensions.linearUnit === 'm' ? 1 : (dimensions.linearUnit === 'ft' ? 0.3048 : 0.9144);
      const sideLength = parseFloat(dimensions.width) * linearFactor;
      width = sideLength;
      height = sideLength;
    } else if (shape === 'circle') {
      // For circles, create a square bounding box
      const linearFactor = dimensions.linearUnit === 'm' ? 1 : (dimensions.linearUnit === 'ft' ? 0.3048 : 0.9144);
      const radius = parseFloat(dimensions.radius) * linearFactor;
      width = radius * 2;
      height = radius * 2;
    }

    const newSubdivision = {
      id: `subdivision-${Date.now()}`,
      type: shape,
      position: { x: 0, z: 0 }, // Will be positioned via click-to-place
      width,
      height,
      radius: shape === 'circle' ? parseFloat(dimensions.radius) * (dimensions.linearUnit === 'm' ? 1 : (dimensions.linearUnit === 'ft' ? 0.3048 : 0.9144)) : undefined,
      area: sceneArea,
      label: name,
      color: `hsl(${(subdivisions.length * 137.5) % 360}, 70%, 50%)`,
      created: new Date().toISOString(),
      editable: true,
      fromDimensions: true, // Flag to indicate this was created from dimensions
      originalDimensions: dimensions // Store original dimension data
    };

    // Add to subdivisions using trackable state
    updateTrackableState({
      subdivisions: [...subdivisions, newSubdivision]
    });
    
    // TODO: Implement click-to-place functionality
    // For now, just position at center
    console.log('Created subdivision from dimensions:', newSubdivision);
  }, [subdivisions, updateTrackableState]);

  // Layer management functions with undo/redo support
  const handleUpdateSubdivision = useCallback((layerId, updates) => {
    updateTrackableState({
      subdivisions: subdivisions.map(subdivision => 
        subdivision.id === layerId 
          ? { ...subdivision, ...updates }
          : subdivision
      )
    });
  }, [updateTrackableState, subdivisions]);

  const handleDeleteSubdivision = useCallback((layerId) => {
    const newSubdivisions = subdivisions.filter(subdivision => subdivision.id !== layerId);
    const newSelectedSubdivision = selectedSubdivision?.id === layerId ? null : selectedSubdivision;
    
    updateTrackableState({
      subdivisions: newSubdivisions,
      selectedSubdivision: newSelectedSubdivision
    });
  }, [updateTrackableState, subdivisions, selectedSubdivision]);

  const handleSelectSubdivision = useCallback((subdivision) => {
    // Selection changes are not typically undoable, but we'll make them undoable for consistency
    updateTrackableState({
      selectedSubdivision: subdivision
    });
  }, [updateTrackableState]);


  // Add measurement functions

  // Polyline drawing functions
  const finishPolylineDrawing = useCallback(() => {
    if (polylinePoints.length >= 3) {
      // Calculate area of polyline using shoelace formula
      const calculatePolylineArea = (points) => {
        let area = 0;
        const n = points.length;
        for (let i = 0; i < n; i++) {
          const j = (i + 1) % n;
          area += points[i].x * points[j].z;
          area -= points[j].x * points[i].z;
        }
        return Math.abs(area) / 2;
      };
      
      const area = calculatePolylineArea(polylinePoints);
      
      // Calculate centroid for positioning
      const centroid = polylinePoints.reduce(
        (acc, point) => ({ x: acc.x + point.x, z: acc.z + point.z }),
        { x: 0, z: 0 }
      );
      centroid.x /= polylinePoints.length;
      centroid.z /= polylinePoints.length;
      
      // Create a subdivision instead of replacing the main land area
      const newSubdivision = {
        id: Date.now(),
        points: polylinePoints,
        position: centroid,
        area: area,
        label: `Polyline Area ${subdivisions.length + 1}`,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        type: 'polyline'
      };
      
      updateTrackableState({
        subdivisions: [...subdivisions, newSubdivision]
      });
    }
    setPolylinePoints([]);
    setDrawingMode(null);
  }, [polylinePoints, subdivisions, updateTrackableState]);

  const addPolylinePoint = useCallback((x, z) => {
    // Check if clicking on an existing point to close the shape
    const clickThreshold = 3; // Distance threshold for clicking on existing points
    const existingPointIndex = polylinePoints.findIndex(point => {
      const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.z - z, 2));
      return distance < clickThreshold;
    });
    
    if (existingPointIndex !== -1 && polylinePoints.length >= 3) {
      // Close the shape by finishing the polyline
      finishPolylineDrawing();
      return;
    }
    
    const newPoint = { x, z };
    setPolylinePoints([...polylinePoints, newPoint]);
  }, [polylinePoints, finishPolylineDrawing]);

  const addBearing = useCallback((bearing) => {
    setBearings(prev => [...prev, { ...bearing, id: Date.now() }]);
  }, []);

  // Corner management functions with undo/redo support
  const addCornerToDefaultSubdivision = useCallback(() => {
    const defaultSub = subdivisions.find(s => s.id === 'default-square');
    if (!defaultSub || !selectedCorner) return;

    const corners = defaultSub.corners;
    const selectedCornerIndex = corners.findIndex(c => c.id === selectedCorner.id);
    if (selectedCornerIndex === -1) return;
    
    const nextIndex = (selectedCornerIndex + 1) % corners.length;
    
    // Calculate midpoint between selected corner and next corner
    const corner1 = corners[selectedCornerIndex];
    const corner2 = corners[nextIndex];
    const midX = (corner1.x + corner2.x) / 2;
    const midZ = (corner1.z + corner2.z) / 2;
    
    const newCorner = {
      id: `corner-${Date.now()}`,
      x: midX,
      z: midZ
    };
    
    // Insert new corner after the selected corner
    const newCorners = [
      ...corners.slice(0, nextIndex),
      newCorner,
      ...corners.slice(nextIndex)
    ];
    
    updateTrackableState({
      subdivisions: subdivisions.map(sub => 
        sub.id === 'default-square' 
          ? { ...sub, corners: newCorners }
          : sub
      )
    });
    
    // Auto-select the newly added corner for continued editing
    setSelectedCorner(newCorner);
  }, [updateTrackableState, subdivisions, selectedCorner]);

  const deleteCornerFromDefaultSubdivision = useCallback(() => {
    const defaultSub = subdivisions.find(s => s.id === 'default-square');
    if (!defaultSub || !selectedCorner || defaultSub.corners.length <= 3) return;

    const selectedCornerIndex = defaultSub.corners.findIndex(c => c.id === selectedCorner.id);
    const newCorners = defaultSub.corners.filter(corner => corner.id !== selectedCorner.id);
    
    updateTrackableState({
      subdivisions: subdivisions.map(sub => 
        sub.id === 'default-square' 
          ? { ...sub, corners: newCorners }
          : sub
      )
    });
    
    // Smart corner selection after deletion: maintain Corner Controls accessibility
    if (newCorners.length > 0) {
      // Select the corner at the same index, or the last corner if we deleted the last one
      const nextSelectedIndex = Math.min(selectedCornerIndex, newCorners.length - 1);
      setSelectedCorner(newCorners[nextSelectedIndex]);
    } else {
      setSelectedCorner(null);
    }
  }, [updateTrackableState, subdivisions, selectedCorner]);

  const updateCornerPosition = useCallback((cornerId, newPosition) => {
    // Use grouped updates for real-time corner dragging to create single undo point
    updateTrackableStateGrouped({
      subdivisions: subdivisions.map(sub => 
        sub.id === 'default-square' 
          ? { 
              ...sub, 
              corners: sub.corners.map(corner => 
                corner.id === cornerId 
                  ? { ...corner, x: newPosition.x, z: newPosition.z }
                  : corner
              )
            }
          : sub
      )
    });
  }, [updateTrackableStateGrouped, subdivisions]);

  // Keyboard shortcuts for corner management
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete key for removing corners
      if (e.key === 'Delete' && selectedCorner && drawingMode === 'select') {
        e.preventDefault();
        deleteCornerFromDefaultSubdivision();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedCorner, drawingMode, deleteCornerFromDefaultSubdivision]);

  // Selection handlers
  const handleObjectSelection = useCallback((event) => {
    
    // Only handle selection in normal mode (not in drawing mode)
    if (drawingMode && drawingMode !== 'select') {
      return;
    }
    
    // Check if left-click
    if (event.nativeEvent && event.nativeEvent.button !== 0) {
      return;
    }
    
    // Find what was clicked using raycasting
    const intersectedObject = event.eventObject;
    
    if (intersectedObject) {
      // Check if it's a subdivision
      const subdivision = subdivisions.find(sub => 
        intersectedObject.userData && intersectedObject.userData.subdivisionId === sub.id
      );
      
      if (subdivision) {
        handleSelectSubdivision(subdivision);
        setSelectedObject(null);
      } else {
        // Clear selection if clicking on empty space
        setSelectedSubdivision(null);
        setSelectedObject(null);
      }
    } else {
      // Clear selection if no object was found
      setSelectedSubdivision(null);
      setSelectedObject(null);
    }
  }, [drawingMode, subdivisions, handleSelectSubdivision]);

  // Drawing mode handlers
  const handleDrawingModeChange = useCallback((mode) => {
    setDrawingMode(mode);
    setIsDrawing(false);
    setDrawingStart(null);
    setDrawingCurrent(null);
    setDrawingPreview(null);
    // Clear polyline points when changing drawing modes
    setPolylinePoints([]);
  }, []);

  // Infinite Grid Component
  const InfiniteGrid = React.memo(({ cellSize, sectionSize, gridSize, darkMode, camera }) => {
    const gridRef = useRef();
    
    useFrame(() => {
      if (gridRef.current && camera) {
        // Update grid position to follow camera (for infinite effect)
        const cameraX = Math.round(camera.position.x / cellSize) * cellSize;
        const cameraZ = Math.round(camera.position.z / cellSize) * cellSize;
        gridRef.current.position.set(cameraX, 0, cameraZ);
      }
    });

    return (
      <group ref={gridRef}>
        <Grid
          args={[gridSize, gridSize]}
          cellSize={cellSize}
          cellThickness={0.5}
          cellColor={darkMode ? '#374151' : '#e5e7eb'}
          sectionSize={sectionSize}
          sectionThickness={1}
          sectionColor={darkMode ? '#6b7280' : '#9ca3af'}
          fadeDistance={gridSize}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />
      </group>
    );
  });

  // Enhanced drawing handlers with performance optimization
  const handlePointerDown = useCallback((event) => {
    console.log('=== RECTANGLE DRAWING DEBUG ===');
    console.log('handlePointerDown called', { drawingMode, event });
    
    if (!drawingMode || drawingMode === 'select') {
      console.log('Drawing cancelled - wrong mode', { drawingMode });
      return;
    }
    
    // Only handle left-click events (button 0)
    if (event.nativeEvent && event.nativeEvent.button !== 0) {
      return;
    }
    
    // Get 3D world position from Three.js intersection
    const point = { x: event.point.x, z: event.point.z };
    
    if (drawingMode === 'polyline') {
      // Add point to polyline
      addPolylinePoint(point.x, point.z);
      return;
    }
    
    setIsDrawing(true);
    setDrawingStart(point);
    setDrawingCurrent(point);
  }, [drawingMode, addPolylinePoint]);

  const handlePointerMove = useCallback((event) => {
    if (!isDrawing || !drawingStart || !drawingMode) return;
    
    // Get 3D world position from Three.js intersection
    const point = { x: event.point.x, z: event.point.z };
    
    // Update both current position and preview in a single batch
    if (drawingMode === 'rectangle') {
      const width = Math.abs(point.x - drawingStart.x);
      const height = Math.abs(point.z - drawingStart.z);
      const centerX = (drawingStart.x + point.x) / 2;
      const centerZ = (drawingStart.z + point.z) / 2;
      
      // Batch state updates for better performance
      startTransition(() => {
        setDrawingCurrent(point);
        // Only set preview if we're still in drawing mode
        if (drawingMode === 'rectangle') {
          setDrawingPreview({
            type: 'rectangle',
            position: { x: centerX, z: centerZ },
            width,
            height,
            area: width * height
          });
        }
      });
    }
  }, [drawingMode, drawingStart, isDrawing]);

  const handlePointerUp = useCallback((event) => {
    if (!isDrawing || !drawingStart || !drawingCurrent) return;
    
    // Only handle left-click release events (button 0)
    if (event.nativeEvent && event.nativeEvent.button !== 0) return;
    
    if (drawingMode === 'rectangle') {
      const width = Math.abs(drawingCurrent.x - drawingStart.x);
      const height = Math.abs(drawingCurrent.z - drawingStart.z);
      
      if (width > 1 && height > 1) { // Minimum size threshold
        const centerX = (drawingStart.x + drawingCurrent.x) / 2;
        const centerZ = (drawingStart.z + drawingCurrent.z) / 2;
        const area = width * height;
        
        // Calculate layer number for naming (excluding default land area)
        const layerNumber = subdivisions.filter(s => s.id !== 'default-square').length + 1;
        
        // Calculate the highest order for new layer to be on top
        const existingOrders = subdivisions.filter(s => s.id !== 'default-square').map(s => s.order || 0);
        const maxOrder = existingOrders.length > 0 ? Math.max(...existingOrders) : 0;
        
        const newSubdivision = {
          id: `layer-${Date.now()}`,
          type: 'rectangle',
          position: { x: centerX, z: centerZ },
          width,
          height,
          area,
          label: `Layer ${layerNumber}`,
          color: `hsl(${(layerNumber * 137.5) % 360}, 70%, 50%)`,
          created: new Date().toISOString(),
          editable: true,
          visible: true,
          isLayer: true, // Mark as user-created layer
          order: maxOrder + 1 // New layers appear on top
        };
        
        console.log('=== CREATING NEW RECTANGLE SUBDIVISION ===');
        console.log('New subdivision:', newSubdivision);
        console.log('Subdivision type:', newSubdivision.type);
        console.log('Current subdivisions count:', subdivisions.length);
        
        // Use startTransition to batch all state updates together
        startTransition(() => {
          // Clear all drawing states first (non-trackable state)
          setDrawingPreview(null);
          setIsDrawing(false);
          setDrawingStart(null);
          setDrawingCurrent(null);
          setDrawingMode(null);
          
          // Add the new subdivision (trackable state)
          updateTrackableState({
            subdivisions: [...subdivisions, newSubdivision]
          });
          
          console.log('Subdivision added to state, new count should be:', subdivisions.length + 1);
        });
        
        // Additional safeguard: Clear preview again after a short delay to handle any race conditions
        setTimeout(() => {
          setDrawingPreview(null);
        }, 50);
        
        // Return early since we've handled all state updates
        return;
      }
    }
    
    // Reset drawing state
    setIsDrawing(false);
    setDrawingStart(null);
    setDrawingCurrent(null);
    setDrawingPreview(null);
  }, [drawingMode, drawingCurrent, drawingStart, isDrawing, subdivisions, updateTrackableState]);

  // Clean OrbitControls - no left-click functionality, no auto-focus
  const CleanOrbitControls = () => {
    const controlsRef = useRef();
    
    useEffect(() => {
      if (controlsRef.current) {
        const controls = controlsRef.current;
        // Disable automatic target updates that cause centering
        controls.autoRotate = false;
        controls.enablePan = true;
        controls.enableZoom = true;
        controls.enableRotate = true;
        
        // Override the focus method to prevent auto-centering
        controls.focus = () => {
          // Do nothing - prevent auto-focusing on objects
        };
      }
    }, []);
    
    return (
      <OrbitControls 
        ref={controlsRef}
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.25}
        rotateSpeed={0.5}
        panSpeed={0.8}
        zoomSpeed={0.6}
        minDistance={10}
        maxDistance={300}
        maxPolarAngle={Math.PI / 2.1}
        screenSpacePanning={false}
        target={[0, 0, 0]} // Fix the target to center
        mouseButtons={{
          LEFT: THREE.MOUSE.NONE, // No left-click function
          MIDDLE: THREE.MOUSE.PAN,
          RIGHT: THREE.MOUSE.ROTATE
        }}
      />
    );
  };

  // Infinite Canvas 3D Scene Component - Optimized
  const Scene = ({ 
    onPointerDown, 
    onPointerMove, 
    onPointerUp 
  }) => {
    const selectedComparisonData = comparisonOptions.find(c => c.id === selectedComparison);
    const { camera } = useThree();
    
    // Memoized and throttled grid scaling based on zoom level
    const cameraDistance = React.useMemo(() => 
      Math.sqrt(camera.position.x ** 2 + camera.position.y ** 2 + camera.position.z ** 2),
      [camera.position.x, camera.position.y, camera.position.z]
    );
    
    const gridProps = React.useMemo(() => {
      // Dynamic scaling: closer = smaller grid cells, farther = larger grid cells
      if (cameraDistance < 50) return { cellSize: 1, sectionSize: 10, gridSize: 500 };
      if (cameraDistance < 200) return { cellSize: 5, sectionSize: 25, gridSize: 1000 };
      if (cameraDistance < 1000) return { cellSize: 25, sectionSize: 100, gridSize: 5000 };
      return { cellSize: 100, sectionSize: 500, gridSize: 20000 };
    }, [cameraDistance]);
    
    
    return (
      <>
        {/* Enhanced Lighting System */}
        <ambientLight intensity={darkMode ? 0.4 : 0.3} />
        <directionalLight 
          position={[500, 500, 200]} 
          intensity={darkMode ? 1.2 : 1.0} 
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={2000}
          shadow-camera-left={-500}
          shadow-camera-right={500}
          shadow-camera-top={500}
          shadow-camera-bottom={-500}
        />
        <directionalLight position={[-200, 200, -200]} intensity={darkMode ? 0.6 : 0.4} />
        <hemisphereLight
          skyColor={darkMode ? '#1e293b' : '#87ceeb'}
          groundColor={darkMode ? '#0f172a' : '#90ee90'}
          intensity={0.3}
        />
        
        {/* Infinite Ground Plane - BELOW everything */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <planeGeometry args={[gridProps.gridSize * 2, gridProps.gridSize * 2]} />
          <meshLambertMaterial 
            color={darkMode ? "#1f2937" : "#16a34a"}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        {/* Dynamic Infinite Grid System */}
        <InfiniteGrid 
          cellSize={gridProps.cellSize}
          sectionSize={gridProps.sectionSize}
          gridSize={gridProps.gridSize}
          darkMode={darkMode}
          camera={camera}
        />

        {/* All subdivisions including default blue area */}
        {subdivisions.map((subdivision) => (
          <EnhancedSubdivision
            key={subdivision.id}
            subdivision={subdivision}
            darkMode={darkMode}
            showDimensions={showDimensions}
            drawingMode={drawingMode}
            isSelected={selectedSubdivision?.id === subdivision.id}
            onSelect={handleObjectSelection}
            onSelectSubdivision={handleSelectSubdivision}
            onUpdateSubdivision={handleUpdateSubdivision}
            onDeleteSubdivision={handleDeleteSubdivision}
          />
        ))}

        {/* Interactive Corners for editable polygons */}
        {subdivisions.map(subdivision => 
          subdivision.type === 'editable-polygon' && (
            <InteractiveCorners
              key={`corners-${subdivision.id}`}
              subdivision={subdivision}
              isSelected={selectedSubdivision?.id === subdivision.id}
              onUpdateSubdivision={handleUpdateSubdivision}
              onSelectSubdivision={handleSelectSubdivision}
              onUpdateCorner={updateCornerPosition}
              onSelectCorner={setSelectedCorner}
              onSelectEdge={setSelectedEdge}
              selectedCorner={selectedCorner}
              selectedEdge={selectedEdge}
              darkMode={darkMode}
              showCorners={drawingMode === 'select'}
              drawingMode={drawingMode}
            />
          )
        )}
        
        {/* Drawing preview */}
        {drawingPreview && (
          <EnhancedSubdivision
            subdivision={{
              ...drawingPreview,
              id: 'preview',
              label: 'Preview',
              color: '#fbbf24',
              editable: false
            }}
            darkMode={darkMode}
            showDimensions={true}
            drawingMode={drawingMode}
          />
        )}

        {/* Drawing plane for rectangle mode */}
        {drawingMode === 'rectangle' && (
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, 0.15, 0]} 
            visible={false}
            onPointerDown={(event) => {
              if (event.nativeEvent.button === 0) {
                event.stopPropagation();
                event.nativeEvent.stopPropagation();
                onPointerDown(event);
              }
            }}
            onPointerMove={(event) => {
              if (isDrawing) {
                event.stopPropagation();
                event.nativeEvent.stopPropagation();
                onPointerMove(event);
              }
            }}
            onPointerUp={(event) => {
              if (isDrawing && event.nativeEvent.button === 0) {
                event.stopPropagation();
                event.nativeEvent.stopPropagation();
                onPointerUp(event);
              }
            }}
          >
            <planeGeometry args={[gridProps.gridSize * 1.5, gridProps.gridSize * 1.5]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        )}

        {/* Drawing plane for polyline mode */}
        {drawingMode === 'polyline' && (
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, 0.15, 0]} 
            visible={false}
            onPointerDown={(event) => {
              if (event.nativeEvent.button === 0) {
                event.stopPropagation();
                event.nativeEvent.stopPropagation();
                onPointerDown(event);
              }
            }}
          >
            <planeGeometry args={[gridProps.gridSize * 1.5, gridProps.gridSize * 1.5]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        )}

        {/* Polyline points while drawing */}
        {drawingMode === 'polyline' && polylinePoints.length > 0 && (
          <group>
            {/* Show polyline points */}
            {polylinePoints.map((point, index) => (
              <Box
                key={index}
                args={[1, 2, 1]}
                position={[point.x, 1, point.z]}
              >
                <meshLambertMaterial color="#f59e0b" />
              </Box>
            ))}
            
            {/* Show polyline connections */}
            {polylinePoints.length > 1 && (
              <Line
                points={polylinePoints.map(p => [p.x, 0.02, p.z])}
                color="#f59e0b"
                lineWidth={3}
              />
            )}
          </group>
        )}

        {/* Visual Comparison Objects */}
        <ComparisonObjectsGroup
          selectedComparison={selectedComparison}
          totalAreaSquareMeters={units.reduce((total, unit) => 
            total + (parseFloat(unit.value) || 0) * unitToSquareMeters[unit.unit], 0
          )}
          maxObjects={50}
          darkMode={darkMode}
          showLabel={true}
          scale={1.0}
        />

        {/* Clean OrbitControls - no conflicts with static mesh */}
        <CleanOrbitControls />
      </>
    );
  };

  // Page content for SEO
  const pageContent = {
    '/': {
      heading: 'Professional Land Area Calculator',
      content: `Transform complex land measurements into clear, visual understanding. Perfect for surveyors, real estate professionals, architects, and property developers who need precise area calculations and professional reporting.

Features include advanced unit conversions, interactive 3D visualization, subdivision drawing tools, and comprehensive export capabilities for professional documentation.

• Multiple unit support (metric, imperial, traditional)
• Interactive 3D land visualization with terrain
• Professional subdivision drawing and labeling
• Visual size comparisons with familiar objects
• Comprehensive export options (PDF, Excel, CAD)
• Real-time area calculations and conversions
• Professional survey integration capabilities
• Mobile-responsive design for field work

Professional survey integration supports data import from total stations, GPS units, and existing survey files. Export boundary data to CAD systems, GIS platforms, and legal documentation software for seamless workflow integration.`
    }
  };

  const location = useLocation();
  const currentPath = location.pathname;
  const content = pageContent[currentPath] || pageContent['/'];

  // Contextual Function Box Component
  const ContextualFunctionBox = () => {
    if (!activeFunction) return null;

    const handleInsertArea = () => {
      const width = parseFloat(functionBoxData?.width || 10);
      const height = parseFloat(functionBoxData?.height || 10);
      const label = functionBoxData?.label || `Area ${subdivisions.length + 1}`;
      
      const newSubdivision = {
        id: `subdivision-${Date.now()}`,
        type: 'rectangle',
        position: { x: 0, z: 0 }, // Center of scene
        width,
        height,
        area: width * height,
        label,
        color: `hsl(${(subdivisions.length * 137.5) % 360}, 70%, 50%)`,
        created: new Date().toISOString(),
        editable: true
      };
      
      setSubdivisions(prev => [...prev, newSubdivision]);
      setActiveFunction(null);
      setFunctionBoxData(null);
    };

    const renderFunctionContent = () => {
      switch (activeFunction) {
        case 'insert-area':
          return (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Plus size={18} />
                <h3 className="font-semibold">Insert Area</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Width (m)</label>
                  <input
                    type="number"
                    value={functionBoxData?.width || ''}
                    onChange={(e) => setFunctionBoxData(prev => ({ ...prev, width: e.target.value }))}
                    placeholder="10"
                    className={`w-full px-2 py-1 text-sm rounded border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1">Height (m)</label>
                  <input
                    type="number"
                    value={functionBoxData?.height || ''}
                    onChange={(e) => setFunctionBoxData(prev => ({ ...prev, height: e.target.value }))}
                    placeholder="10"
                    className={`w-full px-2 py-1 text-sm rounded border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium mb-1">Label (optional)</label>
                <input
                  type="text"
                  value={functionBoxData?.label || ''}
                  onChange={(e) => setFunctionBoxData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Area name"
                  className={`w-full px-2 py-1 text-sm rounded border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
              </div>
              
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={handleInsertArea}
                  disabled={!functionBoxData?.width || !functionBoxData?.height}
                  className={`flex-1 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                    !functionBoxData?.width || !functionBoxData?.height
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : darkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Insert Area
                </button>
                
                <button
                  onClick={() => {
                    setActiveFunction(null);
                    setFunctionBoxData(null);
                  }}
                  className={`px-3 py-1.5 text-sm font-medium rounded border transition-colors ${
                    darkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          );
          
        default:
          return (
            <div className="text-center py-4">
              <span className="text-sm text-gray-500">Function not implemented</span>
            </div>
          );
      }
    };

    return (
      <div className={`mx-4 mb-4 p-4 rounded-lg shadow-lg border transition-all duration-200 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700 text-white' 
          : 'bg-white border-gray-200 text-gray-900'
      }`}>
        {renderFunctionContent()}
      </div>
    );
  };


  // SEO Meta
  useSEO({
    title: 'Land Visualizer - Professional 3D Land Area Calculator & Survey Tool',
    description: 'Advanced 3D land measurement and visualization tool for surveyors, real estate professionals, and property developers. Calculate areas, create subdivisions, and generate professional reports.',
    canonical: 'https://landvisualizer.com',
    image: 'https://landvisualizer.com/og-image.jpg'
  });

  // Area Input Modal Component
  const AreaInputModal = ({ isOpen, onClose, onSubmit, title, buttonText }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className={`
          w-96 max-w-md mx-4 rounded-xl shadow-xl border
          ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          {/* Header */}
          <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Area Value
              </label>
              <input
                type="number"
                value={areaInputValue}
                onChange={(e) => setAreaInputValue(e.target.value)}
                placeholder="Enter area value"
                className={`w-full px-4 py-3 rounded-lg border text-lg transition-colors ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                autoFocus
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Unit
              </label>
              <select
                value={areaInputUnit}
                onChange={(e) => setAreaInputUnit(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                {availableUnits.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Preview calculation */}
            {areaInputValue && !isNaN(areaInputValue) && (
              <div className={`p-3 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Equivalent area:
                </div>
                <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {(parseFloat(areaInputValue) * unitToSquareMeters[areaInputUnit]).toFixed(2)} m²
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className={`p-6 border-t flex gap-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg font-medium border transition-colors ${
                darkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!areaInputValue || isNaN(areaInputValue) || parseFloat(areaInputValue) <= 0}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                !areaInputValue || isNaN(areaInputValue) || parseFloat(areaInputValue) <= 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : darkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-slate-50 light-mode-safeguards'
    }`}>
      {/* Header */}
      <header 
        className={`border-b transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src="/logo192.png" 
                  alt="Land Visualizer Logo" 
                  className="w-10 h-10 rounded-lg"
                />
                <div>
                  <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Land Visualizer
                  </h1>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                    Advanced 3D land measurement and analysis tool
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center">
                <div className="relative">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 ${
                      darkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Learn More
                    <svg className={`ml-1 h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 shadow-sm ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                {darkMode ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />}
                {darkMode ? 'Light' : 'Dark'}
              </button>
              
              {/* Performance Monitor */}
              <div className={`px-3 py-2 text-xs rounded-lg ${
                darkMode 
                  ? 'bg-gray-800 text-gray-300 border border-gray-600' 
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Activity size={12} />
                    <span>FPS: {Math.round(performanceStats.fps)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>Quality: {Math.round(performanceStats.quality * 100)}%</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {totalAreaInSqM.toLocaleString()}
                </div>
                <div className={`text-xs uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                  Square Meters
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tools Ribbon */}
      <div 
        className={`${
          isLeftSidebarExpanded ? 'ml-80' : 'ml-20'
        } ${
          isPropertiesPanelExpanded ? 'mr-80' : 'mr-20'
        } transition-all duration-200`}
        style={{ pointerEvents: 'auto' }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseUp={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Ribbon
          darkMode={darkMode}
          drawingMode={drawingMode}
          setDrawingMode={handleDrawingModeChange}
          showDimensions={showDimensions}
          toggleDimensions={toggleDimensions}
          showAreaCalculator={showAreaCalculator}
          toggleAreaCalculator={() => setShowAreaCalculator(prev => !prev)}
          terrainEnabled={terrainEnabled}
          toggleTerrain={() => setTerrainEnabled(prev => !prev)}
          exportToExcel={() => console.log('Export to Excel')}
          showAreaConfiguration={showAreaConfiguration}
          toggleAreaConfiguration={() => setShowAreaConfiguration(prev => !prev)}
          addUnit={() => setShowAddAreaModal(true)}
          onShowInsertArea={() => setShowInsertAreaModal(true)}
          showInsertAreaDropdown={showInsertAreaDropdown}
          toggleInsertAreaDropdown={() => setShowInsertAreaDropdown(prev => !prev)}
          showPresetSelector={showPresetSelector}
          togglePresetSelector={() => setShowPresetSelector(prev => !prev)}
          onShowEnterDimensions={() => setShowManualInput(true)}
          activePropertiesTool={activeTool}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          selectedSubdivision={selectedSubdivision}
          onAddCorner={addCornerToDefaultSubdivision}
          onDeleteCorner={deleteCornerFromDefaultSubdivision}
          selectedCorner={selectedCorner}
          selectedEdge={selectedEdge}
          isLeftSidebarExpanded={isLeftSidebarExpanded}
          isPropertiesPanelExpanded={isPropertiesPanelExpanded}
          onToggleLeftSidebar={toggleLeftSidebar}
          onToggleRightSidebar={() => setIsPropertiesPanelExpanded(prev => !prev)}
        />
      </div>

      {/* Fixed Sidebars */}
      <LeftSidebar
        darkMode={darkMode}
        isLeftSidebarExpanded={isLeftSidebarExpanded}
        onToggleLeftSidebar={toggleLeftSidebar}
        drawingMode={drawingMode}
        onDrawingModeChange={handleDrawingModeChange}
        units={units}
        setUnits={setUnits}
        subdivisions={subdivisions}
        setSubdivisions={setSubdivisions}
        showAreaConfiguration={showAreaConfiguration}
        setShowAreaConfiguration={setShowAreaConfiguration}
        showInsertAreaDropdown={showInsertAreaDropdown}
        setShowInsertAreaDropdown={setShowInsertAreaDropdown}
        showPresetSelector={showPresetSelector}
        setShowPresetSelector={setShowPresetSelector}
        showManualInput={showManualInput}
        setShowManualInput={setShowManualInput}
        manualDimensions={manualDimensions}
        setManualDimensions={setManualDimensions}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        // Enhanced Visual Comparison props
        comparisonOptions={defaultComparisons}
        selectedComparison={selectedComparison}
        onComparisonSelect={setSelectedComparison}
        totalAreaSquareMeters={units.reduce((total, unit) => 
          total + (parseFloat(unit.value) || 0) * unitToSquareMeters[unit.unit], 0
        )}
        inputUnit={units.length > 0 ? units[units.length - 1]?.unit : 'm²'}
        // Layer management props
        onUpdateSubdivision={handleUpdateSubdivision}
        onDeleteSubdivision={handleDeleteSubdivision}
        selectedSubdivision={selectedSubdivision}
        onSelectSubdivision={handleSelectSubdivision}
      />
      
      <PropertiesPanel
        darkMode={darkMode}
        activeTool={activeTool}
        onPropertiesPanelExpansionChange={setIsPropertiesPanelExpanded}
        bearings={bearings}
        addBearing={addBearing}
        terrainEnabled={terrainEnabled}
        setTerrainEnabled={setTerrainEnabled}
        terrainPreset={terrainPreset}
        setTerrainPreset={setTerrainPreset}
        terrainOpacity={terrainOpacity}
        setTerrainOpacity={setTerrainOpacity}
        showDimensions={showDimensions}
        toggleDimensions={toggleDimensions}
        subdivisions={subdivisions}
        setSubdivisions={setSubdivisions}
        onToggleRightSidebar={() => setIsPropertiesPanelExpanded(prev => !prev)}
        isPropertiesPanelExpanded={isPropertiesPanelExpanded}
        drawingMode={drawingMode}
        manualDimensions={manualDimensions}
        setManualDimensions={setManualDimensions}
        units={units}
      />

      {/* Contextual Function Box - appears below ribbon when active */}
      <div 
        className={`${
          isLeftSidebarExpanded ? 'ml-80' : 'ml-20'
        } ${
          isPropertiesPanelExpanded ? 'mr-80' : 'mr-20'
        } transition-all duration-200`}
        style={{ pointerEvents: 'auto' }}
      >
        <ContextualFunctionBox />
      </div>

      {/* Main Content - Canvas Area */}
      <div className={`flex-1 ${
        isLeftSidebarExpanded ? 'ml-80' : 'ml-20'
      } ${
        isPropertiesPanelExpanded ? 'mr-80' : 'mr-20'
      } transition-all duration-200`}>
        <div className="h-[80vh] min-h-[600px]">
          {/* 3D Canvas */}
          <Canvas
            camera={{ 
              position: [50, 50, 50], 
              fov: 50,
              near: 0.1,
              far: 2000,
              up: [0, 1, 0] // Ensure consistent up direction
            }}
            style={{ 
              width: '100%',
              height: '70vh',
              background: darkMode ? '#1e293b' : '#87ceeb',
              pointerEvents: 'auto'
            }}
            dpr={[1, 2]} // Limit device pixel ratio for consistent performance
            performance={{ min: 0.5 }} // Minimum performance threshold
            gl={{ preserveDrawingBuffer: true }}
          >
            <Scene 
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove} 
              onPointerUp={handlePointerUp}
            />
          </Canvas>
        </div>
      </div>

      {/* Small Footer */}
      <footer 
        className={`border-t transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700 text-gray-300' 
            : 'bg-white border-gray-200 text-gray-600'
        } ${
          isLeftSidebarExpanded ? 'ml-80' : 'ml-20'
        } ${
          isPropertiesPanelExpanded ? 'mr-80' : 'mr-20'
        } transition-all duration-200`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-10 text-sm">
            <div className="flex items-center space-x-4">
              <span>© 2024 Land Visualizer</span>
              <span>•</span>
              <span>Professional 3D Land Analysis</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Version 1.0</span>
              <span>•</span>
              <span className="text-xs opacity-75">Powered by Three.js & React</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Area Input Modals */}
      <AreaInputModal
        isOpen={showInsertAreaModal}
        onClose={() => setShowInsertAreaModal(false)}
        onSubmit={handleInsertArea}
        title="Insert Area"
        buttonText="Insert Area"
      />
      
      <AreaInputModal
        isOpen={showAddAreaModal}
        onClose={() => setShowAddAreaModal(false)}
        onSubmit={handleAddArea}
        title="Add Area"
        buttonText="Add Area"
      />

      {/* Toast Container */}
      <ToastContainer darkMode={darkMode} />


      {/* Area Preset Selector Modal */}
      {showPresetSelector && (
        <AreaPresetSelector
          onSelectPreset={handlePresetSelect}
          onClose={() => setShowPresetSelector(false)}
          darkMode={darkMode}
        />
      )}

      {/* Enter Dimensions Modal */}
      <EnterDimensionsModal
        isOpen={showManualInput}
        onClose={() => setShowManualInput(false)}
        onCreateSubdivision={handleCreateSubdivisionFromDimensions}
        onPreview={handlePreviewFromDimensions}
        darkMode={darkMode}
      />

      {/* Keyboard Navigation */}
      <KeyboardNavigation
        darkMode={darkMode}
        toggleAreaCalculator={() => setShowAreaCalculator(prev => !prev)}
        toggleTerrain={() => setTerrainEnabled(prev => !prev)}
        setDrawingMode={handleDrawingModeChange}
        drawingMode={drawingMode}
        toggleDarkMode={toggleDarkMode}
        exportToExcel={() => console.log('Export to Excel')}
        undo={undo}
        redo={redo}
        deleteSelected={() => {
          if (selectedSubdivision) {
            handleDeleteSubdivision(selectedSubdivision.id || selectedSubdivision);
          }
        }}
        setUnits={setUnits}
      />
    </div>
  );
}

// App Router Component
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

