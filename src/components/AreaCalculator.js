import React, { useState, useCallback } from 'react';
import { Calculator, Pentagon, Trash2, RotateCcw, Save, MapPin, Copy, Check } from 'lucide-react';

const AreaCalculator = ({ 
  polygons,
  onAddPolygon,
  onUpdatePolygon, 
  onDeletePolygon,
  onClearAll,
  activePolygon,
  onSetActivePolygon,
  darkMode,
  isActive,
  onToggle 
}) => {
  const [copiedId, setCopiedId] = useState(null);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  
  // Calculate total area of all polygons
  const totalArea = polygons.reduce((sum, polygon) => sum + polygon.area, 0);
  
  // Format area with appropriate units
  const formatArea = (area) => {
    if (area >= 10000) {
      return `${(area / 10000).toFixed(3)} ha`;
    } else if (area >= 1) {
      return `${area.toFixed(2)} m²`;
    } else {
      return `${(area * 10000).toFixed(1)} cm²`;
    }
  };
  
  // Calculate polygon area using shoelace formula
  const calculatePolygonArea = (points) => {
    if (points.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].z - points[j].x * points[i].z;
    }
    return Math.abs(area) / 2;
  };
  
  // Calculate polygon perimeter
  const calculatePerimeter = (points) => {
    if (points.length < 2) return 0;
    
    let perimeter = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      const dx = points[j].x - points[i].x;
      const dz = points[j].z - points[i].z;
      perimeter += Math.sqrt(dx * dx + dz * dz);
    }
    return perimeter;
  };
  
  // Format distance
  const formatDistance = (distance) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(2)} km`;
    } else if (distance >= 1) {
      return `${distance.toFixed(2)} m`;
    } else {
      return `${(distance * 100).toFixed(1)} cm`;
    }
  };
  
  // Get polygon center point
  const getPolygonCenter = (points) => {
    if (points.length === 0) return { x: 0, z: 0 };
    
    const center = points.reduce((acc, point) => ({
      x: acc.x + point.x,
      z: acc.z + point.z
    }), { x: 0, z: 0 });
    
    return {
      x: center.x / points.length,
      z: center.z / points.length
    };
  };
  
  // Copy polygon data to clipboard
  const copyPolygon = async (polygon) => {
    const center = getPolygonCenter(polygon.points);
    const perimeter = calculatePerimeter(polygon.points);
    
    const text = `${polygon.name}
