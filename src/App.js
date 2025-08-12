import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Plane, Box, Text, Line } from '@react-three/drei';
import { Plus, Minus, Maximize2, Activity, Ruler, Info, Share2, Copy, Check, Square as SquareIcon, MousePointer, Trash2, Edit3, Save, X, RotateCcw, RotateCw, Moon, Sun, FileDown } from 'lucide-react';
import * as THREE from 'three';
import jsPDF from 'jspdf';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Import modular components
import Ribbon from './components/Ribbon';
import LeftSidebar from './components/LeftSidebar';
import PropertiesPanel from './components/PropertiesPanel';
import AreaPresetSelector from './components/AreaPresetSelector';
import { ToastContainer } from './components/Toast';

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
    if (meta.canonical) updateOGTag('og:url', meta.canonical);
    
  }, [meta]);
}

// SEO Head component
function SEOHead() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const pageContent = {
    '/': {
      title: 'Land Visualizer - Professional 3D Land Area Calculator & Survey Tool',
      description: 'Visualize and calculate land areas with precision using our professional 3D land surveying tool. Convert between units, draw subdivisions, and export detailed reports.',
      heading: 'Professional Land Area Calculator',
      content: `Transform complex land measurements into clear, visual understanding. Perfect for surveyors, real estate professionals, architects, and property developers who need precise area calculations and professional reporting.
      
Features include advanced unit conversions, interactive 3D visualization, subdivision drawing tools, and comprehensive export capabilities for professional documentation.`
    }
  };
  
  const content = pageContent[currentPath] || pageContent['/'];
  
  useSEO({
    title: content.title,
    description: content.description,
    canonical: `${window.location.origin}${currentPath}`
  });
  
  return null;
}

