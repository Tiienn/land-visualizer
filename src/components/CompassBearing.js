import React, { useState, useCallback } from 'react';
import { Compass, Navigation, Target, Trash2, Download, Copy, Check, MapPin } from 'lucide-react';

// Utility functions for bearing calculations
const calculateBearing = (point1, point2) => {
  const deltaX = point2.x - point1.x;
  const deltaZ = point2.z - point1.z;
  
  // Calculate bearing in radians (0 = North, clockwise positive)
  let bearing = Math.atan2(deltaX, deltaZ);
  
  // Convert to degrees and normalize to 0-360
  bearing = bearing * (180 / Math.PI);
  if (bearing < 0) bearing += 360;
  
  return bearing;
};

const calculateDistance = (point1, point2) => {
  const deltaX = point2.x - point1.x;
  const deltaZ = point2.z - point1.z;
  return Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);
};

// Convert decimal degrees to degrees, minutes, seconds
const toDMS = (decimal) => {
  const degrees = Math.floor(decimal);
  const minutes = Math.floor((decimal - degrees) * 60);
  const seconds = ((decimal - degrees) * 60 - minutes) * 60;
  return { degrees, minutes, seconds };
};

// Format bearing as traditional surveying notation
const formatBearing = (bearing, format = 'azimuth') => {
  switch (format) {
    case 'azimuth':
      return `${bearing.toFixed(2)}°`;
    
    case 'quadrant':
      // Convert to quadrant bearing (N 30° E, S 45° W, etc.)
      let quad = '';
      let angle = 0;
      
      if (bearing <= 90) {
        quad = 'N';
        angle = bearing;
        if (angle > 0) quad += ` ${angle.toFixed(2)}° E`;
      } else if (bearing <= 180) {
        quad = 'S';
        angle = 180 - bearing;
        if (angle > 0) quad += ` ${angle.toFixed(2)}° E`;
      } else if (bearing <= 270) {
        quad = 'S';
        angle = bearing - 180;
        if (angle > 0) quad += ` ${angle.toFixed(2)}° W`;
      } else {
        quad = 'N';
        angle = 360 - bearing;
        if (angle > 0) quad += ` ${angle.toFixed(2)}° W`;
      }
      
      return quad;
    
    case 'dms':
      const dms = toDMS(bearing);
      return `${dms.degrees}° ${dms.minutes}' ${dms.seconds.toFixed(1)}"`;
    
    default:
      return `${bearing.toFixed(2)}°`;
  }
};

// Get magnetic declination (simplified - in real app would use location-based lookup)
const getMagneticDeclination = () => {
  // Default to 0° for this demo (varies by location and time)
  return 0;
};

