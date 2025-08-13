import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import EnhancedSubdivision from './components/EnhancedSubdivision';

// Import enhanced performance components
import EnhancedCameraController from './components/EnhancedCameraController';
import EnhancedEventHandler from './components/EnhancedEventHandler';
import OptimizedRenderer from './components/OptimizedRenderer';

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
  const [units, setUnits] = useState([{ value: 1000, unit: 'm²' }]);
  const [subdivisions, setSubdivisions] = useState([
    {
      id: 'default-square',
      type: 'rectangle',
      position: { x: -40, z: -40 }, // Move away from center to avoid OrbitControls conflict
      width: Math.sqrt(1000), // ~31.6m x 31.6m = 1000m²
      height: Math.sqrt(1000),
      area: 1000,
      label: 'Default Area',
      color: '#3b82f6',
      created: new Date().toISOString(),
      editable: true
    }
  ]);
  const [selectedComparison, setSelectedComparison] = useState(null);
  
  // UI state
  const [showMeasuringTape, setShowMeasuringTape] = useState(false);
  const [showAreaCalculator, setShowAreaCalculator] = useState(false);
  const [showCompassBearing, setShowCompassBearing] = useState(false);
  const [showPresetSelector, setShowPresetSelector] = useState(false);
  const [showAreaConfiguration, setShowAreaConfiguration] = useState(false);
  const [showInsertAreaDropdown, setShowInsertAreaDropdown] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState(false);
  const [isPropertiesPanelExpanded, setIsPropertiesPanelExpanded] = useState(false);
  
  // Contextual function box state
  const [activeFunction, setActiveFunction] = useState(null);
  const [functionBoxData, setFunctionBoxData] = useState(null);
  
  // Measuring state
  const [tapeMeasurements, setTapeMeasurements] = useState([]);
  const [selectedTapeMeasurement, setSelectedTapeMeasurement] = useState(null);
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

  // Event handlers
  const toggleMeasuringTape = useCallback(() => {
    setShowMeasuringTape(prev => !prev);
    setActiveTool(prev => prev === 'measuring' ? null : 'measuring');
  }, []);

  const toggleCompassBearing = useCallback(() => {
    setShowCompassBearing(prev => !prev);
    setActiveTool(prev => prev === 'compass' ? null : 'compass');
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const toggleDimensions = useCallback(() => {
    setShowDimensions(prev => !prev);
  }, []);

  const toggleLeftSidebar = useCallback(() => {
    setIsLeftSidebarExpanded(prev => !prev);
  }, []);

  // Add measurement functions
  const addTapeMeasurement = useCallback((measurement) => {
    setTapeMeasurements(prev => [...prev, { ...measurement, id: Date.now() }]);
  }, []);

  const deleteTapeMeasurement = useCallback((id) => {
    setTapeMeasurements(prev => prev.filter(m => m.id !== id));
    if (selectedTapeMeasurement?.id === id) {
      setSelectedTapeMeasurement(null);
    }
  }, [selectedTapeMeasurement]);

  const selectTapeMeasurement = useCallback((measurement) => {
    setSelectedTapeMeasurement(measurement);
  }, []);

  const addBearing = useCallback((bearing) => {
    setBearings(prev => [...prev, { ...bearing, id: Date.now() }]);
  }, []);

  // Drawing mode handlers
  const handleDrawingModeChange = useCallback((mode) => {
    setDrawingMode(mode);
    setIsDrawing(false);
    setDrawingStart(null);
    setDrawingCurrent(null);
    setDrawingPreview(null);
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
    if (!drawingMode || drawingMode === 'select') return;
    
    setIsDrawing(true);
    const point = event.point;
    setDrawingStart(point);
    setDrawingCurrent(point);
  }, [drawingMode]);

  const handlePointerMove = useCallback((event) => {
    if (!isDrawing || !drawingStart) return;
    
    const point = event.point;
    setDrawingCurrent(point);
    
    // Create preview shape
    if (drawingMode === 'rectangle') {
      const width = Math.abs(point.x - drawingStart.x);
      const height = Math.abs(point.z - drawingStart.z);
      const centerX = (drawingStart.x + point.x) / 2;
      const centerZ = (drawingStart.z + point.z) / 2;
      
      setDrawingPreview({
        type: 'rectangle',
        position: { x: centerX, z: centerZ },
        width,
        height,
        area: width * height
      });
    }
  }, [drawingMode, drawingStart, isDrawing, subdivisions.length]);

  const handlePointerUp = useCallback((event) => {
    if (!isDrawing || !drawingStart || !drawingCurrent) return;
    
    if (drawingMode === 'rectangle') {
      const width = Math.abs(drawingCurrent.x - drawingStart.x);
      const height = Math.abs(drawingCurrent.z - drawingStart.z);
      
      if (width > 1 && height > 1) { // Minimum size threshold
        const centerX = (drawingStart.x + drawingCurrent.x) / 2;
        const centerZ = (drawingStart.z + drawingCurrent.z) / 2;
        const area = width * height;
        
        const newSubdivision = {
          id: `subdivision-${Date.now()}`,
          type: 'rectangle',
          position: { x: centerX, z: centerZ },
          width,
          height,
          area,
          label: `Area ${subdivisions.length + 1}`,
          color: `hsl(${(subdivisions.length * 137.5) % 360}, 70%, 50%)`,
          created: new Date().toISOString(),
          editable: true
        };
        
        setSubdivisions(prev => [...prev, newSubdivision]);
      }
    }
    
    // Reset drawing state
    setIsDrawing(false);
    setDrawingStart(null);
    setDrawingCurrent(null);
    setDrawingPreview(null);
  }, [drawingMode, drawingPreview, isDrawing, subdivisions.length]);

  // View Controls Component
  const ViewControls = () => {
    const { camera, gl } = useThree();
    const controlsRef = useRef();

    // Update camera position based on zoom level
    useEffect(() => {
      const distance = 100 / zoomLevel;
      const newPosition = new THREE.Vector3(
        cameraTarget.x + distance * 0.7,
        distance * 0.7,
        cameraTarget.z + distance * 0.7
      );
      
      camera.position.copy(newPosition);
      camera.lookAt(cameraTarget);
    }, [zoomLevel, camera, cameraTarget]);

    // Enhanced Performance Components
    return (
      <>
        <OptimizedRenderer 
          enableAdaptiveQuality={true}
          enableSelectiveRendering={true}
          onPerformanceChange={setPerformanceStats}
        />
        
        <EnhancedEventHandler
          drawingMode={drawingMode}
          isDrawing={isDrawing}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
        
        <EnhancedCameraController 
          target={[cameraTarget.x, cameraTarget.y, cameraTarget.z]}
          enableDamping={true}
        />
      </>
    );
  };

  // Infinite Canvas 3D Scene Component - Optimized
  const Scene = () => {
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

        {/* Simple test box to verify 3D rendering */}
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshLambertMaterial color="#3b82f6" />
        </mesh>

        {/* Render all subdivisions */}
        {subdivisions.map((subdivision) => (
          <EnhancedSubdivision
            key={subdivision.id}
            subdivision={subdivision}
            darkMode={darkMode}
            showDimensions={showDimensions}
            drawingMode={drawingMode}
          />
        ))}
        
        {/* Render drawing preview */}
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

        {/* View Controls */}
        <ViewControls />
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

  // Drawing Mode Info Overlay Component
  const DrawingModeInfo = () => {
    if (!drawingMode) return null;
    
    const modeInfo = {
      rectangle: {
        title: 'Rectangle Drawing Mode',
        description: 'Click and drag to create rectangular subdivisions',
        icon: <SquareIcon size={16} />
      },
      polyline: {
        title: 'Polyline Drawing Mode', 
        description: 'Click points to create custom shapes',
        icon: <Edit3 size={16} />
      },
      select: {
        title: 'Selection Mode',
        description: 'Click to select and edit subdivisions',
        icon: <MousePointer size={16} />
      }
    };

    const info = modeInfo[drawingMode];
    if (!info) return null;

    return (
      <div className={`absolute top-4 left-4 z-50 px-4 py-3 rounded-lg shadow-lg border ${
        darkMode 
          ? 'bg-gray-800 border-gray-600 text-white' 
          : 'bg-white border-gray-200 text-gray-900'
      }`}>
        <div className="flex items-center space-x-2 mb-1">
          {info.icon}
          <span className="font-medium">{info.title}</span>
        </div>
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {info.description}
        </p>
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

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-slate-50'
    }`}>
      {/* Header */}
      <header className={`border-b transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
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
      <div className={`${
        isLeftSidebarExpanded ? 'ml-80' : 'ml-20'
      } ${
        isPropertiesPanelExpanded ? 'mr-80' : 'mr-20'
      } transition-all duration-200`}>
        <Ribbon
          darkMode={darkMode}
          drawingMode={drawingMode}
          setDrawingMode={handleDrawingModeChange}
          showMeasuringTape={showMeasuringTape}
          toggleMeasuringTape={toggleMeasuringTape}
          showDimensions={showDimensions}
          toggleDimensions={toggleDimensions}
          showAreaCalculator={showAreaCalculator}
          toggleAreaCalculator={() => setShowAreaCalculator(prev => !prev)}
          terrainEnabled={terrainEnabled}
          toggleTerrain={() => setTerrainEnabled(prev => !prev)}
          showCompassBearing={showCompassBearing}
          toggleCompassBearing={toggleCompassBearing}
          exportToExcel={() => console.log('Export to Excel')}
          showAreaConfiguration={showAreaConfiguration}
          toggleAreaConfiguration={() => setShowAreaConfiguration(prev => !prev)}
          addUnit={() => setUnits(prev => [...prev, { value: 1000, unit: 'm²' }])}
        onShowInsertArea={() => {
          setActiveFunction('insert-area');
          setFunctionBoxData({ width: '', height: '', label: '' });
        }}
          showInsertAreaDropdown={showInsertAreaDropdown}
          toggleInsertAreaDropdown={() => setShowInsertAreaDropdown(prev => !prev)}
          showPresetSelector={showPresetSelector}
          togglePresetSelector={() => setShowPresetSelector(prev => !prev)}
          onShowEnterDimensions={() => setShowManualInput(true)}
          activePropertiesTool={activeTool}
          onUndo={() => console.log('Undo')}
          onRedo={() => console.log('Redo')}
          canUndo={false}
          canRedo={false}
          selectedSubdivision={null}
          onAddCorner={() => console.log('Add corner')}
          onRemoveCorner={() => console.log('Remove corner')}
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
      />
      
      <PropertiesPanel
        darkMode={darkMode}
        activeTool={activeTool}
        onPropertiesPanelExpansionChange={setIsPropertiesPanelExpanded}
        measuringTapeActive={showMeasuringTape}
        toggleMeasuringTape={toggleMeasuringTape}
        tapeMeasurements={tapeMeasurements}
        addTapeMeasurement={addTapeMeasurement}
        deleteTapeMeasurement={deleteTapeMeasurement}
        selectedTapeMeasurement={selectedTapeMeasurement}
        selectTapeMeasurement={selectTapeMeasurement}
        compassBearingActive={showCompassBearing}
        toggleCompassBearing={toggleCompassBearing}
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
      />

      {/* Contextual Function Box - appears below ribbon when active */}
      <div className={`${
        isLeftSidebarExpanded ? 'ml-80' : 'ml-20'
      } ${
        isPropertiesPanelExpanded ? 'mr-80' : 'mr-20'
      } transition-all duration-200`}>
        <ContextualFunctionBox />
      </div>

      {/* Main Content - Canvas Area */}
      <div className={`flex-1 ${
        isLeftSidebarExpanded ? 'ml-80' : 'ml-20'
      } ${
        isPropertiesPanelExpanded ? 'mr-80' : 'mr-20'
      } transition-all duration-200`}>
        <div className="h-full min-h-[500px]">
        {/* Drawing Mode Info Overlay */}
        <DrawingModeInfo />
        
        {/* 3D Canvas */}
          <Canvas
            camera={{ 
              position: [10, 10, 10], 
              fov: 50,
              near: 0.1,
              far: 1000
            }}
            style={{ 
              width: '100%',
              height: '100%',
              background: '#87ceeb'
            }}
          >
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            
            {/* Test cube */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[2, 2, 2]} />
              <meshStandardMaterial color="#ff6b35" />
            </mesh>
            
            {/* Ground plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#4ade80" />
            </mesh>
            
            {/* OrbitControls for interaction */}
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          </Canvas>
        </div>
      </div>

      {/* Small Footer */}
      <footer className={`border-t transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700 text-gray-300' 
          : 'bg-white border-gray-200 text-gray-600'
      } ${
        isLeftSidebarExpanded ? 'ml-80' : 'ml-20'
      } ${
        isPropertiesPanelExpanded ? 'mr-80' : 'mr-20'
      } transition-all duration-200`}>
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

      {/* Toast Container */}
      <ToastContainer darkMode={darkMode} />
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

