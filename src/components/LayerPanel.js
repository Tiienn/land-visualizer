import React, { useState } from 'react';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  Plus, 
  ChevronDown,
  ChevronRight,
  Square,
  Palette,
  Type,
  Save,
  X
} from 'lucide-react';

const LayerPanel = ({ 
  darkMode, 
  subdivisions, 
  onUpdateSubdivision, 
  onDeleteSubdivision,
  selectedSubdivision,
  onSelectSubdivision,
  isExpanded,
  onToggleExpanded 
}) => {
  const [editingLayer, setEditingLayer] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#3b82f6');
  const [showColorPicker, setShowColorPicker] = useState(null);

  // Filter out the default land area, only show user-drawn layers
  const userLayers = subdivisions.filter(sub => sub.id !== 'default-square');

  // Predefined color palette
  const colorPalette = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6',
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#64748b', '#6b7280', '#374151', '#1f2937'
  ];

  const handleEditStart = (layer) => {
    setEditingLayer(layer.id);
    setEditName(layer.label);
    setEditColor(layer.color);
  };

  const handleEditSave = () => {
    if (editingLayer) {
      onUpdateSubdivision(editingLayer, {
        label: editName.trim() || 'Unnamed Layer',
        color: editColor
      });
      setEditingLayer(null);
      setEditName('');
      setShowColorPicker(null);
    }
  };

  const handleEditCancel = () => {
    setEditingLayer(null);
    setEditName('');
    setEditColor('#3b82f6');
    setShowColorPicker(null);
  };

  const toggleLayerVisibility = (layerId, currentVisibility) => {
    onUpdateSubdivision(layerId, {
      visible: currentVisibility !== false ? false : true
    });
  };

  const formatArea = (area) => {
    if (area >= 10000) {
      return `${(area / 10000).toFixed(2)} ha`;
    } else if (area >= 1000) {
      return `${(area / 1000).toFixed(1)}k m²`;
    } else {
      return `${Math.round(area)} m²`;
    }
  };

  return (
    <div className={`border-l transition-all duration-200 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } ${isExpanded ? 'w-80' : 'w-12'}`}>
      
      {/* Toggle Button */}
      <div className={`p-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          onClick={onToggleExpanded}
          className={`w-full flex items-center justify-center p-2 rounded-lg transition-colors ${
            darkMode 
              ? 'hover:bg-gray-700 text-gray-300' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          title={isExpanded ? "Collapse Layers Panel" : "Expand Layers Panel"}
        >
          <Layers size={20} />
          {isExpanded && (
            <>
              <span className="ml-2 font-medium">Layers</span>
              <div className="ml-auto">
                {isExpanded ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
              </div>
            </>
          )}
        </button>
      </div>

      {/* Panel Content */}
      {isExpanded && (
        <div className="flex flex-col h-full">
          
          {/* Layer Count Header */}
          <div className={`p-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {userLayers.length} Layer{userLayers.length !== 1 ? 's' : ''}
              </span>
              <div className={`text-xs px-2 py-1 rounded-full ${
                darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
              }`}>
                Rectangle Tool
              </div>
            </div>
          </div>

          {/* Layers List */}
          <div className="flex-1 overflow-y-auto">
            {userLayers.length === 0 ? (
              <div className="p-4 text-center">
                <Square className={`mx-auto mb-3 ${
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                }`} size={32} />
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  No layers yet
                </p>
                <p className={`text-xs mt-1 ${
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  Use Rectangle tool to draw areas
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {userLayers.map((layer, index) => (
                  <div
                    key={layer.id}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedSubdivision?.id === layer.id
                        ? darkMode 
                          ? 'border-blue-500 bg-blue-900/30' 
                          : 'border-blue-500 bg-blue-50'
                        : darkMode
                          ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => onSelectSubdivision(layer)}
                  >
                    
                    {/* Layer Header */}
                    <div className="flex items-center gap-2 mb-2">
                      {/* Color Indicator */}
                      <div 
                        className="w-4 h-4 rounded border-2 border-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: layer.color }}
                      />
                      
                      {/* Layer Name */}
                      {editingLayer === layer.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditSave();
                            if (e.key === 'Escape') handleEditCancel();
                          }}
                          className={`flex-1 px-2 py-1 text-sm rounded border ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className={`flex-1 text-sm font-medium truncate ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {layer.label}
                        </span>
                      )}
                      
                      {/* Layer Actions */}
                      <div className="flex items-center gap-1">
                        {editingLayer === layer.id ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditSave();
                              }}
                              className={`p-1 rounded transition-colors ${
                                darkMode 
                                  ? 'hover:bg-gray-600 text-green-400' 
                                  : 'hover:bg-gray-200 text-green-600'
                              }`}
                              title="Save changes"
                            >
                              <Save size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCancel();
                              }}
                              className={`p-1 rounded transition-colors ${
                                darkMode 
                                  ? 'hover:bg-gray-600 text-gray-400' 
                                  : 'hover:bg-gray-200 text-gray-500'
                              }`}
                              title="Cancel editing"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLayerVisibility(layer.id, layer.visible);
                              }}
                              className={`p-1 rounded transition-colors ${
                                darkMode 
                                  ? 'hover:bg-gray-600 text-gray-400' 
                                  : 'hover:bg-gray-200 text-gray-500'
                              }`}
                              title={layer.visible !== false ? "Hide layer" : "Show layer"}
                            >
                              {layer.visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditStart(layer);
                              }}
                              className={`p-1 rounded transition-colors ${
                                darkMode 
                                  ? 'hover:bg-gray-600 text-gray-400' 
                                  : 'hover:bg-gray-200 text-gray-500'
                              }`}
                              title="Edit layer"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Delete layer "${layer.label}"?`)) {
                                  onDeleteSubdivision(layer.id);
                                }
                              }}
                              className={`p-1 rounded transition-colors ${
                                darkMode 
                                  ? 'hover:bg-gray-600 text-red-400' 
                                  : 'hover:bg-gray-200 text-red-500'
                              }`}
                              title="Delete layer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Layer Info */}
                    <div className={`flex items-center justify-between text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <span>
                        {layer.width?.toFixed(1)}m × {layer.height?.toFixed(1)}m
                      </span>
                      <span className="font-medium">
                        {formatArea(layer.area)}
                      </span>
                    </div>

                    {/* Color Editor */}
                    {editingLayer === layer.id && (
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <div className="flex items-center gap-2 mb-2">
                          <Palette size={14} />
                          <span className="text-xs font-medium">Color</span>
                        </div>
                        <div className="grid grid-cols-10 gap-1">
                          {colorPalette.map((color) => (
                            <button
                              key={color}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditColor(color);
                              }}
                              className={`w-6 h-6 rounded border-2 transition-all ${
                                editColor === color 
                                  ? 'border-white shadow-lg scale-110' 
                                  : 'border-gray-400 hover:scale-105'
                              }`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                        <input
                          type="color"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="w-full mt-2 h-8 rounded border border-gray-600"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`p-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-xs text-center ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              Select Rectangle tool to add layers
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayerPanel;