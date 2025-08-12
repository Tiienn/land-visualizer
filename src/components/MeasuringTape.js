import React, { useState } from 'react';
import { Ruler, Trash2, Calculator, Copy, Check } from 'lucide-react';

const MeasuringTape = ({ 
  measurements, 
  onAddMeasurement, 
  onUpdateMeasurement, 
  onDeleteMeasurement,
  onClearAll,
  darkMode,
  isActive,
  onToggle 
}) => {
  const [copiedId, setCopiedId] = useState(null);
  
  // Calculate total length of all measurements
  const totalLength = measurements.reduce((sum, m) => sum + m.distance, 0);
  
  // Calculate area if measurements form a closed shape
  const calculatePolygonArea = () => {
    if (measurements.length < 3) return 0;
    
    const points = measurements.map(m => ({ x: m.start.x, z: m.start.z }));
    // Add the first point to close the polygon
    points.push(points[0]);
    
    let area = 0;
    for (let i = 0; i < points.length - 1; i++) {
      area += (points[i].x * points[i + 1].z - points[i + 1].x * points[i].z);
    }
    return Math.abs(area) / 2;
  };
  
  const polygonArea = calculatePolygonArea();
  
  // Format distance with appropriate units
  const formatDistance = (distance) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(2)} km`;
    } else if (distance >= 1) {
      return `${distance.toFixed(2)} m`;
    } else {
      return `${(distance * 100).toFixed(1)} cm`;
    }
  };
  
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
  
  // Calculate bearing between two points
  const calculateBearing = (start, end) => {
    const deltaX = end.x - start.x;
    const deltaZ = end.z - start.z;
    let bearing = Math.atan2(deltaX, deltaZ) * (180 / Math.PI);
    if (bearing < 0) bearing += 360;
    return bearing;
  };
  
  // Format bearing as compass direction
  const formatBearing = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return `${degrees.toFixed(1)}° (${directions[index]})`;
  };
  
  // Copy measurement to clipboard
  const copyMeasurement = async (measurement, index) => {
    const text = `Measurement ${index + 1}: ${formatDistance(measurement.distance)} | Bearing: ${formatBearing(calculateBearing(measurement.start, measurement.end))}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(measurement.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy measurement:', err);
    }
  };
  
  // Export all measurements as CSV
  const exportMeasurements = () => {
    const csvHeader = 'Index,Distance (m),Distance (ft),Start X,Start Z,End X,End Z,Bearing (deg),Bearing (compass)\n';
    const csvRows = measurements.map((m, i) => {
      const bearing = calculateBearing(m.start, m.end);
      const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
      const compassDir = directions[Math.round(bearing / 22.5) % 16];
      return `${i + 1},${m.distance.toFixed(3)},${(m.distance * 3.28084).toFixed(3)},${m.start.x.toFixed(3)},${m.start.z.toFixed(3)},${m.end.x.toFixed(3)},${m.end.z.toFixed(3)},${bearing.toFixed(1)},${compassDir}`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `land-measurements-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`rounded-xl shadow-sm border mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold flex items-center ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <Ruler className={`w-5 h-5 mr-2 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`} />
            Measuring Tape
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                isActive
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {isActive ? 'Exit Measure Mode' : 'Start Measuring'}
            </button>
            {measurements.length > 0 && (
              <button
                onClick={onClearAll}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-red-400 hover:bg-gray-700' 
                    : 'text-red-600 hover:bg-red-50'
                }`}
                title="Clear all measurements"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
        
        {isActive && (
          <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'} border`}>
            <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              <strong>Click two points</strong> on the 3D land to create a measurement. 
              Drag endpoints to adjust measurements dynamically.
            </p>
          </div>
        )}

        {/* Summary Statistics */}
        {measurements.length > 0 && (
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {measurements.length}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Measurements
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatDistance(totalLength)}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Length
              </div>
            </div>
            {polygonArea > 0 && (
              <div className="text-center">
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatArea(polygonArea)}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Enclosed Area
                </div>
              </div>
            )}
          </div>
        )}

        {/* Measurements List */}
        {measurements.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Measurements ({measurements.length})
              </h4>
              <button
                onClick={exportMeasurements}
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
              {measurements.map((measurement, index) => {
                const bearing = calculateBearing(measurement.start, measurement.end);
                const isCopied = copiedId === measurement.id;
                
                return (
                  <div 
                    key={measurement.id}
                    className={`p-3 border-b last:border-b-0 hover:bg-opacity-50 transition-colors ${
                      darkMode 
                        ? 'border-gray-600 hover:bg-gray-700' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatDistance(measurement.distance)}
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatBearing(bearing)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyMeasurement(measurement, index)}
                          className={`p-1 rounded transition-colors ${
                            darkMode 
                              ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                          }`}
                          title="Copy measurement"
                        >
                          {isCopied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                        <button
                          onClick={() => onDeleteMeasurement(measurement.id)}
                          className={`p-1 rounded transition-colors ${
                            darkMode 
                              ? 'text-red-400 hover:text-red-300 hover:bg-gray-700' 
                              : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                          }`}
                          title="Delete measurement"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Coordinates */}
                    <div className={`mt-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Start: ({measurement.start.x.toFixed(2)}, {measurement.start.z.toFixed(2)}) → 
                      End: ({measurement.end.x.toFixed(2)}, {measurement.end.z.toFixed(2)})
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Ruler size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium mb-1">No measurements yet</p>
            <p className="text-sm">Click "Start Measuring" to begin measuring distances on your land</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeasuringTape;