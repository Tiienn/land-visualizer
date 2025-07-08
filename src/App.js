import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Plane, Box, Text, Line } from '@react-three/drei';
import { Eye, Navigation, Plus, Minus, Maximize2, Activity, Ruler, Info, Share2, Copy, Check, Square as SquareIcon, MousePointer, Trash2, Edit3 } from 'lucide-react';
import * as THREE from 'three';
import './App.css';

// Drawing mode component
function DrawingPlane({ sideLength, onAddSubdivision, drawingMode, subdivisions, setSubdivisions }) {
  const [startPoint, setStartPoint] = useState(null);
  const [currentPoint, setCurrentPoint] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handlePointerDown = (event) => {
    if (drawingMode !== 'rectangle') return;
    
    const point = event.point;
    setStartPoint([point.x, point.z]);
    setIsDrawing(true);
  };

  const handlePointerMove = (event) => {
    if (!isDrawing || drawingMode !== 'rectangle') return;
    
    const point = event.point;
    setCurrentPoint([point.x, point.z]);
  };

  const handlePointerUp = (event) => {
    if (!isDrawing || !startPoint || !currentPoint) return;
    
    const width = Math.abs(currentPoint[0] - startPoint[0]);
    const length = Math.abs(currentPoint[1] - startPoint[1]);
    const area = width * length;
    
    if (area > 0.1) { // Minimum area threshold
      const newSubdivision = {
        id: Date.now(),
        x: (startPoint[0] + currentPoint[0]) / 2,
        z: (startPoint[1] + currentPoint[1]) / 2,
        width: width,
        length: length,
        area: area,
        label: `Area ${subdivisions.length + 1}`,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      };
      
      onAddSubdivision(newSubdivision);
    }
    
    setStartPoint(null);
    setCurrentPoint(null);
    setIsDrawing(false);
  };

  return (
    <>
      <Plane 
        args={[sideLength, sideLength]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.005, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <meshBasicMaterial transparent opacity={0} />
      </Plane>
      
      {/* Preview rectangle while drawing */}
      {isDrawing && startPoint && currentPoint && (
        <group>
          <Plane
            args={[
              Math.abs(currentPoint[0] - startPoint[0]),
              Math.abs(currentPoint[1] - startPoint[1])
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[
              (startPoint[0] + currentPoint[0]) / 2,
              0.02,
              (startPoint[1] + currentPoint[1]) / 2
            ]}
          >
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} />
          </Plane>
          <Line
            points={[
              [startPoint[0], 0.02, startPoint[1]],
              [currentPoint[0], 0.02, startPoint[1]],
              [currentPoint[0], 0.02, currentPoint[1]],
              [startPoint[0], 0.02, currentPoint[1]],
              [startPoint[0], 0.02, startPoint[1]]
            ]}
            color="#3b82f6"
            lineWidth={2}
          />
        </group>
      )}
    </>
  );
}

// Subdivision component
function Subdivision({ subdivision, onDelete, onEdit }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group>
      <Plane
        args={[subdivision.width, subdivision.length]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[subdivision.x, 0.015, subdivision.z]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshLambertMaterial 
          color={subdivision.color} 
          transparent 
          opacity={hovered ? 0.5 : 0.3} 
        />
      </Plane>
      
      {/* Border */}
      <Line
        points={[
          [subdivision.x - subdivision.width/2, 0.02, subdivision.z - subdivision.length/2],
          [subdivision.x + subdivision.width/2, 0.02, subdivision.z - subdivision.length/2],
          [subdivision.x + subdivision.width/2, 0.02, subdivision.z + subdivision.length/2],
          [subdivision.x - subdivision.width/2, 0.02, subdivision.z + subdivision.length/2],
          [subdivision.x - subdivision.width/2, 0.02, subdivision.z - subdivision.length/2]
        ]}
        color={subdivision.color}
        lineWidth={2}
      />
      
      {/* Label */}
      <Text
        position={[subdivision.x, 0.5, subdivision.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {subdivision.label}
        {'\n'}
        {subdivision.area.toFixed(1)} m²
      </Text>
    </group>
  );
}

function Scene({ sideLength, environment, selectedComparison, totalAreaInSqM, drawingMode, subdivisions, setSubdivisions }) {
  const comparisonOptions = [
    { id: 'soccerField', name: 'Soccer Field', area: 7140, color: '#10b981', dimensions: { width: 100, length: 70 } },
    { id: 'basketballCourt', name: 'Basketball Court', area: 420, color: '#f59e0b', dimensions: { width: 28, length: 15 } },
    { id: 'tennisCourt', name: 'Tennis Court', area: 260.87, color: '#0ea5e9', dimensions: { width: 23.77, length: 10.97 } },
    { id: 'swimmingPool', name: 'Swimming Pool', area: 163, color: '#06b6d4', dimensions: { width: 25, length: 6.5 } },
    { id: 'house', name: 'Average House', area: 150, color: '#8b5cf6', dimensions: { width: 12, length: 12.5 } },
    { id: 'parkingSpace', name: 'Parking Space', area: 12.5, color: '#64748b', dimensions: { width: 5, length: 2.5 } },
    { id: 'cityBlock', name: 'City Block', area: 10000, color: '#f43f5e', dimensions: { width: 100, length: 100 } },
    { id: 'golfHole', name: 'Golf Hole', area: 4000, color: '#22c55e', dimensions: { width: 100, length: 40 } },
    { id: 'olympicPool', name: 'Olympic Pool', area: 1250, color: '#3b82f6', dimensions: { width: 50, length: 25 } }
  ];

  const comparison = selectedComparison ? comparisonOptions.find(c => c.id === selectedComparison) : null;
  
  const handleAddSubdivision = (subdivision) => {
    setSubdivisions([...subdivisions, subdivision]);
  };

  const handleDeleteSubdivision = (id) => {
    setSubdivisions(subdivisions.filter(s => s.id !== id));
  };

  const handleEditSubdivision = (id, newLabel) => {
    setSubdivisions(subdivisions.map(s => 
      s.id === id ? { ...s, label: newLabel } : s
    ));
  };
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[100, 100, 50]} intensity={0.8} castShadow />
      <directionalLight position={[-50, 50, -50]} intensity={0.3} />
      
      {/* Ground */}
      <Plane 
        args={[Math.max(sideLength * 3, 200), Math.max(sideLength * 3, 200)]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
      >
        <meshLambertMaterial color="#4a7c59" />
      </Plane>
      
      {/* Grid */}
      <Grid 
        args={[Math.max(sideLength * 3, 200), Math.max(sideLength * 3, 200)]} 
        cellSize={5} 
        cellThickness={0.5} 
        cellColor="#888888" 
        sectionSize={25} 
        sectionThickness={1} 
        sectionColor="#cccccc" 
        fadeDistance={200} 
        infiniteGrid={false}
        position={[0, 0.001, 0]}
      />
      
      {/* Main area */}
      <Plane args={[sideLength, sideLength]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <meshLambertMaterial color="#0066cc" transparent opacity={0.2} />
      </Plane>
      
      {/* Drawing plane for subdivisions */}
      <DrawingPlane 
        sideLength={sideLength} 
        onAddSubdivision={handleAddSubdivision}
        drawingMode={drawingMode}
        subdivisions={subdivisions}
        setSubdivisions={setSubdivisions}
      />
      
      {/* Render subdivisions */}
      {subdivisions.map(subdivision => (
        <Subdivision
          key={subdivision.id}
          subdivision={subdivision}
          onDelete={handleDeleteSubdivision}
          onEdit={handleEditSubdivision}
        />
      ))}
      
      {/* Border markers */}
      {[
        [-sideLength/2, -sideLength/2],
        [sideLength/2, -sideLength/2],
        [sideLength/2, sideLength/2],
        [-sideLength/2, sideLength/2]
      ].map((pos, i) => (
        <Box key={i} args={[1, 3, 1]} position={[pos[0], 1.5, pos[1]]}>
          <meshLambertMaterial color="#0066cc" />
        </Box>
      ))}
      
      {/* Comparison objects - only show if not in drawing mode */}
      {!drawingMode && comparison && (() => {
        const numObjects = Math.floor(totalAreaInSqM / comparison.area);
        const objectsToShow = Math.min(numObjects, 50);
        const itemsPerRow = Math.ceil(Math.sqrt(objectsToShow));
        const spacing = Math.max(comparison.dimensions.width, comparison.dimensions.length) * 1.1;
        const gridWidth = (itemsPerRow - 1) * spacing;
        const startX = -gridWidth / 2;
        const startZ = -gridWidth / 2;
        
        const objects = [];
        
        for (let i = 0; i < objectsToShow; i++) {
          const row = Math.floor(i / itemsPerRow);
          const col = i % itemsPerRow;
          const xPos = startX + col * spacing;
          const zPos = startZ + row * spacing;
          
          if (Math.abs(xPos) < sideLength/2 - comparison.dimensions.width/2 && 
              Math.abs(zPos) < sideLength/2 - comparison.dimensions.length/2) {
            objects.push(
              <Plane 
                key={i}
                args={[comparison.dimensions.width, comparison.dimensions.length]} 
                rotation={[-Math.PI / 2, 0, 0]} 
                position={[xPos, 0.03, zPos]}
              >
                <meshLambertMaterial color={comparison.color} transparent opacity={0.6} />
              </Plane>
            );
          }
        }
        
        return objects;
      })()}
      
      {/* OrbitControls */}
      <OrbitControls 
        enableDamping 
        dampingFactor={0.05}
        minDistance={10}
        maxDistance={200}
        maxPolarAngle={Math.PI / 2}
        enabled={drawingMode !== 'rectangle'}
      />
    </>
  );
}

const LandVisualizer = () => {
  const [units, setUnits] = useState([{ value: 1000, unit: 'm²' }]);
  const [selectedComparison, setSelectedComparison] = useState(null);
  const [showTraditionalInfo, setShowTraditionalInfo] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [drawingMode, setDrawingMode] = useState(null);
  const [subdivisions, setSubdivisions] = useState([]);
  const [editingSubdivision, setEditingSubdivision] = useState(null);

  // Unit conversions to square meters
  const unitConversions = {
    'm²': 1,
    'ft²': 0.092903,
    'hectares': 10000,
    'acres': 4046.86,
    'arpent': 3418.89,
    'perche': 42.2112,
    'toise': 3.798
  };

  // Load configuration from URL on mount
  useEffect(() => {
    const loadFromURL = () => {
      const params = new URLSearchParams(window.location.search);
      const config = params.get('config');
      
      if (config) {
        try {
          const decoded = JSON.parse(atob(config));
          if (decoded.units && Array.isArray(decoded.units)) {
            setUnits(decoded.units);
          }
          if (decoded.comparison) {
            setSelectedComparison(decoded.comparison);
          }
          if (decoded.subdivisions) {
            setSubdivisions(decoded.subdivisions);
          }
        } catch (error) {
          console.error('Failed to load configuration from URL');
        }
      }
    };
    
    loadFromURL();
  }, []);

  // Generate shareable URL
  const generateShareURL = () => {
    const config = {
      units: units,
      comparison: selectedComparison,
      subdivisions: subdivisions
    };
    
    const encoded = btoa(JSON.stringify(config));
    const url = `${window.location.origin}${window.location.pathname}?config=${encoded}`;
    return url;
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    const url = generateShareURL();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calculate total area in square meters
  const totalAreaInSqM = units.reduce((total, unit) => {
    return total + (unit.value * unitConversions[unit.unit]);
  }, 0);
  
  const sideLength = Math.sqrt(totalAreaInSqM);

  // Calculate conversions
  const totalAcres = totalAreaInSqM / 4046.86;
  const totalHectares = totalAreaInSqM / 10000;

  // Calculate subdivisions total
  const subdivisionsTotal = subdivisions.reduce((total, sub) => total + sub.area, 0);
  const remainingArea = totalAreaInSqM - subdivisionsTotal;

  // Comparison data
  const comparisonOptions = [
    { id: 'soccerField', name: 'Soccer Field', area: 7140, icon: '⚽', color: 'emerald', dimensions: { width: 100, length: 70 } },
    { id: 'basketballCourt', name: 'Basketball Court', area: 420, icon: '🏀', color: 'amber', dimensions: { width: 28, length: 15 } },
    { id: 'tennisCourt', name: 'Tennis Court', area: 260.87, icon: '🎾', color: 'sky', dimensions: { width: 23.77, length: 10.97 } },
    { id: 'swimmingPool', name: 'Swimming Pool', area: 163, icon: '🏊', color: 'cyan', dimensions: { width: 25, length: 6.5 } },
    { id: 'house', name: 'Average House', area: 150, icon: '🏠', color: 'violet', dimensions: { width: 12, length: 12.5 } },
    { id: 'parkingSpace', name: 'Parking Space', area: 12.5, icon: '🚗', color: 'slate', dimensions: { width: 5, length: 2.5 } },
    { id: 'cityBlock', name: 'City Block', area: 10000, icon: '🏙️', color: 'rose', dimensions: { width: 100, length: 100 } },
    { id: 'golfHole', name: 'Golf Hole', area: 4000, icon: '⛳', color: 'green', dimensions: { width: 100, length: 40 } },
    { id: 'olympicPool', name: 'Olympic Pool', area: 1250, icon: '🏊', color: 'blue', dimensions: { width: 50, length: 25 } }
  ];

  const addUnit = () => {
    setUnits([...units, { value: 0, unit: 'm²' }]);
  };

  const removeUnit = (index) => {
    if (units.length > 1) {
      setUnits(units.filter((_, i) => i !== index));
    }
  };

  const updateUnit = (index, field, value) => {
    const newUnits = [...units];
    newUnits[index][field] = field === 'value' ? Number(value) : value;
    setUnits(newUnits);
  };

  const formatNumber = (num) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const handleDeleteSubdivision = (id) => {
    setSubdivisions(subdivisions.filter(s => s.id !== id));
  };

  const handleEditSubdivision = (id, newLabel) => {
    setSubdivisions(subdivisions.map(s => 
      s.id === id ? { ...s, label: newLabel } : s
    ));
    setEditingSubdivision(null);
  };

  const clearAllSubdivisions = () => {
    setSubdivisions([]);
    setDrawingMode(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
                  <Ruler className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Professional Land Visualizer</h1>
                  <p className="text-sm text-slate-600">Advanced 3D land measurement and analysis tool</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-150 shadow-sm"
                >
                  <Share2 size={16} className="mr-2" />
                  Share
                </button>
                <div className="hidden lg:flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{formatNumber(totalAreaInSqM)}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Square Meters</div>
                  </div>
                  <div className="h-12 w-px bg-slate-200"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{formatNumber(totalHectares)}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Hectares</div>
                  </div>
                  <div className="h-12 w-px bg-slate-200"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{formatNumber(totalAcres)}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Acres</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Share Your Land Configuration</h3>
              <p className="text-sm text-slate-600 mb-4">
                Copy this link to share your current land configuration with others:
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={generateShareURL()}
                  readOnly
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    copied 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check size={16} className="mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="mr-2" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-slate-600" />
                Area Configuration
              </h2>
              <button
                onClick={addUnit}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-150 shadow-sm"
              >
                <Plus size={16} className="mr-2" />
                Add Component
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {units.map((unitItem, index) => (
                <div key={index} className="relative group">
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <label htmlFor={`area-value-${index}`} className="block text-xs font-medium text-slate-700 mb-1">
                          Area Value
                        </label>
                        <input
                          type="number"
                          value={unitItem.value}
                          onChange={(e) => updateUnit(index, 'value', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          id={`area-value-${index}`}
                          name={`area-value-${index}`}
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor={`unit-type-${index}`} className="block text-xs font-medium text-slate-700 mb-1">
                          Unit Type
                        </label>
                        <select
                          value={unitItem.unit}
                          onChange={(e) => updateUnit(index, 'unit', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                          id={`unit-type-${index}`}
                          name={`unit-type-${index}`}
                        >
                          <option value="m²">m²</option>
                          <option value="ft²">ft²</option>
                          <option value="hectares">hectares</option>
                          <option value="acres">acres</option>
                          <option value="arpent">arpent</option>
                          <option value="perche">perche</option>
                          <option value="toise">toise</option>
                        </select>
                      </div>
                      {units.length > 1 && (
                        <button
                          onClick={() => removeUnit(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Minus size={18} />
                        </button>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      = {formatNumber(unitItem.value * unitConversions[unitItem.unit])} m²
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Drawing Tools */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Drawing Tools</h3>
                {subdivisions.length > 0 && (
                  <button
                    onClick={clearAllSubdivisions}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDrawingMode(drawingMode === 'select' ? null : 'select')}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    drawingMode === 'select'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  <MousePointer size={16} className="mr-2" />
                  Select
                </button>
                
                <button
                  onClick={() => setDrawingMode(drawingMode === 'rectangle' ? null : 'rectangle')}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    drawingMode === 'rectangle'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  <SquareIcon size={16} className="mr-2" />
                  Draw Rectangle
                </button>
                
                {drawingMode === 'rectangle' && (
                  <span className="text-sm text-slate-600 ml-2">
                    Click and drag on the land to draw a subdivision
                  </span>
                )}
              </div>
            </div>
            
            {/* Traditional Units Info */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <button
                onClick={() => setShowTraditionalInfo(!showTraditionalInfo)}
                className="flex items-center text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                <Info size={16} className="mr-2" />
               Traditional Units Information
             </button>
             
             {showTraditionalInfo && (
               <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                 <h4 className="font-semibold text-slate-900 mb-2">Traditional Units:</h4>
                 <ul className="space-y-2 text-sm text-slate-700">
                   <li>
                     <strong>Arpent:</strong> French colonial unit, varies by region (Louisiana ≈ 0.84 acres)
                   </li>
                   <li>
                     <strong>Perche:</strong> Traditional British unit, also called "rod" or "pole"
                   </li>
                   <li>
                     <strong>Toise:</strong> Historical French unit of length and area
                   </li>
                 </ul>
               </div>
             )}
             
             <div className="mt-4 flex items-center justify-between">
               <span className="text-sm text-slate-600">
                 <Maximize2 size={16} className="inline mr-1" />
                 Area dimensions: {sideLength.toFixed(1)}m × {sideLength.toFixed(1)}m
               </span>
             </div>
           </div>
         </div>
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
         {/* 3D Visualization */}
         <div className="xl:col-span-3">
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 border-b border-slate-200">
               <div className="flex items-center justify-between">
                 <div>
                   <h2 className="text-lg font-semibold text-slate-900">3D Visualization</h2>
                   <p className="text-sm text-slate-600 mt-1">
                     {drawingMode === 'rectangle' 
                       ? 'Click and drag to draw subdivisions'
                       : 'Drag to rotate • Scroll to zoom • Outdoor environment'
                     }
                   </p>
                 </div>
               </div>
             </div>
             <div style={{ width: '100%', height: '500px', backgroundColor: '#f8fafc' }}>
               <Canvas camera={{ position: [50, 50, 50], fov: 75 }}>
                 <Scene 
                   sideLength={sideLength} 
                   environment="outdoor" 
                   selectedComparison={selectedComparison}
                   totalAreaInSqM={totalAreaInSqM}
                   drawingMode={drawingMode}
                   subdivisions={subdivisions}
                   setSubdivisions={setSubdivisions}
                 />
               </Canvas>
             </div>
           </div>
           
           {/* Subdivisions List */}
           {subdivisions.length > 0 && (
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 mt-4">
               <div className="p-4 border-b border-slate-200">
                 <h3 className="text-lg font-semibold text-slate-900">Subdivisions</h3>
                 <p className="text-sm text-slate-600 mt-1">
                   Total subdivided: {formatNumber(subdivisionsTotal)} m² • 
                   Remaining: {formatNumber(remainingArea)} m²
                 </p>
               </div>
               <div className="p-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                   {subdivisions.map((subdivision) => (
                     <div
                       key={subdivision.id}
                       className="bg-slate-50 rounded-lg p-3 border border-slate-200 hover:border-slate-300 transition-colors"
                     >
                       <div className="flex items-center justify-between mb-2">
                         <div 
                           className="w-4 h-4 rounded"
                           style={{ backgroundColor: subdivision.color }}
                         />
                         {editingSubdivision === subdivision.id ? (
                           <input
                             type="text"
                             value={subdivision.label}
                             onChange={(e) => handleEditSubdivision(subdivision.id, e.target.value)}
                             onBlur={() => setEditingSubdivision(null)}
                             onKeyPress={(e) => {
                               if (e.key === 'Enter') {
                                 setEditingSubdivision(null);
                               }
                             }}
                             className="flex-1 mx-2 px-2 py-1 text-sm bg-white border border-slate-300 rounded"
                             autoFocus
                           />
                         ) : (
                           <span className="flex-1 mx-2 font-medium text-slate-900">
                             {subdivision.label}
                           </span>
                         )}
                         <div className="flex items-center gap-1">
                           <button
                             onClick={() => setEditingSubdivision(subdivision.id)}
                             className="p-1 text-slate-600 hover:text-slate-900"
                           >
                             <Edit3 size={14} />
                           </button>
                           <button
                             onClick={() => handleDeleteSubdivision(subdivision.id)}
                             className="p-1 text-red-600 hover:text-red-700"
                           >
                             <Trash2 size={14} />
                           </button>
                         </div>
                       </div>
                       <div className="text-sm text-slate-600">
                         Area: {formatNumber(subdivision.area)} m²
                       </div>
                       <div className="text-xs text-slate-500 mt-1">
                         {subdivision.width.toFixed(1)}m × {subdivision.length.toFixed(1)}m
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           )}
         </div>

         {/* Sidebar */}
         <div className="space-y-6">
           {/* Size Comparisons */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200">
             <div className="p-4 border-b border-slate-200">
               <h3 className="text-lg font-semibold text-slate-900">Visual Comparisons</h3>
               <p className="text-sm text-slate-600 mt-1">Click to overlay comparison objects</p>
             </div>
             <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
               {comparisonOptions.map((comparison) => {
                 const count = totalAreaInSqM / comparison.area;
                 return (
                   <button
                     key={comparison.id}
                     className={`w-full p-4 rounded-xl border-2 text-left transition-all transform hover:scale-[1.02] ${
                       selectedComparison === comparison.id
                         ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md'
                         : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'
                     }`}
                     onClick={() => setSelectedComparison(
                       selectedComparison === comparison.id ? null : comparison.id
                     )}
                     disabled={drawingMode === 'rectangle'}
                   >
                     <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-3">
                         <div className="text-3xl">
                           {comparison.icon}
                         </div>
                         <div>
                           <div className="font-semibold text-slate-900">{comparison.name}</div>
                           <div className="text-sm text-slate-600">
                             {count >= 1 
                               ? `${count.toFixed(1)} ${count === 1 ? 'fits' : 'fit'} in your area`
                               : `You need ${(1/count).toFixed(1)} areas`}
                           </div>
                           <div className="text-xs text-slate-500 mt-1">
                             {comparison.dimensions.width}m × {comparison.dimensions.length}m
                           </div>
                         </div>
                       </div>
                       <div className="flex flex-col items-end">
                         <div className={`w-4 h-4 rounded-full transition-all ${
                           selectedComparison === comparison.id 
                             ? 'bg-blue-500 ring-4 ring-blue-200' 
                             : 'bg-slate-300'
                         }`} />
                         <div className="text-xs text-slate-500 mt-1">
                           {formatNumber(comparison.area)} m²
                         </div>
                       </div>
                     </div>
                   </button>
                 );
               })}
             </div>
           </div>

           {/* All Conversions */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200">
             <div className="p-4 border-b border-slate-200">
               <h3 className="text-lg font-semibold text-slate-900">All Conversions</h3>
             </div>
             <div className="p-4 space-y-2">
               {Object.entries(unitConversions).map(([unit, conversion]) => (
                 <div key={unit} className="flex justify-between items-center py-2">
                   <span className="text-sm font-medium text-slate-700 capitalize">{unit}</span>
                   <span className="text-sm font-mono text-slate-900 bg-slate-100 px-3 py-1 rounded">
                     {formatNumber(totalAreaInSqM / conversion)}
                   </span>
                 </div>
               ))}
             </div>
           </div>
           
           {/* Area Summary */}
           {subdivisions.length > 0 && (
             <div className="bg-white rounded-xl shadow-sm border border-slate-200">
               <div className="p-4 border-b border-slate-200">
                 <h3 className="text-lg font-semibold text-slate-900">Area Summary</h3>
               </div>
               <div className="p-4 space-y-3">
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-medium text-slate-700">Total Area</span>
                   <span className="text-sm font-mono text-slate-900">
                     {formatNumber(totalAreaInSqM)} m²
                   </span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-medium text-slate-700">Subdivided</span>
                   <span className="text-sm font-mono text-green-600">
                     {formatNumber(subdivisionsTotal)} m²
                   </span>
                 </div>
                 <div className="flex justify-between items-center pt-2 border-t">
                   <span className="text-sm font-medium text-slate-700">Remaining</span>
                   <span className="text-sm font-mono text-blue-600">
                     {formatNumber(remainingArea)} m²
                   </span>
                 </div>
                 <div className="text-xs text-slate-500 mt-2">
                   {((subdivisionsTotal / totalAreaInSqM) * 100).toFixed(1)}% subdivided
                 </div>
               </div>
             </div>
           )}
         </div>
       </div>
     </div>
   </div>
 );
};

function App() {
 return <LandVisualizer />;
}

export default App;