// Land Visualizer main component
function LandVisualizer() {
  // SEO and expandable content state
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Core state
  const [darkMode, setDarkMode] = useState(false);
  const [drawingMode, setDrawingMode] = useState(null);
  const [units, setUnits] = useState([{ value: 1000, unit: 'm²' }]);
  const [subdivisions, setSubdivisions] = useState([]);
  const [selectedComparison, setSelectedComparison] = useState('footballField');
  
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
  
  // Measuring state
  const [tapeMeasurements, setTapeMeasurements] = useState([]);
  const [selectedTapeMeasurement, setSelectedTapeMeasurement] = useState(null);
  const [bearings, setBearings] = useState([]);
  
  // Terrain state
  const [terrainEnabled, setTerrainEnabled] = useState(false);
  const [terrainPreset, setTerrainPreset] = useState('hills');
  const [terrainOpacity, setTerrainOpacity] = useState(0.5);
  
  // Manual input state
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualDimensions, setManualDimensions] = useState({ width: '', length: '', unit: 'm' });
  
  // Selection state
  const [selectedSubdivision, setSelectedSubdivision] = useState(null);
  
  // History state for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Toast state
  const [toasts, setToasts] = useState([]);

  // Calculate total area
  const totalAreaInSqM = units.reduce((total, unit) => {
    const conversionFactors = {
      'm²': 1,
      'ft²': 0.092903,
      'hectares': 10000,
      'acres': 4046.86,
      'arpent': 3418.89,
      'perche': 42.21,
      'toise': 3.799
    };
    return total + (unit.value * (conversionFactors[unit.unit] || 1));
  }, 0);

  // Handlers
  const toggleMeasuringTape = useCallback(() => {
    setShowMeasuringTape(prev => !prev);
    setActiveTool(prev => prev === 'measuring' ? null : 'measuring');
  }, []);

  const toggleAreaCalculator = useCallback(() => {
    setShowAreaCalculator(prev => !prev);
    setActiveTool(prev => prev === 'calculator' ? null : 'calculator');
  }, []);

  const toggleCompassBearing = useCallback(() => {
    setShowCompassBearing(prev => !prev);
    setActiveTool(prev => prev === 'compass' ? null : 'compass');
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const toggleLeftSidebar = useCallback(() => {
    setIsLeftSidebarExpanded(prev => !prev);
  }, []);

  const toggleRightSidebar = useCallback(() => {
    setIsPropertiesPanelExpanded(prev => !prev);
    // Clear active tool when collapsing right sidebar to avoid conflicts
    if (isPropertiesPanelExpanded) {
      setActiveTool(null);
    }
  }, [isPropertiesPanelExpanded]);

  const handlePresetSelect = useCallback((preset) => {
    setUnits([{ value: preset.value, unit: preset.unit }]);
    setShowPresetSelector(false);
  }, []);

  const handleDismissToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));
  }, []);

  // Add toast function for user feedback
  const addToast = useCallback((toast) => {
    const newToast = {
      id: Date.now(),
      type: 'info',
      duration: 4000,
      ...toast
    };
    setToasts(prev => [...prev, newToast]);
  }, []);

  // Measuring tape handlers
  const addTapeMeasurement = useCallback((measurement) => {
    setTapeMeasurements(prev => [...prev, { id: Date.now(), ...measurement }]);
  }, []);

  const deleteTapeMeasurement = useCallback((id) => {
    setTapeMeasurements(prev => prev.filter(m => m.id !== id));
  }, []);

  const selectTapeMeasurement = useCallback((id) => {
    setSelectedTapeMeasurement(id);
  }, []);

  // Compass bearing handlers
  const addBearing = useCallback((bearing) => {
    setBearings(prev => [...prev, { id: Date.now(), ...bearing }]);
  }, []);

  const deleteBearing = useCallback((id) => {
    setBearings(prev => prev.filter(b => b.id !== id));
  }, []);

  const clearAllBearings = useCallback(() => {
    setBearings([]);
  }, []);

  // Area configuration handlers
  const addUnit = useCallback((unit) => {
    setUnits(prev => [...prev, unit]);
  }, []);

  const toggleAreaConfiguration = useCallback(() => {
    setShowAreaConfiguration(prev => !prev);
  }, []);

  const toggleInsertAreaDropdown = useCallback(() => {
    setShowInsertAreaDropdown(prev => !prev);
  }, []);

  const toggleTerrain = useCallback(() => {
    setTerrainEnabled(prev => !prev);
  }, []);

  // Manual subdivision handler
  const onAddManualSubdivision = useCallback(() => {
    if (manualDimensions.width && manualDimensions.length) {
      const area = parseFloat(manualDimensions.width) * parseFloat(manualDimensions.length);
      const newSubdivision = {
        id: Date.now(),
        width: parseFloat(manualDimensions.width),
        length: parseFloat(manualDimensions.length),
        area: area,
        label: `Manual ${subdivisions.length + 1}`,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      };
      setSubdivisions(prev => [...prev, newSubdivision]);
      setManualDimensions({ width: '', length: '', unit: 'm' });
      setShowManualInput(false);
    }
  }, [manualDimensions, subdivisions.length]);

  // Undo/Redo handlers
  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  const undo = useCallback(() => {
    if (canUndo) {
      setHistoryIndex(prev => prev - 1);
      // Apply previous state
    }
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      setHistoryIndex(prev => prev + 1);
      // Apply next state
    }
  }, [canRedo]);

  // Corner control handlers
  const onAddCorner = useCallback(() => {
    // Add corner functionality
  }, []);

  const onRemoveCorner = useCallback(() => {
    // Remove corner functionality  
  }, []);

  // Export handler
  const exportToExcel = useCallback(() => {
    // Export functionality
    console.log('Exporting to Excel...');
  }, []);

  // Default comparison options
  const comparisonOptions = [
    {
      id: 'footballField',
      name: 'Football Field',
      area: 5351,
      category: 'Sports',
      color: '#22c55e'
    },
    {
      id: 'basketballCourt',
      name: 'Basketball Court',
      area: 420,
      category: 'Sports',
      color: '#f97316'
    },
    {
      id: 'tennisCourt',
      name: 'Tennis Court',
      area: 261,
      category: 'Sports',
      color: '#06b6d4'
    },
    {
      id: 'swimmingPool',
      name: 'Swimming Pool',
      area: 375,
      category: 'Recreation',
      color: '#3b82f6'
    },
    {
      id: 'house',
      name: 'Average House',
      area: 150,
      category: 'Buildings',
      color: '#8b5cf6'
    },
    {
      id: 'parkingSpace',
      name: 'Parking Space',
      area: 12.5,
      category: 'Transportation',
      color: '#ef4444'
    }
  ];

  // Unit conversions
  const unitConversions = {
    'm²': 1,
    'ft²': 0.092903,
    'hectares': 10000,
    'acres': 4046.86,
    'arpent': 3418.89,
    'perche': 42.21,
    'toise': 3.799
  };

  // Comparison selection handler
  const onComparisonSelect = useCallback((comparisonId) => {
    setSelectedComparison(comparisonId);
  }, []);

  // Comparison object component
  const ComparisonObject = ({ comparison, position }) => {
    if (!comparison) return null;
    
    const dimensions = {
      width: Math.sqrt(comparison.area * 0.7), // Rough approximation
      length: Math.sqrt(comparison.area * 1.4)
    };
    
    return (
      <group position={position}>
        {/* Object representation */}
        <Plane 
          args={[dimensions.width, dimensions.length]} 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0.002, 0]}
        >
          <meshLambertMaterial 
            color={comparison.color} 
            transparent 
            opacity={0.7}
          />
        </Plane>
        
        {/* Object border */}
        <Line
          points={[
            [-dimensions.width/2, 0.003, -dimensions.length/2], 
            [dimensions.width/2, 0.003, -dimensions.length/2],
            [dimensions.width/2, 0.003, dimensions.length/2], 
            [-dimensions.width/2, 0.003, dimensions.length/2],
            [-dimensions.width/2, 0.003, -dimensions.length/2]
          ]}
          color="#000000"
          lineWidth={2}
        />
        
        {/* Label */}
        <Text
          position={[0, 5, 0]}
          rotation={[0, 0, 0]}
          color={darkMode ? '#ffffff' : '#000000'}
          anchorX="center"
          anchorY="middle"
          fontSize={3}
        >
          {comparison.name}
        </Text>
      </group>
    );
  };

  // Subdivision component
  const Subdivision3D = ({ subdivision, index }) => (
    <group position={[index * 15, 0, 0]}>
      <Plane 
        args={[subdivision.width || 10, subdivision.length || 10]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.003, 0]}
      >
        <meshLambertMaterial 
          color={subdivision.color} 
          transparent 
          opacity={0.6}
        />
      </Plane>
      
      {/* Subdivision border */}
      <Line
        points={[
          [-(subdivision.width || 10)/2, 0.004, -(subdivision.length || 10)/2], 
          [(subdivision.width || 10)/2, 0.004, -(subdivision.length || 10)/2],
          [(subdivision.width || 10)/2, 0.004, (subdivision.length || 10)/2], 
          [-(subdivision.width || 10)/2, 0.004, (subdivision.length || 10)/2],
          [-(subdivision.width || 10)/2, 0.004, -(subdivision.length || 10)/2]
        ]}
        color="#ffffff"
        lineWidth={2}
      />
      
      {/* Subdivision label */}
      <Text
        position={[0, 3, 0]}
        rotation={[0, 0, 0]}
        color={darkMode ? '#ffffff' : '#000000'}
        anchorX="center"
        anchorY="middle"
        fontSize={2}
      >
        {subdivision.label}
      </Text>
    </group>
  );

  // Enhanced Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingStart, setDrawingStart] = useState(null);
  const [drawingCurrent, setDrawingCurrent] = useState(null);
  const [drawingPreview, setDrawingPreview] = useState(null);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [hoveredSubdivision, setHoveredSubdivision] = useState(null);
  const [editingSubdivision, setEditingSubdivision] = useState(null);
  const [dragHandle, setDragHandle] = useState(null);
  
  // Navigation state for infinite canvas
  const [zoomLevel, setZoomLevel] = useState(50);
  const [cameraPosition, setCameraPosition] = useState([50, 50, 50]);
  const [currentZoom, setCurrentZoom] = useState(50);

  // Enhanced Interactive Drawing Plane Component
  const DrawingPlane = () => {
    const meshRef = React.useRef();
    const raycaster = React.useMemo(() => new THREE.Raycaster(), []);
    const mouse = React.useMemo(() => new THREE.Vector2(), []);
    
    // Enhanced pointer down with better raycasting
    const handlePointerDown = (event) => {
      if (!drawingMode) return;
      
      event.stopPropagation();
      const point = event.point;
      
      // Clear selection if clicking on empty space in select mode
      if (drawingMode === 'select') {
        setSelectedSubdivision(null);
        return;
      }
      
      if (drawingMode === 'rectangle') {
        setIsDrawing(true);
        setDrawingStart({ x: point.x, z: point.z });
        setDrawingCurrent({ x: point.x, z: point.z });
        addToast({
          type: 'info',
          message: 'Click and drag to create rectangle subdivision',
          duration: 2000
        });
      } else if (drawingMode === 'polygon') {
        const newPoint = { x: point.x, z: point.z };
        setPolygonPoints(prev => [...prev, newPoint]);
        
        if (polygonPoints.length === 0) {
          addToast({
            type: 'info', 
            message: 'Click to add points, double-click to finish polygon',
            duration: 3000
          });
        }
      } else if (drawingMode === 'polyline') {
        // Freeform drawing mode
        setIsDrawing(true);
        setPolygonPoints([{ x: point.x, z: point.z }]);
      }
    };

    // Enhanced pointer move with real-time feedback
    const handlePointerMove = (event) => {
      if (!drawingMode) return;
      
      const point = event.point;
      
      if (drawingMode === 'rectangle' && isDrawing && drawingStart) {
        setDrawingCurrent({ x: point.x, z: point.z });
        
        // Create enhanced preview rectangle with measurements
        const width = Math.abs(point.x - drawingStart.x);
        const height = Math.abs(point.z - drawingStart.z);
        const centerX = (drawingStart.x + point.x) / 2;
        const centerZ = (drawingStart.z + point.z) / 2;
        const area = width * height;
        
        setDrawingPreview({
          type: 'rectangle',
          position: { x: centerX, z: centerZ },
          width: width,
          height: height,
          area: area,
          measurements: {
            width: width.toFixed(1),
            height: height.toFixed(1),
            area: area.toFixed(1)
          }
        });
      } else if (drawingMode === 'polyline' && isDrawing) {
        // Freeform drawing - add points as we move
        const lastPoint = polygonPoints[polygonPoints.length - 1];
        const distance = Math.sqrt(
          Math.pow(point.x - lastPoint.x, 2) + Math.pow(point.z - lastPoint.z, 2)
        );
        
        // Add point if moved enough distance (smoothing)
        if (distance > 1) {
          setPolygonPoints(prev => [...prev, { x: point.x, z: point.z }]);
        }
      }
    };

    // Enhanced pointer up with validation and feedback
    const handlePointerUp = (event) => {
      if (!drawingMode) return;
      
      if (drawingMode === 'rectangle' && isDrawing && drawingStart && drawingCurrent) {
        const width = Math.abs(drawingCurrent.x - drawingStart.x);
        const height = Math.abs(drawingCurrent.z - drawingStart.z);
        
        // Enhanced minimum size check with user feedback
        if (width > 2 && height > 2) {
          const centerX = (drawingStart.x + drawingCurrent.x) / 2;
          const centerZ = (drawingStart.z + drawingCurrent.z) / 2;
          const area = width * height;
          
          const newSubdivision = {
            id: Date.now(),
            type: 'rectangle',
            position: { x: centerX, z: centerZ },
            width: width,
            height: height,
            area: area,
            label: `Subdivision ${subdivisions.length + 1}`,
            color: `hsl(${(subdivisions.length * 137.5) % 360}, 70%, 50%)`,
            created: new Date().toISOString(),
            editable: true
          };
          
          setSubdivisions(prev => [...prev, newSubdivision]);
          setSelectedSubdivision(newSubdivision.id);
          
          addToast({
            type: 'success',
            message: `Rectangle created: ${width.toFixed(1)}m × ${height.toFixed(1)}m (${area.toFixed(1)} m²)`,
            duration: 3000
          });
        } else {
          addToast({
            type: 'warning',
            message: 'Rectangle too small. Minimum size is 2m × 2m',
            duration: 2000
          });
        }
        
        // Reset drawing state
        setIsDrawing(false);
        setDrawingStart(null);
        setDrawingCurrent(null);
        setDrawingPreview(null);
      } else if (drawingMode === 'polyline' && isDrawing) {
        // Finish freeform drawing
        if (polygonPoints.length >= 3) {
          const area = calculatePolygonArea(polygonPoints);
          const centroid = calculatePolygonCentroid(polygonPoints);
          
          if (area > 4) {
            const newSubdivision = {
              id: Date.now(),
              type: 'freeform',
              points: [...polygonPoints],
              position: centroid,
              area: area,
              label: `Freeform ${subdivisions.length + 1}`,
              color: `hsl(${(subdivisions.length * 137.5) % 360}, 70%, 50%)`,
              created: new Date().toISOString(),
              editable: true
            };
            
            setSubdivisions(prev => [...prev, newSubdivision]);
            setSelectedSubdivision(newSubdivision.id);
            
            addToast({
              type: 'success',
              message: `Freeform area created: ${area.toFixed(1)} m²`,
              duration: 3000
            });
          }
        }
        
        setIsDrawing(false);
        setPolygonPoints([]);
      }
    };

    // Enhanced double-click for polygon completion
    const handleDoubleClick = (event) => {
      event.stopPropagation();
      
      if (drawingMode === 'polygon' && polygonPoints.length >= 3) {
        // Complete polygon with enhanced validation
        const area = calculatePolygonArea(polygonPoints);
        const centroid = calculatePolygonCentroid(polygonPoints);
        
        if (area > 4) {
          const newSubdivision = {
            id: Date.now(),
            type: 'polygon',
            points: [...polygonPoints],
            position: centroid,
            area: area,
            label: `Polygon ${subdivisions.length + 1}`,
            color: `hsl(${(subdivisions.length * 137.5) % 360}, 70%, 50%)`,
            created: new Date().toISOString(),
            editable: true
          };
          
          setSubdivisions(prev => [...prev, newSubdivision]);
          setSelectedSubdivision(newSubdivision.id);
          
          addToast({
            type: 'success',
            message: `Polygon created with ${polygonPoints.length} points (${area.toFixed(1)} m²)`,
            duration: 3000
          });
        } else {
          addToast({
            type: 'warning',
            message: 'Polygon too small. Minimum area is 4 m²',
            duration: 2000
          });
        }
        
        setPolygonPoints([]);
      }
    };

    return (
      <Plane
        ref={meshRef}
        args={[400, 400]} // Larger drawing area
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        <meshBasicMaterial 
          transparent 
          opacity={0} 
          depthWrite={false}
        />
      </Plane>
    );
  };

  // Enhanced Drawing Preview Component with measurements
  const DrawingPreview = () => {
    if (!drawingPreview) return null;

    if (drawingPreview.type === 'rectangle') {
      return (
        <group position={[drawingPreview.position.x, 0.01, drawingPreview.position.z]}>
          {/* Preview fill */}
          <Plane
            args={[drawingPreview.width, drawingPreview.height]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <meshLambertMaterial
              color="#00ff88"
              transparent
              opacity={0.2}
            />
          </Plane>
          
          {/* Enhanced preview border with animation */}
          <Line
            points={[
              [-drawingPreview.width/2, 0.001, -drawingPreview.height/2],
              [drawingPreview.width/2, 0.001, -drawingPreview.height/2],
              [drawingPreview.width/2, 0.001, drawingPreview.height/2],
              [-drawingPreview.width/2, 0.001, drawingPreview.height/2],
              [-drawingPreview.width/2, 0.001, -drawingPreview.height/2]
            ]}
            color="#00ff88"
            lineWidth={3}
            dashed
          />
          
          {/* Live measurements display */}
          {drawingPreview.measurements && (
            <>
              <Text
                position={[0, 5, 0]}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                fontSize={2}
                outlineWidth={0.1}
                outlineColor="#000000"
              >
                {`${drawingPreview.measurements.width}m × ${drawingPreview.measurements.height}m`}
              </Text>
              <Text
                position={[0, 2, 0]}
                color="#ffff00"
                anchorX="center"
                anchorY="middle"
                fontSize={1.5}
                outlineWidth={0.05}
                outlineColor="#000000"
              >
                {`${drawingPreview.measurements.area} m²`}
              </Text>
            </>
          )}
        </group>
      );
    }

    return null;
  };

  // Enhanced Polygon Preview Component
  const PolygonPreview = () => {
    if (polygonPoints.length < 1) return null;

    const linePoints = polygonPoints.map(p => [p.x, 0.006, p.z]);

    return (
      <group>
        {/* Polygon line preview */}
        {polygonPoints.length > 1 && (
          <Line
            points={linePoints}
            color="#00ff88"
            lineWidth={4}
          />
        )}
        
        {/* Point indicators */}
        {polygonPoints.map((point, index) => (
          <group key={index} position={[point.x, 0.5, point.z]}>
            <Box args={[0.5, 1, 0.5]}>
              <meshLambertMaterial 
                color={index === 0 ? "#ff0000" : "#00ff88"} 
                emissive={index === 0 ? "#440000" : "#004400"}
              />
            </Box>
            <Text
              position={[0, 2, 0]}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              fontSize={1}
              outlineWidth={0.05}
              outlineColor="#000000"
            >
              {index + 1}
            </Text>
          </group>
        ))}
        
        {/* Area preview for closed polygons */}
        {polygonPoints.length >= 3 && (
          <Text
            position={[
              polygonPoints.reduce((sum, p) => sum + p.x, 0) / polygonPoints.length,
              8,
              polygonPoints.reduce((sum, p) => sum + p.z, 0) / polygonPoints.length
            ]}
            color="#ffff00"
            anchorX="center"
            anchorY="middle"
            fontSize={2}
            outlineWidth={0.1}
            outlineColor="#000000"
          >
            {`Points: ${polygonPoints.length}`}
            {polygonPoints.length >= 3 && (
              <Text
                position={[0, -3, 0]}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                fontSize={1.5}
                outlineWidth={0.05}
                outlineColor="#000000"
              >
                {`Area: ${calculatePolygonArea(polygonPoints).toFixed(1)} m²`}
              </Text>
            )}
          </Text>
        )}
      </group>
    );
  };

  // Performance-Optimized Subdivision Component with LOD
  const EnhancedSubdivision3D = ({ subdivision, index, onEdit, onDelete, isSelected, camera }) => {
    const [hovered, setHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const subdivisionRef = React.useRef();
    
    // Performance optimization: Calculate LOD based on distance
    const getLOD = () => {
      if (!camera || !subdivisionRef.current) return 'high';
      
      const distance = camera.position.distanceTo(
        new THREE.Vector3(subdivision.position.x, 0, subdivision.position.z)
      );
      
      if (distance < 50) return 'high';    // Show all details
      if (distance < 200) return 'medium'; // Simplified details  
      if (distance < 1000) return 'low';   // Basic shape only
      return 'minimal'; // Just outline
    };
    
    const lodLevel = getLOD();
    
    // Skip rendering if too far away
    if (lodLevel === 'minimal') {
      return null;
    }
    
    const handleClick = (event) => {
      event.stopPropagation();
      if (drawingMode === 'select') {
        setSelectedSubdivision(prevSelected => 
          prevSelected === subdivision.id ? null : subdivision.id
        );
      }
    };

    const handleDoubleClick = (event) => {
      event.stopPropagation();
      if (onEdit) onEdit(subdivision.id);
      
      // Enable inline editing
      setEditingSubdivision(subdivision.id);
      addToast({
        type: 'info',
        message: 'Double-click to edit properties',
        duration: 2000
      });
    };
    
    const handlePointerOver = () => {
      setHovered(true);
      setHoveredSubdivision(subdivision.id);
    };
    
    const handlePointerOut = () => {
      setHovered(false);
      setHoveredSubdivision(null);
    };

    if (subdivision.type === 'polygon' || subdivision.type === 'freeform') {
      // Render polygon subdivision
      const points = subdivision.points.map(p => [p.x, 0.003, p.z]);
      
      return (
        <group 
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
        >
          {/* Enhanced polygon rendering - adapt line width based on LOD */}
          <Line
            points={[...points, points[0]]} // Close the polygon
            color={isSelected ? "#ffffff" : subdivision.color}
            lineWidth={
              lodLevel === 'high' ? (hovered || isSelected ? 6 : 3) :
              lodLevel === 'medium' ? 2 : 1
            }
          />
          
          {/* Fill effect for better visibility */}
          {points.length >= 3 && (
            <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[200, 200]} />
              <meshLambertMaterial
                color={subdivision.color}
                transparent
                opacity={hovered || isSelected ? 0.3 : 0.1}
                depthWrite={false}
              />
            </mesh>
          )}
          
          {/* Label - only show at high and medium LOD */}
          {(lodLevel === 'high' || lodLevel === 'medium') && (
            <Text
              position={[subdivision.position.x, 3, subdivision.position.z]}
              color={darkMode ? '#ffffff' : '#000000'}
              anchorX="center"
              anchorY="middle"
              fontSize={lodLevel === 'high' ? 2 : 1.5}
            >
              {subdivision.label}
            </Text>
          )}

          {/* Advanced edit handles for selected polygon - only at high LOD */}
          {isSelected && drawingMode === 'select' && lodLevel === 'high' && (
            <>
              {subdivision.points.map((point, idx) => (
                <group key={idx} position={[point.x, 0, point.z]}>
                  {/* Handle sphere */}
                  <mesh position={[0, 0.8, 0]}>
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshLambertMaterial 
                      color={idx === 0 ? "#ff4444" : "#4488ff"}
                      emissive={idx === 0 ? "#220000" : "#002244"}
                    />
                  </mesh>
                  
                  {/* Handle number */}
                  <Text
                    position={[0, 2, 0]}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    fontSize={1}
                    outlineWidth={0.05}
                    outlineColor="#000000"
                  >
                    {idx + 1}
                  </Text>
                  
                  {/* Connection line to center */}
                  <Line
                    points={[
                      [0, 0.003, 0],
                      [subdivision.position.x - point.x, 0.003, subdivision.position.z - point.z]
                    ]}
                    color="#ffffff"
                    lineWidth={1}
                    transparent
                    opacity={0.3}
                  />
                </group>
              ))}
              
              {/* Center handle */}
              <group position={[subdivision.position.x, 0, subdivision.position.z]}>
                <mesh position={[0, 1.2, 0]}>
                  <boxGeometry args={[0.8, 0.8, 0.8]} />
                  <meshLambertMaterial 
                    color="#ffff00"
                    emissive="#444400"
                  />
                </mesh>
                <Text
                  position={[0, 3, 0]}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                  fontSize={1.2}
                  outlineWidth={0.05}
                  outlineColor="#000000"
                >
                  CENTER
                </Text>
              </group>
            </>
          )}
        </group>
      );
    } else {
      // Render rectangle subdivision
      return (
        <group 
          position={[subdivision.position.x, 0, subdivision.position.z]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
        >
          <Plane
            args={[subdivision.width, subdivision.height]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.003, 0]}
          >
            <meshLambertMaterial
              color={subdivision.color}
              transparent
              opacity={hovered || isSelected ? 0.8 : 0.6}
            />
          </Plane>
          
          {/* Border - adapt line width based on LOD */}
          <Line
            points={[
              [-subdivision.width/2, 0.004, -subdivision.height/2],
              [subdivision.width/2, 0.004, -subdivision.height/2],
              [subdivision.width/2, 0.004, subdivision.height/2],
              [-subdivision.width/2, 0.004, subdivision.height/2],
              [-subdivision.width/2, 0.004, -subdivision.height/2]
            ]}
            color={hovered || isSelected ? "#ffffff" : "#cccccc"}
            lineWidth={
              lodLevel === 'high' ? (hovered || isSelected ? 3 : 2) :
              lodLevel === 'medium' ? 1.5 : 1
            }
          />
          
          {/* Label - only show at high and medium LOD */}
          {(lodLevel === 'high' || lodLevel === 'medium') && (
            <Text
              position={[0, 3, 0]}
              color={darkMode ? '#ffffff' : '#000000'}
              anchorX="center"
              anchorY="middle"
              fontSize={lodLevel === 'high' ? 2 : 1.5}
            >
              {subdivision.label}
            </Text>
          )}

          {/* Edit handles for selected rectangle - only at high LOD */}
          {isSelected && drawingMode === 'select' && lodLevel === 'high' && (
            <>
              {/* Corner handles */}
              <Box args={[1, 1, 1]} position={[-subdivision.width/2, 0.5, -subdivision.height/2]}>
                <meshLambertMaterial color="#ff0000" />
              </Box>
              <Box args={[1, 1, 1]} position={[subdivision.width/2, 0.5, -subdivision.height/2]}>
                <meshLambertMaterial color="#ff0000" />
              </Box>
              <Box args={[1, 1, 1]} position={[subdivision.width/2, 0.5, subdivision.height/2]}>
                <meshLambertMaterial color="#ff0000" />
              </Box>
              <Box args={[1, 1, 1]} position={[-subdivision.width/2, 0.5, subdivision.height/2]}>
                <meshLambertMaterial color="#ff0000" />
              </Box>
            </>
          )}
        </group>
      );
    }
  };

  // Helper functions
  const calculatePolygonArea = (points) => {
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].z;
      area -= points[j].x * points[i].z;
    }
    return Math.abs(area) / 2;
  };

  const calculatePolygonCentroid = (points) => {
    let cx = 0, cz = 0;
    for (const point of points) {
      cx += point.x;
      cz += point.z;
    }
    return { x: cx / points.length, z: cz / points.length };
  };

  // Infinite Grid Component
  const InfiniteGrid = ({ cellSize, sectionSize, gridSize, darkMode, camera }) => {
    const gridRef = React.useRef();
    
    useFrame(() => {
      if (gridRef.current) {
        // Keep grid centered on camera position (rounded to grid cells)
        const roundedX = Math.round(camera.position.x / cellSize) * cellSize;
        const roundedZ = Math.round(camera.position.z / cellSize) * cellSize;
        gridRef.current.position.set(roundedX, 0, roundedZ);
      }
    });
    
    return (
      <group ref={gridRef}>
        <Grid 
          args={[gridSize, gridSize]} 
          cellSize={cellSize} 
          sectionSize={sectionSize} 
          fadeDistance={gridSize * 0.4} 
          fadeStrength={1}
          cellThickness={0.3}
          sectionThickness={0.8}
          cellColor={darkMode ? '#374151' : '#64748b'}
          sectionColor={darkMode ? '#4b5563' : '#475569'}
          infiniteGrid={true}
        />
      </group>
    );
  };

  // Enhanced Drawing Plane with Infinite Support
  const InfiniteDrawingPlane = () => {
    const meshRef = React.useRef();
    const { camera } = useThree();
    
    useFrame(() => {
      if (meshRef.current) {
        // Keep drawing plane centered on camera with large size
        const distance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
        const planeSize = Math.max(1000, distance * 4);
        
        meshRef.current.position.set(camera.position.x, 0.006, camera.position.z);
        meshRef.current.scale.setScalar(planeSize / 1000);
      }
    });
    
    const handlePointerDown = (event) => {
      if (!drawingMode) return;
      
      event.stopPropagation();
      const point = event.point;
      
      if (drawingMode === 'select') {
        setSelectedSubdivision(null);
        return;
      }
      
      if (drawingMode === 'rectangle') {
        setIsDrawing(true);
        setDrawingStart({ x: point.x, z: point.z });
        setDrawingCurrent({ x: point.x, z: point.z });
        addToast({
          type: 'info',
          message: 'Click and drag to create rectangle subdivision',
          duration: 2000
        });
      } else if (drawingMode === 'polygon') {
        const newPoint = { x: point.x, z: point.z };
        setPolygonPoints(prev => [...prev, newPoint]);
        
        if (polygonPoints.length === 0) {
          addToast({
            type: 'info', 
            message: 'Click to add points, double-click to finish polygon',
            duration: 3000
          });
        }
      } else if (drawingMode === 'polyline') {
        setIsDrawing(true);
        setPolygonPoints([{ x: point.x, z: point.z }]);
      }
    };

    const handlePointerMove = (event) => {
      if (!drawingMode) return;
      
      const point = event.point;
      
      if (drawingMode === 'rectangle' && isDrawing && drawingStart) {
        setDrawingCurrent({ x: point.x, z: point.z });
        
        const width = Math.abs(point.x - drawingStart.x);
        const height = Math.abs(point.z - drawingStart.z);
        const centerX = (drawingStart.x + point.x) / 2;
        const centerZ = (drawingStart.z + point.z) / 2;
        const area = width * height;
        
        setDrawingPreview({
          type: 'rectangle',
          position: { x: centerX, z: centerZ },
          width: width,
          height: height,
          area: area,
          measurements: {
            width: width.toFixed(1),
            height: height.toFixed(1),
            area: area.toFixed(1)
          }
        });
      } else if (drawingMode === 'polyline' && isDrawing) {
        const lastPoint = polygonPoints[polygonPoints.length - 1];
        const distance = Math.sqrt(
          Math.pow(point.x - lastPoint.x, 2) + Math.pow(point.z - lastPoint.z, 2)
        );
        
        if (distance > 1) {
          setPolygonPoints(prev => [...prev, { x: point.x, z: point.z }]);
        }
      }
    };

    const handlePointerUp = (event) => {
      if (!drawingMode) return;
      
      if (drawingMode === 'rectangle' && isDrawing && drawingStart && drawingCurrent) {
        const width = Math.abs(drawingCurrent.x - drawingStart.x);
        const height = Math.abs(drawingCurrent.z - drawingStart.z);
        
        if (width > 2 && height > 2) {
          const centerX = (drawingStart.x + drawingCurrent.x) / 2;
          const centerZ = (drawingStart.z + drawingCurrent.z) / 2;
          const area = width * height;
          
          const newSubdivision = {
            id: Date.now(),
            type: 'rectangle',
            position: { x: centerX, z: centerZ },
            width: width,
            height: height,
            area: area,
            label: `Subdivision ${subdivisions.length + 1}`,
            color: `hsl(${(subdivisions.length * 137.5) % 360}, 70%, 50%)`,
            created: new Date().toISOString(),
            editable: true
          };
          
          setSubdivisions(prev => [...prev, newSubdivision]);
          setSelectedSubdivision(newSubdivision.id);
          
          addToast({
            type: 'success',
            message: `Rectangle created: ${width.toFixed(1)}m × ${height.toFixed(1)}m (${area.toFixed(1)} m²)`,
            duration: 3000
          });
        } else {
          addToast({
            type: 'warning',
            message: 'Rectangle too small. Minimum size is 2m × 2m',
            duration: 2000
          });
        }
        
        setIsDrawing(false);
        setDrawingStart(null);
        setDrawingCurrent(null);
        setDrawingPreview(null);
      } else if (drawingMode === 'polyline' && isDrawing) {
        if (polygonPoints.length >= 3) {
          const area = calculatePolygonArea(polygonPoints);
          const centroid = calculatePolygonCentroid(polygonPoints);
          
          if (area > 4) {
            const newSubdivision = {
              id: Date.now(),
              type: 'freeform',
              points: [...polygonPoints],
              position: centroid,
              area: area,
              label: `Freeform ${subdivisions.length + 1}`,
              color: `hsl(${(subdivisions.length * 137.5) % 360}, 70%, 50%)`,
              created: new Date().toISOString(),
              editable: true
            };
            
            setSubdivisions(prev => [...prev, newSubdivision]);
            setSelectedSubdivision(newSubdivision.id);
            
            addToast({
              type: 'success',
              message: `Freeform area created: ${area.toFixed(1)} m²`,
              duration: 3000
            });
          }
        }
        
        setIsDrawing(false);
        setPolygonPoints([]);
      }
    };

    const handleDoubleClick = (event) => {
      event.stopPropagation();
      
      if (drawingMode === 'polygon' && polygonPoints.length >= 3) {
        const area = calculatePolygonArea(polygonPoints);
        const centroid = calculatePolygonCentroid(polygonPoints);
        
        if (area > 4) {
          const newSubdivision = {
            id: Date.now(),
            type: 'polygon',
            points: [...polygonPoints],
            position: centroid,
            area: area,
            label: `Polygon ${subdivisions.length + 1}`,
            color: `hsl(${(subdivisions.length * 137.5) % 360}, 70%, 50%)`,
            created: new Date().toISOString(),
            editable: true
          };
          
          setSubdivisions(prev => [...prev, newSubdivision]);
          setSelectedSubdivision(newSubdivision.id);
          
          addToast({
            type: 'success',
            message: `Polygon created with ${polygonPoints.length} points (${area.toFixed(1)} m²)`,
            duration: 3000
          });
        } else {
          addToast({
            type: 'warning',
            message: 'Polygon too small. Minimum area is 4 m²',
            duration: 2000
          });
        }
        
        setPolygonPoints([]);
      }
    };
    
    return (
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial 
          transparent 
          opacity={0} 
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    );
  };

  // Performance-Optimized Navigation Controls
  const EnhancedNavigationControls = ({ 
    drawingMode, 
    onCameraChange, 
    onZoomChange, 
    darkMode,
    zoomLevel,
    setZoomLevel 
  }) => {
    const { camera, gl, scene } = useThree();
    const [isSpacePressed, setIsSpacePressed] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [cameraTarget, setCameraTarget] = useState(new THREE.Vector3(0, 0, 0));
    const controlsRef = React.useRef();
    
    // Performance optimization: Enable frustum culling globally
    React.useEffect(() => {
      scene.autoUpdate = true;
      scene.matrixAutoUpdate = true;
    }, [scene]);
    
    // Handle keyboard events for spacebar navigation
    useEffect(() => {
      const handleKeyDown = (event) => {
        if (event.code === 'Space' && !event.repeat) {
          event.preventDefault();
          setIsSpacePressed(true);
          gl.domElement.style.cursor = 'grab';
        }
      };
      
      const handleKeyUp = (event) => {
        if (event.code === 'Space') {
          event.preventDefault();
          setIsSpacePressed(false);
          setIsDragging(false);
          gl.domElement.style.cursor = 'default';
          // Re-enable OrbitControls when space is released
          if (controlsRef.current) {
            controlsRef.current.enabled = true;
          }
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }, [gl.domElement]);

    // Handle mouse events for dragging
    useEffect(() => {
      const handleMouseDown = (event) => {
        if (isSpacePressed && event.button === 0) { // Left mouse button
          setIsDragging(true);
          setDragStart({ x: event.clientX, y: event.clientY });
          gl.domElement.style.cursor = 'grabbing';
          event.preventDefault();
          // Disable OrbitControls while space+drag is active
          if (controlsRef.current) {
            controlsRef.current.enabled = false;
          }
        }
      };
      
      const handleMouseMove = (event) => {
        if (isDragging && isSpacePressed) {
          const deltaX = (event.clientX - dragStart.x) * 0.01;
          const deltaY = (event.clientY - dragStart.y) * 0.01;
          
          // Calculate pan movement relative to camera orientation
          const distance = camera.position.distanceTo(cameraTarget);
          const panScale = distance * 0.001;
          
          const panOffset = new THREE.Vector3();
          panOffset.setFromMatrixColumn(camera.matrix, 0); // x-axis
          panOffset.multiplyScalar(-deltaX * panScale);
          
          const panOffsetY = new THREE.Vector3();
          panOffsetY.setFromMatrixColumn(camera.matrix, 1); // y-axis  
          panOffsetY.multiplyScalar(deltaY * panScale);
          
          panOffset.add(panOffsetY);
          
          // Update both camera and target positions
          const newTarget = cameraTarget.clone().add(panOffset);
          const newPosition = camera.position.clone().add(panOffset);
          
          camera.position.copy(newPosition);
          setCameraTarget(newTarget);
          camera.lookAt(newTarget);
          
          setDragStart({ x: event.clientX, y: event.clientY });
          event.preventDefault();
        }
      };
      
      const handleMouseUp = (event) => {
        if (event.button === 0) {
          setIsDragging(false);
          // Re-enable OrbitControls
          if (controlsRef.current) {
            controlsRef.current.enabled = true;
          }
          if (isSpacePressed) {
            gl.domElement.style.cursor = 'grab';
          } else {
            gl.domElement.style.cursor = 'default';
          }
        }
      };
      
      gl.domElement.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        gl.domElement.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isSpacePressed, isDragging, dragStart, camera, cameraTarget, gl.domElement]);

    // Handle scroll zoom (no Ctrl required) with performance optimization
    useEffect(() => {
      const handleWheel = (event) => {
        // Always handle zoom, no Ctrl required
        event.preventDefault();
        
        // Optimized zoom calculation
        const zoomDelta = event.deltaY > 0 ? 1.15 : 0.87;
        const currentDistance = camera.position.distanceTo(cameraTarget);
        const newDistance = Math.max(0.5, Math.min(20000, currentDistance * zoomDelta));
        
        // Batch updates for better performance
        requestAnimationFrame(() => {
          // Update camera position maintaining direction
          const direction = camera.position.clone().sub(cameraTarget).normalize();
          const newPosition = cameraTarget.clone().add(direction.multiplyScalar(newDistance));
          
          camera.position.copy(newPosition);
          camera.lookAt(cameraTarget);
          
          setZoomLevel(newDistance);
          onZoomChange(newDistance);
        });
      };
      
      gl.domElement.addEventListener('wheel', handleWheel, { passive: false });
      
      return () => {
        gl.domElement.removeEventListener('wheel', handleWheel);
      };
    }, [camera, cameraTarget, gl.domElement, onZoomChange, setZoomLevel]);

    // Update camera tracking
    useFrame(() => {
      const distance = camera.position.distanceTo(cameraTarget);
      onCameraChange([camera.position.x, camera.position.y, camera.position.z]);
      onZoomChange(distance);
    });

    // Handle zoom level changes from slider
    useEffect(() => {
      const direction = camera.position.clone().sub(cameraTarget).normalize();
      const newPosition = cameraTarget.clone().add(direction.multiplyScalar(zoomLevel));
      camera.position.copy(newPosition);
      camera.lookAt(cameraTarget);
    }, [zoomLevel, camera, cameraTarget]);

    // Optimized OrbitControls with new mouse scheme
    return (
      <OrbitControls 
        ref={controlsRef}
        enablePan={true} // Enable middle mouse panning
        enableZoom={false} // Disable default zoom (we handle scroll)
        enableRotate={!drawingMode || drawingMode === 'select'}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE, // Left click to rotate
          MIDDLE: THREE.MOUSE.PAN,   // Middle mouse to pan
          RIGHT: null // Disable right click
        }}
        maxPolarAngle={Math.PI / 2.05} // Slight adjustment for better angle
        minDistance={5}
        maxDistance={500}
        enableDamping={true}
        dampingFactor={0.08} // More responsive damping
        panSpeed={2.0} // Faster panning
        rotateSpeed={0.8} // More responsive rotation
        target={cameraTarget}
        onStart={() => {
          gl.domElement.style.cursor = 'grabbing';
        }}
        onEnd={() => {
          gl.domElement.style.cursor = 'default';
        }}
        // Performance optimizations
        screenSpacePanning={true}
        keyPanSpeed={7.0}
      />
    );
  };

  // Camera Position Tracker
  const CameraPositionTracker = ({ onPositionChange, onZoomChange }) => {
    const { camera } = useThree();
    
    useFrame(() => {
      onPositionChange([camera.position.x, camera.position.y, camera.position.z]);
      const distance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
      onZoomChange(distance);
    });
    
    return null;
  };

  // Infinite Canvas 3D Scene Component
  const Scene = () => {
    const selectedComparisonData = comparisonOptions.find(c => c.id === selectedComparison);
    const { camera } = useThree();
    
    // Dynamic grid scaling based on zoom level
    const getGridScale = () => {
      const distance = Math.sqrt(
        camera.position.x ** 2 + camera.position.y ** 2 + camera.position.z ** 2
      );
      
      // Dynamic scaling: closer = smaller grid cells, farther = larger grid cells
      if (distance < 50) return { cellSize: 1, sectionSize: 10, gridSize: 500 };
      if (distance < 200) return { cellSize: 5, sectionSize: 25, gridSize: 1000 };
      if (distance < 1000) return { cellSize: 25, sectionSize: 100, gridSize: 5000 };
      return { cellSize: 100, sectionSize: 500, gridSize: 20000 };
    };
    
    const gridProps = getGridScale();
    
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
        
        {/* Infinite Ground Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
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
        
        {/* Main land area with dynamic sizing */}
        {totalAreaInSqM > 0 && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
            <planeGeometry args={[Math.sqrt(totalAreaInSqM), Math.sqrt(totalAreaInSqM)]} />
            <meshLambertMaterial 
              color="#3b82f6" 
              transparent 
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
        
        {/* Enhanced Infinite Drawing Plane */}
        <InfiniteDrawingPlane />
        
        {/* Drawing Preview with enhanced visuals */}
        <DrawingPreview />
        <PolygonPreview />
        
        {/* Comparison object with better positioning */}
        {selectedComparisonData && (
          <ComparisonObject 
            comparison={selectedComparisonData} 
            position={[
              Math.sqrt(totalAreaInSqM) * 0.4, 
              0, 
              Math.sqrt(totalAreaInSqM) * 0.2
            ]} 
          />
        )}
        
        {/* Enhanced Subdivisions with LOD (Level of Detail) */}
        {subdivisions.map((subdivision, index) => (
          <EnhancedSubdivision3D 
            key={subdivision.id} 
            subdivision={subdivision} 
            index={index}
            isSelected={selectedSubdivision === subdivision.id}
            camera={camera}
            onEdit={(id) => {
              console.log('Editing subdivision:', id);
              setEditingSubdivision(id);
            }}
            onDelete={(id) => {
              setSubdivisions(prev => prev.filter(s => s.id !== id));
              addToast({
                type: 'success',
                message: `Subdivision ${subdivision.label || id} deleted`,
                duration: 2000
              });
            }}
          />
        ))}
        
        {/* Enhanced Navigation Controls */}
        <EnhancedNavigationControls 
          drawingMode={drawingMode}
          onCameraChange={setCameraPosition}
          onZoomChange={setCurrentZoom}
          darkMode={darkMode}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
        />
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

  // Drawing Mode Info Overlay Component
  const DrawingModeInfo = () => {
    if (!drawingMode) return null;
    
    const getModeInfo = () => {
      switch (drawingMode) {
        case 'rectangle':
          return {
            title: 'Rectangle Drawing Mode',
            instructions: 'Click and drag to create rectangular subdivisions',
            icon: '■',
            color: '#4488ff'
          };
        case 'polygon':
          return {
            title: 'Polygon Drawing Mode', 
            instructions: 'Click to add points, double-click to finish polygon',
            icon: '▲',
            color: '#88ff44',
            extra: polygonPoints.length > 0 ? `Points: ${polygonPoints.length}` : ''
          };
        case 'polyline':
          return {
            title: 'Freeform Drawing Mode',
            instructions: 'Click and drag to draw freeform shapes',
            icon: '∿',
            color: '#ff8844'
          };
        case 'select':
          return {
            title: 'Selection Mode',
            instructions: 'Click to select subdivisions, double-click to edit',
            icon: '↖',
            color: '#ffff44',
            extra: selectedSubdivision ? 'Subdivision Selected' : ''
          };
        default:
          return null;
      }
    };
    
    const modeInfo = getModeInfo();
    if (!modeInfo) return null;
    
    return (
      <div className={`
        fixed top-24 left-1/2 transform -translate-x-1/2 z-50
        px-6 py-3 rounded-lg shadow-lg border-2
        ${darkMode
          ? 'bg-gray-800 border-gray-600 text-white'
          : 'bg-white border-gray-300 text-gray-900'
        }
      `} style={{ borderColor: modeInfo.color }}>
        <div className="flex items-center gap-3">
          <div 
            className="text-2xl font-bold"
            style={{ color: modeInfo.color }}
          >
            {modeInfo.icon}
          </div>
          <div>
            <div className="font-semibold text-sm">
              {modeInfo.title}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {modeInfo.instructions}
            </div>
            {modeInfo.extra && (
              <div className="text-xs mt-1" style={{ color: modeInfo.color }}>
                {modeInfo.extra}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Selected Subdivision Info Panel
  const SelectedSubdivisionInfo = () => {
    if (!selectedSubdivision) return null;
    
    const subdivision = subdivisions.find(s => s.id === selectedSubdivision);
    if (!subdivision) return null;
    
    return (
      <div className={`
        fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50
        px-6 py-4 rounded-lg shadow-lg border max-w-sm
        ${darkMode
          ? 'bg-gray-800 border-gray-600 text-white'
          : 'bg-white border-gray-300 text-gray-900'
        }
      `}>
        <div className="text-center">
          <div className="font-semibold text-lg mb-2">
            {subdivision.label}
          </div>
          <div className="space-y-1 text-sm">
            <div>Type: <span className="font-mono">{subdivision.type}</span></div>
            {subdivision.type === 'rectangle' && (
              <>
                <div>Dimensions: {subdivision.width?.toFixed(1)}m × {subdivision.height?.toFixed(1)}m</div>
                <div>Area: <span className="font-semibold text-blue-500">{subdivision.area?.toFixed(1)} m²</span></div>
              </>
            )}
            {subdivision.type === 'polygon' && (
              <>
                <div>Points: {subdivision.points?.length}</div>
                <div>Area: <span className="font-semibold text-green-500">{subdivision.area?.toFixed(1)} m²</span></div>
              </>
            )}
            <div className="flex justify-center gap-2 mt-3">
              <button
                onClick={() => setEditingSubdivision(subdivision.id)}
                className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setSubdivisions(prev => prev.filter(s => s.id !== subdivision.id));
                  setSelectedSubdivision(null);
                  addToast({
                    type: 'success',
                    message: `${subdivision.label} deleted`,
                    duration: 2000
                  });
                }}
                className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Infinite Canvas UI Info Component
  const InfiniteCanvasInfo = ({ cameraPosition, currentZoom }) => {
    const [showInfo, setShowInfo] = useState(false);
    
    return (
      <div className={`
        fixed top-28 right-4 z-40
        ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
        rounded-lg shadow-lg border p-3 transition-all duration-200
        ${showInfo ? 'w-64' : 'w-12'}
      `}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`
              w-6 h-6 rounded flex items-center justify-center text-xs font-mono
              ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}
              hover:opacity-80 transition-opacity
            `}
            title={showInfo ? 'Hide canvas info' : 'Show canvas info'}
          >
            {showInfo ? '−' : '+'}
          </button>
        </div>
        
        {showInfo && (
          <div className="mt-2 space-y-1 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-gray-500">Position:</span>
            </div>
            <div className="pl-2">
              <div>X: {cameraPosition[0]?.toFixed(1) || '0.0'}</div>
              <div>Y: {cameraPosition[1]?.toFixed(1) || '0.0'}</div>
              <div>Z: {cameraPosition[2]?.toFixed(1) || '0.0'}</div>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-500">Zoom:</span>
              <span>{currentZoom?.toFixed(1) || '0.0'}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Grid:</span>
              <span>
                {currentZoom < 50 ? '1m' : 
                 currentZoom < 200 ? '5m' : 
                 currentZoom < 1000 ? '25m' : '100m'}
              </span>
            </div>
            {subdivisions.length > 0 && (
              <div className="flex justify-between pt-1">
                <span className="text-gray-500">Objects:</span>
                <span>{subdivisions.length}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Bottom Zoom Slider Component
  const ZoomSlider = ({ zoomLevel, setZoomLevel, darkMode }) => {
    const [isDragging, setIsDragging] = useState(false);
    
    // Convert zoom level to slider position (logarithmic scale)
    const zoomToSlider = (zoom) => {
      const min = Math.log(1);
      const max = Math.log(10000);
      const current = Math.log(zoom);
      return ((current - min) / (max - min)) * 100;
    };
    
    // Convert slider position to zoom level
    const sliderToZoom = (slider) => {
      const min = Math.log(1);
      const max = Math.log(10000);
      const position = slider / 100;
      return Math.exp(min + position * (max - min));
    };
    
    const sliderPosition = zoomToSlider(zoomLevel);
    
    const getZoomLabel = (zoom) => {
      if (zoom < 10) return `${zoom.toFixed(1)}m`;
      if (zoom < 100) return `${zoom.toFixed(0)}m`;
      if (zoom < 1000) return `${(zoom / 100).toFixed(1)}hm`;
      return `${(zoom / 1000).toFixed(1)}km`;
    };
    
    return (
      <div className={`
        fixed bottom-4 right-4 z-50
        flex items-center gap-4 px-6 py-3 rounded-full shadow-lg border
        ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
      `}>
        {/* Zoom Out Button */}
        <button
          onClick={() => setZoomLevel(Math.min(10000, zoomLevel * 1.5))}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold
            ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}
            transition-colors duration-200
          `}
          title="Zoom Out"
        >
          −
        </button>
        
        {/* Zoom Slider */}
        <div className="relative w-48 h-6 flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => {
              const newZoom = sliderToZoom(parseFloat(e.target.value));
              setZoomLevel(newZoom);
            }}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            className={`
              w-full h-2 rounded-lg appearance-none cursor-pointer
              ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}
              slider
            `}
            style={{
              background: `linear-gradient(to right, 
                ${darkMode ? '#3B82F6' : '#2563EB'} ${sliderPosition}%, 
                ${darkMode ? '#4B5563' : '#D1D5DB'} ${sliderPosition}%
              )`
            }}
          />
          
          {/* Zoom Level Display */}
          <div className={`
            absolute -top-8 left-0 right-0 text-center text-xs font-mono
            ${darkMode ? 'text-gray-300' : 'text-gray-600'}
          `}>
            {getZoomLabel(zoomLevel)}
          </div>
          
          {/* Scale Markers */}
          <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs font-mono">
            <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>1m</span>
            <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>10m</span>
            <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>100m</span>
            <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>1km</span>
            <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>10km</span>
          </div>
        </div>
        
        {/* Zoom In Button */}
        <button
          onClick={() => setZoomLevel(Math.max(1, zoomLevel * 0.67))}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold
            ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}
            transition-colors duration-200
          `}
          title="Zoom In"
        >
          +
        </button>
        
        {/* Navigation Help */}
        <div className={`
          ml-4 pl-4 border-l text-xs
          ${darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}
        `}>
          <div><kbd className={`px-1 rounded text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>Ctrl</kbd> + scroll to zoom</div>
        </div>
      </div>
    );
  };

  // Navigation Status Indicator
  const NavigationStatus = ({ isSpacePressed, isDragging, darkMode }) => {
    if (!isSpacePressed && !isDragging) return null;
    
    return (
      <div className={`
        fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50
        px-4 py-2 rounded-lg shadow-lg border
        ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
      `}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">
            {isSpacePressed ? (isDragging ? 'Panning...' : 'Ready to Pan') : 'Navigating...'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className={`shadow-sm border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-xl shadow-lg">
                  <img src="/logo192.png" alt="Land Visualizer Logo" className="w-10 h-10" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Land Visualizer</h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>Advanced 3D land measurement and analysis tool</p>
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 underline"
                      aria-expanded={isExpanded}
                      aria-controls="content-details"
                    >
                      Learn More
                      <svg className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        </div>
      </div>

      {/* Expandable Learn More Content */}
      {isExpanded && (
        <div className={`border-b transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-4">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {content.heading}
              </h2>
            </div>
            <div 
              id="content-details"
              className={`text-sm leading-relaxed whitespace-pre-line ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              {content.content}
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <LeftSidebar
        darkMode={darkMode}
        comparisonOptions={comparisonOptions}
        selectedComparison={selectedComparison}
        onComparisonSelect={onComparisonSelect}
        customComparisons={[]}
        onAddCustomComparison={() => {}}
        onRemoveCustomComparison={() => {}}
        unitConversions={unitConversions}
        onSidebarExpansionChange={setIsLeftSidebarExpanded}
        onToggleLeftSidebar={toggleLeftSidebar}
        isLeftSidebarExpanded={isLeftSidebarExpanded}
      />

      {/* Main Content Area - Account for fixed positioned sidebars */}
      <div 
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-200 ease-out ${
          isLeftSidebarExpanded ? 'ml-80' : 'ml-20'
        } ${
          isPropertiesPanelExpanded ? 'mr-80' : 'mr-20'
        }`}
      >
          {/* Tools Ribbon */}
          <Ribbon
            darkMode={darkMode}
            drawingMode={drawingMode}
            setDrawingMode={setDrawingMode}
            showMeasuringTape={showMeasuringTape}
            toggleMeasuringTape={toggleMeasuringTape}
            showAreaCalculator={showAreaCalculator}
            toggleAreaCalculator={toggleAreaCalculator}
            showCompassBearing={showCompassBearing}
            toggleCompassBearing={toggleCompassBearing}
            terrainEnabled={terrainEnabled}
            toggleTerrain={toggleTerrain}
            exportToExcel={exportToExcel}
            selectedSubdivision={selectedSubdivision}
            showAreaConfiguration={showAreaConfiguration}
            toggleAreaConfiguration={toggleAreaConfiguration}
            addUnit={addUnit}
            showInsertAreaDropdown={showInsertAreaDropdown}
            toggleInsertAreaDropdown={toggleInsertAreaDropdown}
            showPresetSelector={showPresetSelector}
            togglePresetSelector={() => setShowPresetSelector(!showPresetSelector)}
            onAddCorner={onAddCorner}
            onRemoveCorner={onRemoveCorner}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            isLeftSidebarExpanded={isLeftSidebarExpanded}
            isPropertiesPanelExpanded={isPropertiesPanelExpanded}
            onToggleLeftSidebar={toggleLeftSidebar}
            onToggleRightSidebar={toggleRightSidebar}
          />
          {/* Area Configuration Section */}
          <div className={`p-2 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
            <div className="max-w-4xl mx-auto">
              <h2 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Area Configuration
              </h2>
              
              {/* Units Input */}
              <div className="space-y-2">
                {units.map((unit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="number"
                      value={unit.value}
                      onChange={(e) => {
                        const newUnits = [...units];
                        newUnits[index] = { ...unit, value: parseFloat(e.target.value) || 0 };
                        setUnits(newUnits);
                      }}
                      className={`flex-1 px-2 py-1 border rounded-md text-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-slate-300'
                      }`}
                      placeholder="Enter area value"
                    />
                    <select
                      value={unit.unit}
                      onChange={(e) => {
                        const newUnits = [...units];
                        newUnits[index] = { ...unit, unit: e.target.value };
                        setUnits(newUnits);
                      }}
                      className={`px-2 py-1 border rounded-md text-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-slate-300'
                      }`}
                    >
                      <option value="m²">m²</option>
                      <option value="ft²">ft²</option>
                      <option value="hectares">hectares</option>
                      <option value="acres">acres</option>
                      <option value="arpent">arpent</option>
                      <option value="perche">perche</option>
                      <option value="toise">toise</option>
                    </select>
                    {units.length > 1 && (
                      <button
                        onClick={() => {
                          const newUnits = units.filter((_, i) => i !== index);
                          setUnits(newUnits);
                        }}
                        className={`p-2 rounded-md ${
                          darkMode 
                            ? 'text-red-400 hover:bg-gray-700' 
                            : 'text-red-600 hover:bg-slate-100'
                        }`}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  onClick={() => setUnits([...units, { value: 0, unit: 'm²' }])}
                  className={`flex items-center gap-2 px-2 py-1 rounded-md border-2 border-dashed transition-colors text-sm ${
                    darkMode 
                      ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300' 
                      : 'border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Plus size={16} />
                  Add Another Area
                </button>
              </div>
            </div>
          </div>

          {/* 3D Visualization */}
          <div className="flex-1 relative">
            {/* Drawing Mode Indicator */}
            {drawingMode && drawingMode !== 'select' && (
              <div className={`absolute top-4 left-4 z-10 px-4 py-2 rounded-lg shadow-lg ${
                darkMode ? 'bg-gray-800 text-white border border-gray-600' : 'bg-white text-gray-900 border border-gray-300'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    drawingMode === 'rectangle' ? 'bg-blue-500' : 
                    drawingMode === 'polygon' ? 'bg-green-500' : 
                    'bg-gray-400'
                  }`}></div>
                  <span className="font-medium">
                    {drawingMode === 'rectangle' && 'Rectangle Mode'}
                    {drawingMode === 'polygon' && 'Polygon Mode'}
                    {drawingMode === 'freeform' && 'Freeform Mode'}
                  </span>
                </div>
                <div className={`text-xs mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {drawingMode === 'rectangle' && 'Click and drag to draw rectangles'}
                  {drawingMode === 'polygon' && 'Click points to create polygon, double-click to finish'}
                  {drawingMode === 'freeform' && 'Draw irregular shapes with mouse'}
                </div>
              </div>
            )}

            {/* Polygon Points Counter */}
            {drawingMode === 'polygon' && polygonPoints.length > 0 && (
              <div className={`absolute top-4 right-4 z-10 px-3 py-2 rounded-lg shadow-lg ${
                darkMode ? 'bg-gray-800 text-white border border-gray-600' : 'bg-white text-gray-900 border border-gray-300'
              }`}>
                <div className="text-sm font-medium">
                  Points: {polygonPoints.length}
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {polygonPoints.length < 3 ? 'Need 3+ points' : 'Double-click to finish'}
                </div>
              </div>
            )}

            {/* Selected Subdivision Info */}
            {selectedSubdivision && subdivisions.find(s => s.id === selectedSubdivision) && (
              <div className={`absolute bottom-4 left-4 z-10 px-4 py-2 rounded-lg shadow-lg ${
                darkMode ? 'bg-gray-800 text-white border border-gray-600' : 'bg-white text-gray-900 border border-gray-300'
              }`}>
                {(() => {
                  const selected = subdivisions.find(s => s.id === selectedSubdivision);
                  return (
                    <div>
                      <div className="font-medium">{selected.label}</div>
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Area: {selected.area.toFixed(2)} m²
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {selected.type === 'rectangle' ? 
                          `${selected.width.toFixed(1)}m × ${selected.height.toFixed(1)}m` :
                          `${selected.points?.length || 0} points`
                        }
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <Canvas
              camera={{ 
                position: [50, 50, 50], 
                fov: 60,
                near: 1,
                far: 800 
              }}
              style={{ 
                background: darkMode ? '#111827' : '#f8fafc',
                cursor: drawingMode === 'rectangle' ? 'crosshair' : 
                       drawingMode === 'polygon' ? 'crosshair' : 
                       drawingMode === 'select' ? 'pointer' : 
                       'default'
              }}
              gl={{ 
                antialias: false,
                alpha: false,
                stencil: false,
                depth: true,
                powerPreference: 'high-performance'
              }}
              frameloop="demand"
              performance={{ min: 0.1 }}
            >
              <Scene />
            </Canvas>
          </div>
        </div>

      {/* Right Properties Panel */}
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
          deleteBearing={deleteBearing}
          clearAllBearings={clearAllBearings}
          terrainEnabled={terrainEnabled}
          setTerrainEnabled={setTerrainEnabled}
          terrainPreset={terrainPreset}
          setTerrainPreset={setTerrainPreset}
          terrainOpacity={terrainOpacity}
          setTerrainOpacity={setTerrainOpacity}
          showManualInput={showManualInput}
          setShowManualInput={setShowManualInput}
          manualDimensions={manualDimensions}
          setManualDimensions={setManualDimensions}
          onAddManualSubdivision={onAddManualSubdivision}
          onToggleRightSidebar={toggleRightSidebar}
          isPropertiesPanelExpanded={isPropertiesPanelExpanded}
        />

      {/* Modals and Overlays */}
      {showPresetSelector && (
        <AreaPresetSelector 
          onSelectPreset={handlePresetSelect}
          darkMode={darkMode}
          onClose={() => setShowPresetSelector(false)}
        />
      )}

      {/* Drawing UI Overlays */}
      <DrawingModeInfo />
      <SelectedSubdivisionInfo />
      
      {/* Infinite Canvas Info */}
      <InfiniteCanvasInfo 
        cameraPosition={cameraPosition} 
        currentZoom={currentZoom} 
      />
      
      {/* Bottom Zoom Slider */}
      <ZoomSlider 
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        darkMode={darkMode}
      />
      
      <ToastContainer 
        toasts={toasts}
        onDismissToast={handleDismissToast}
        darkMode={darkMode}
      />
    </div>
  );
}

// App wrapper with routing and providers
function App() {
  return (
    <PayPalScriptProvider options={{
      "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID || "test",
      currency: "USD"
    }}>
      <BrowserRouter>
        <SEOHead />
        <Routes>
          <Route path="/" element={<LandVisualizer />} />
          <Route path="/land-area-calculator" element={<LandVisualizer />} />
          <Route path="/property-survey-tools" element={<LandVisualizer />} />
          <Route path="/3d-land-visualization" element={<LandVisualizer />} />
        </Routes>
      </BrowserRouter>
    </PayPalScriptProvider>
  );
}

export default App;