const CompassBearing = ({ 
  bearings, 
  onAddBearing, 
  onUpdateBearing, 
  onDeleteBearing, 
  onClearAll, 
  darkMode, 
  isActive, 
  onToggle 
}) => {
  const [copiedId, setCopiedId] = useState(null);
  const [bearingFormat, setBearingFormat] = useState('azimuth');
  const [showMagnetic, setShowMagnetic] = useState(false);
  const [selectedBearing, setSelectedBearing] = useState(null);
  const [compassMode, setCompassMode] = useState('bearing'); // 'bearing' or 'traverse'
  
  const totalDistance = bearings.reduce((sum, b) => sum + b.distance, 0);
  const averageBearing = bearings.length > 0 ? 
    bearings.reduce((sum, b) => sum + b.bearing, 0) / bearings.length : 0;

  const copyBearingData = useCallback((bearing) => {
    const magneticBearing = bearing.bearing + getMagneticDeclination();
    const data = [
      `Station: ${bearing.name || `Point ${bearing.id}`}`,
      `True Bearing: ${formatBearing(bearing.bearing, bearingFormat)}`,
      `Magnetic Bearing: ${formatBearing(magneticBearing, bearingFormat)}`,
      `Distance: ${bearing.distance.toFixed(3)}m`,
      `Coordinates: (${bearing.startPoint.x.toFixed(3)}, ${bearing.startPoint.z.toFixed(3)}) to (${bearing.endPoint.x.toFixed(3)}, ${bearing.endPoint.z.toFixed(3)})`
    ].join('\n');
    
    navigator.clipboard.writeText(data);
    setCopiedId(bearing.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, [bearingFormat]);

  const exportBearingsCSV = useCallback(() => {
    const headers = ['Station', 'True_Bearing_Deg', 'True_Bearing_Quad', 'Magnetic_Bearing_Deg', 'Distance_m', 'Start_X', 'Start_Z', 'End_X', 'End_Z', 'Notes'];
    const rows = bearings.map(bearing => {
      const magneticBearing = bearing.bearing + getMagneticDeclination();
      return [
        bearing.name || `Point_${bearing.id}`,
        bearing.bearing.toFixed(6),
        formatBearing(bearing.bearing, 'quadrant').replace(/[,\n]/g, ' '),
        magneticBearing.toFixed(6),
        bearing.distance.toFixed(3),
        bearing.startPoint.x.toFixed(3),
        bearing.startPoint.z.toFixed(3),
        bearing.endPoint.x.toFixed(3),
        bearing.endPoint.z.toFixed(3),
        bearing.notes || ''
      ];
    });
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compass_bearings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [bearings]);

  const calculateTraverseError = useCallback(() => {
    if (bearings.length < 3) return null;
    
    // Calculate closure error for traverse
    let totalX = 0, totalZ = 0;
    
    bearings.forEach(bearing => {
      const radians = (bearing.bearing * Math.PI) / 180;
      totalX += bearing.distance * Math.sin(radians);
      totalZ += bearing.distance * Math.cos(radians);
    });
    
    const linearError = Math.sqrt(totalX * totalX + totalZ * totalZ);
    const perimeter = bearings.reduce((sum, b) => sum + b.distance, 0);
    const relativeError = perimeter > 0 ? linearError / perimeter : 0;
    
    return {
      linearError,
      relativeError,
      errorRatio: relativeError > 0 ? `1:${Math.round(1 / relativeError)}` : 'Perfect'
    };
  }, [bearings]);

  const traverseError = calculateTraverseError();

  return (
    <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
      <div className={`p-4 border-b ${darkMode ? 'border-gray-600' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Compass className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Compass & Bearing Tools
            </h3>
          </div>
          <button
            onClick={onToggle}
            className={`px-3 py-1 text-xs rounded-lg transition-all ${
              isActive
                ? darkMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-500 text-white'
                : darkMode
                  ? 'bg-gray-600 text-gray-300'
                  : 'bg-gray-300 text-gray-700'
            }`}
          >
            {isActive ? 'ACTIVE' : 'INACTIVE'}
          </button>
        </div>

        {isActive && (
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Click two points to measure bearing and distance. Professional surveying calculations included.
          </p>
        )}
      </div>

      {isActive && (
        <div className="p-4 space-y-4">
          {/* Mode Selection */}
          <div className="flex space-x-2">
            <button
              onClick={() => setCompassMode('bearing')}
              className={`px-3 py-2 text-sm rounded-lg transition-all ${
                compassMode === 'bearing'
                  ? darkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Navigation className="w-4 h-4 inline mr-1" />
              Individual Bearings
            </button>
            <button
              onClick={() => setCompassMode('traverse')}
              className={`px-3 py-2 text-sm rounded-lg transition-all ${
                compassMode === 'traverse'
                  ? darkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Target className="w-4 h-4 inline mr-1" />
              Traverse Survey
            </button>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Bearing Format
              </label>
              <select
                value={bearingFormat}
                onChange={(e) => setBearingFormat(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                }`}
              >
                <option value="azimuth">Azimuth (0-360°)</option>
                <option value="quadrant">Quadrant (N 30° E)</option>
                <option value="dms">Degrees-Minutes-Seconds</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showMagnetic}
                  onChange={(e) => setShowMagnetic(e.target.checked)}
                  className="rounded"
                />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Show Magnetic Bearing
                </span>
              </label>
            </div>
          </div>

          {/* Statistics */}
          {bearings.length > 0 && (
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {bearings.length}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Bearings
                  </div>
                </div>
                <div>
                  <div className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {totalDistance.toFixed(2)}m
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Total Distance
                  </div>
                </div>
                <div>
                  <div className={`text-lg font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    {formatBearing(averageBearing, bearingFormat)}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Average Bearing
                  </div>
                </div>
                {traverseError && (
                  <div>
                    <div className={`text-lg font-bold ${
                      traverseError.linearError < 0.1 ? 'text-green-400' : 
                      traverseError.linearError < 0.5 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {traverseError.errorRatio}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Traverse Accuracy
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {bearings.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportBearingsCSV}
                className={`inline-flex items-center px-3 py-2 text-sm rounded-lg transition-all ${
                  darkMode
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <Download className="w-4 h-4 mr-1" />
                Export CSV
              </button>
              
              <button
                onClick={onClearAll}
                className={`inline-flex items-center px-3 py-2 text-sm rounded-lg transition-all ${
                  darkMode
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All
              </button>
            </div>
          )}

          {/* Bearings List */}
          <div className="space-y-2">
            {bearings.map((bearing, index) => {
              const magneticBearing = bearing.bearing + getMagneticDeclination();
              const isCopied = copiedId === bearing.id;
              
              return (
                <div
                  key={bearing.id}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedBearing === bearing.id
                      ? darkMode
                        ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                        : 'border-blue-500 bg-blue-50'
                      : darkMode
                        ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedBearing(selectedBearing === bearing.id ? null : bearing.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {bearing.name || `Bearing ${index + 1}`}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            True Bearing: 
                          </span>
                          <span className={`font-mono ml-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            {formatBearing(bearing.bearing, bearingFormat)}
                          </span>
                        </div>
                        
                        {showMagnetic && (
                          <div>
                            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Magnetic: 
                            </span>
                            <span className={`font-mono ml-1 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                              {formatBearing(magneticBearing, bearingFormat)}
                            </span>
                          </div>
                        )}
                        
                        <div>
                          <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Distance: 
                          </span>
                          <span className={`font-mono ml-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                            {bearing.distance.toFixed(3)}m
                          </span>
                        </div>
                        
                        <div>
                          <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Coordinates: 
                          </span>
                          <span className={`font-mono ml-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            ({bearing.startPoint.x.toFixed(1)}, {bearing.startPoint.z.toFixed(1)}) → ({bearing.endPoint.x.toFixed(1)}, {bearing.endPoint.z.toFixed(1)})
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyBearingData(bearing);
                        }}
                        className={`p-1 rounded transition-colors ${
                          isCopied
                            ? 'text-green-600'
                            : darkMode
                              ? 'text-gray-400 hover:text-white hover:bg-gray-600'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                        title="Copy bearing data"
                      >
                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBearing(bearing.id);
                        }}
                        className={`p-1 rounded transition-colors ${
                          darkMode
                            ? 'text-red-400 hover:text-red-300 hover:bg-gray-600'
                            : 'text-red-500 hover:text-red-700 hover:bg-gray-100'
                        }`}
                        title="Delete bearing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {bearings.length === 0 && (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Compass className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium mb-1">No bearings recorded</p>
              <p className="text-sm">Click two points in the 3D view to start measuring bearings</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Export utility functions for use in other components
export { calculateBearing, calculateDistance, formatBearing, toDMS };
export default CompassBearing;