Area: ${formatArea(polygon.area)} (${polygon.area.toFixed(3)} m²)
Perimeter: ${formatDistance(perimeter)}
Points: ${polygon.points.length}
Center: (${center.x.toFixed(2)}, ${center.z.toFixed(2)})`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(polygon.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy polygon data:', err);
    }
  };
  
  // Export all polygons as CSV
  const exportPolygons = () => {
    const csvHeader = 'Name,Area (m²),Area (ft²),Perimeter (m),Points,Center X,Center Z\n';
    const csvRows = polygons.map(polygon => {
      const perimeter = calculatePerimeter(polygon.points);
      const center = getPolygonCenter(polygon.points);
      return `"${polygon.name}",${polygon.area.toFixed(3)},${(polygon.area * 10.764).toFixed(3)},${perimeter.toFixed(3)},${polygon.points.length},${center.x.toFixed(3)},${center.z.toFixed(3)}`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `irregular-areas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  // Start new polygon
  const startNewPolygon = () => {
    const newPolygon = {
      id: Date.now() + Math.random(),
      name: `Area ${polygons.length + 1}`,
      points: [],
      area: 0,
      isComplete: false,
      color: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899'][polygons.length % 7],
      createdAt: new Date().toISOString()
    };
    
    onAddPolygon(newPolygon);
    onSetActivePolygon(newPolygon.id);
  };
  
  // Complete current polygon
  const completeActivePolygon = () => {
    if (activePolygon) {
      const polygon = polygons.find(p => p.id === activePolygon);
      if (polygon && polygon.points.length >= 3) {
        onUpdatePolygon(activePolygon, { ...polygon, isComplete: true });
        onSetActivePolygon(null);
      }
    }
  };
  
  // Cancel current polygon
  const cancelActivePolygon = () => {
    if (activePolygon) {
      onDeletePolygon(activePolygon);
      onSetActivePolygon(null);
    }
  };

  return (
    <div className={`rounded-xl shadow-sm border mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold flex items-center ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <Calculator className={`w-5 h-5 mr-2 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`} />
            Irregular Area Calculator
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                isActive
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {isActive ? 'Exit Calculator' : 'Start Calculator'}
            </button>
            {polygons.length > 0 && (
              <button
                onClick={onClearAll}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-red-400 hover:bg-gray-700' 
                    : 'text-red-600 hover:bg-red-50'
                }`}
                title="Clear all areas"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
        
        {isActive && (
          <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'} border`}>
            <p className={`text-sm mb-2 ${darkMode ? 'text-green-200' : 'text-green-800'}`}>
              <strong>Click points</strong> on the 3D land to trace irregular shapes. Minimum 3 points required.
            </p>
            
            {/* Active polygon controls */}
            {activePolygon ? (
              <div className="flex items-center gap-2 pt-2 border-t border-green-300/30">
                <span className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                  Drawing: {polygons.find(p => p.id === activePolygon)?.name} 
                  ({polygons.find(p => p.id === activePolygon)?.points.length || 0} points)
                </span>
                <button
                  onClick={completeActivePolygon}
                  disabled={!polygons.find(p => p.id === activePolygon)?.points.length || polygons.find(p => p.id === activePolygon)?.points.length < 3}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    polygons.find(p => p.id === activePolygon)?.points.length >= 3
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  <Save size={12} className="mr-1" />
                  Complete
                </button>
                <button
                  onClick={cancelActivePolygon}
                  className="px-2 py-1 rounded text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  <RotateCcw size={12} className="mr-1" />
                  Cancel
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-green-300/30">
                <button
                  onClick={startNewPolygon}
                  className="px-3 py-1 rounded text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  <Pentagon size={14} className="mr-1" />
                  Start New Area
                </button>
              </div>
            )}
          </div>
        )}

        {/* Summary Statistics */}
        {polygons.length > 0 && (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {polygons.length}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Irregular Areas
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatArea(totalArea)}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Area
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {polygons.reduce((sum, p) => sum + p.points.length, 0)}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Points
              </div>
            </div>
          </div>
        )}

        {/* Polygons List */}
        {polygons.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Calculated Areas ({polygons.length})
              </h4>
              <button
                onClick={exportPolygons}
                className={`text-sm px-3 py-1 rounded-md transition-colors flex items-center ${
                  darkMode 
                    ? 'text-blue-400 hover:bg-gray-700' 
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Calculator size={14} className="mr-1" />
                Export CSV
              </button>
            </div>
            
            <div className={`max-h-64 overflow-y-auto space-y-2 border rounded-lg ${
              darkMode ? 'border-gray-600' : 'border-gray-200'
            }`}>
              {polygons.map((polygon) => {
                const perimeter = calculatePerimeter(polygon.points);
                const isCopied = copiedId === polygon.id;
                const isActiveDrawing = polygon.id === activePolygon;
                
                return (
                  <div 
                    key={polygon.id}
                    className={`p-3 border-b last:border-b-0 transition-colors ${
                      isActiveDrawing 
                        ? darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                        : darkMode 
                          ? 'border-gray-600 hover:bg-gray-700' 
                          : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-white"
                          style={{ backgroundColor: polygon.color }}
                        />
                        <div>
                          <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {polygon.name} {isActiveDrawing && '(Drawing)'}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatArea(polygon.area)} • {polygon.points.length} points
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyPolygon(polygon)}
                          className={`p-1 rounded transition-colors ${
                            darkMode 
                              ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                          }`}
                          title="Copy area data"
                        >
                          {isCopied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                        {!isActiveDrawing && (
                          <button
                            onClick={() => onDeletePolygon(polygon.id)}
                            className={`p-1 rounded transition-colors ${
                              darkMode 
                                ? 'text-red-400 hover:text-red-300 hover:bg-gray-700' 
                                : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                            }`}
                            title="Delete area"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {polygon.points.length > 0 && (
                      <div className={`mt-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Perimeter: {formatDistance(perimeter)} • 
                        Center: ({getPolygonCenter(polygon.points).x.toFixed(2)}, {getPolygonCenter(polygon.points).z.toFixed(2)})
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Pentagon size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium mb-1">No irregular areas calculated</p>
            <p className="text-sm">Click "Start Calculator" to begin tracing irregular shaped areas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AreaCalculator;