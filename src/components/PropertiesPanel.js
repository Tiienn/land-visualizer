import React, { useState, useEffect } from 'react';
import { Settings, Ruler, Mountain, ChevronLeft, ChevronRight, Edit, Square as SquareIcon, MousePointer, Edit3, Calculator } from 'lucide-react';
import { TerrainControls } from './TerrainElevation';
import UnitMetrics from './UnitMetrics';

const PropertiesPanel = ({
  darkMode,
  
  // Active tool state
  activeTool = null, // 'measuring', 'compass', 'terrain', etc.
  
  // Panel expansion callback
  onPropertiesPanelExpansionChange,
  
  clearAllBearings,
  
  // Terrain props
  terrainEnabled,
  setTerrainEnabled,
  terrainPreset,
  setTerrainPreset,
  terrainOpacity,
  setTerrainOpacity,
  
  // Enter Dimensions props
  showManualInput,
  setShowManualInput,
  manualDimensions,
  setManualDimensions,
  onAddManualSubdivision,
  
  // Toggle function
  onToggleRightSidebar,
  isPropertiesPanelExpanded,
  
  // Drawing mode info
  drawingMode,
  
  // Unit Metrics props
  units = []
}) => {
  const [activeSection, setActiveSection] = useState(null);

  // Auto-open section when activeTool changes (but don't override manual user selection)
  const [hasUserManuallySelectedSection, setHasUserManuallySelectedSection] = useState(false);
  
  useEffect(() => {
    // Only auto-set if user hasn't manually selected a section yet
    if (activeTool && !hasUserManuallySelectedSection) {
      setActiveSection(activeTool);
      // Notify parent about expansion state
      if (onPropertiesPanelExpansionChange) {
        onPropertiesPanelExpansionChange(true);
      }
    } else if (drawingMode && activeSection !== 'settings' && !hasUserManuallySelectedSection) {
      // Auto-open Properties when drawing mode is active (only if user hasn't manually selected)
      setActiveSection('settings');
      if (onPropertiesPanelExpansionChange) {
        onPropertiesPanelExpansionChange(true);
      }
    }
    // Don't auto-close when activeTool becomes null - let user close manually
  }, [activeTool, drawingMode, onPropertiesPanelExpansionChange, hasUserManuallySelectedSection]);

  // Handle section change
  const handleSectionChange = (sectionId) => {
    const newActiveSection = activeSection === sectionId ? null : sectionId;
    setActiveSection(newActiveSection);
    
    // Mark that user has manually selected a section
    setHasUserManuallySelectedSection(true);
    
    // Notify parent about expansion state
    if (onPropertiesPanelExpansionChange) {
      onPropertiesPanelExpansionChange(newActiveSection !== null);
    }
  };

  // Define property sections similar to left sidebar
  const propertySections = [
    {
      id: 'unit-metrics',
      label: 'Unit Metrics',
      icon: Calculator,
      description: 'Area conversions'
    },
    {
      id: 'terrain',
      label: 'Terrain',
      icon: Mountain,
      description: 'Elevation controls'
    },
    {
      id: 'dimensions',
      label: 'Dimensions',
      icon: Edit,
      description: 'Manual input tools'
    },
    {
      id: 'settings',
      label: 'Properties',
      icon: Settings,
      description: 'General properties'
    }
  ];
  const getActiveContent = () => {
    // Use activeSection if set, otherwise fall back to activeTool
    const currentSection = activeSection || activeTool;
    
    switch (currentSection) {
      case 'unit-metrics':
        return (
          <div className={`p-4 rounded-xl shadow-sm border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
          }`}>
            <UnitMetrics 
              darkMode={darkMode}
              units={units}
            />
          </div>
        );
      
      case 'terrain':
        return (
          <div className={`p-4 rounded-xl shadow-sm border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
          }`}>
            <TerrainControls
              currentPreset={terrainPreset}
              onPresetChange={setTerrainPreset}
              enabled={terrainEnabled}
              onToggle={() => setTerrainEnabled(!terrainEnabled)}
              darkMode={darkMode}
              opacity={terrainOpacity}
              onOpacityChange={setTerrainOpacity}
            />
          </div>
        );
      
      case 'dimensions':
        return (
          <div className={`p-4 rounded-xl shadow-sm border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
          }`}>
            <div className="mb-4">
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Enter Dimensions
              </h4>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Add a subdivision by entering specific dimensions
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Width (meters)
                </label>
                <input
                  type="number"
                  value={manualDimensions?.width || ''}
                  onChange={(e) => setManualDimensions(prev => ({ ...prev, width: e.target.value }))}
                  placeholder="Enter width"
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Length (meters)
                </label>
                <input
                  type="number"
                  value={manualDimensions?.length || ''}
                  onChange={(e) => setManualDimensions(prev => ({ ...prev, length: e.target.value }))}
                  placeholder="Enter length"
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Label (optional)
                </label>
                <input
                  type="text"
                  value={manualDimensions?.label || ''}
                  onChange={(e) => setManualDimensions(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Enter label"
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={onAddManualSubdivision}
                  disabled={!manualDimensions?.width || !manualDimensions?.length}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    !manualDimensions?.width || !manualDimensions?.length
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : darkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                >
                  Add Subdivision
                </button>
                
                <button
                  onClick={() => setManualDimensions({ width: '', length: '', label: '' })}
                  className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
                    darkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className={`space-y-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {/* Rectangle Drawing Mode Details */}
            {drawingMode === 'rectangle' && (
              <div className={`p-4 rounded-xl shadow-sm border ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <SquareIcon className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div>
                    <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Rectangle Drawing Tool
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Create rectangular subdivisions by clicking and dragging
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h5 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      How to use:
                    </h5>
                    <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <li>• Left-click and drag to create a rectangle</li>
                      <li>• Release to finalize the subdivision</li>
                      <li>• Right-click to rotate the 3D view</li>
                      <li>• Middle-click to pan around</li>
                    </ul>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${darkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                    <div className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                      <strong>Tip:</strong> The subdivisions will automatically calculate their area and display dimensions when created.
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Select Mode Details */}
            {drawingMode === 'select' && (
              <div className={`p-4 rounded-xl shadow-sm border ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <MousePointer className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div>
                    <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Selection Tool
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Select and modify existing subdivisions
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h5 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      How to use:
                    </h5>
                    <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <li>• Left-click on a subdivision to select it</li>
                      <li>• Selected subdivisions will be highlighted</li>
                      <li>• Use other tools to modify selected areas</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Polyline Mode Details */}
            {drawingMode === 'polyline' && (
              <div className={`p-4 rounded-xl shadow-sm border ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  <Edit3 className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div>
                    <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Polyline Drawing Tool
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Create custom irregular shapes by clicking points
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h5 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      How to use:
                    </h5>
                    <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <li>• Click to place points along the boundary</li>
                      <li>• Continue clicking to add more points</li>
                      <li>• Double-click to finish the shape</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* General Properties when no drawing mode */}
            {!drawingMode && (
              <div className={`p-4 rounded-xl shadow-sm border ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
              }`}>
                <div className="mb-4">
                  <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    General Properties
                  </h4>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Application status and information
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      3D Scene Status
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                    }`}>
                      Active
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Camera Controls
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                    }`}>
                      Right-click rotate
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Drawing Mode
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {drawingMode || 'None'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        );
      
      default:
        return (
          <div className={`text-center py-12 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium mb-2">Properties</p>
            <p className="text-sm">
              Select a tool from the ribbon to view its properties and settings here.
            </p>
          </div>
        );
    }
  };

  const getToolIcon = () => {
    switch (activeTool) {
      case 'terrain':
        return <Mountain className="w-5 h-5" />;
      case 'dimensions':
        return <Edit className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const getToolTitle = () => {
    switch (activeTool) {
      case 'terrain':
        return 'Terrain Elevation';
      case 'dimensions':
        return 'Enter Dimensions';
      case 'settings':
        return 'Properties';
      default:
        return 'Properties';
    }
  };

  return (
    <>
      {/* Canva-style Properties Panel */}
      <div
        className={`
          fixed right-0 z-30 transition-all duration-200 ease-out
          ${isPropertiesPanelExpanded ? 'w-80' : 'w-20'}
          ${darkMode
            ? 'bg-gray-950 border-l border-gray-800'
            : 'bg-white border-l border-gray-100'
          } shadow-sm
        `}
        style={{ top: '200px', height: 'calc(100vh - 200px)' }}
      >
        <div className="flex h-full">
          {/* Right Content Panel */}
          {isPropertiesPanelExpanded && (
            <div className={`
              flex-1 border-r overflow-y-auto right-sidebar-content
              ${darkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-100 bg-white light-mode-safeguards'}
            `}>
              {/* Header */}
              <div className={`
                sticky top-0 z-10 p-4 border-b
                ${darkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-100 bg-white'}
              `}>
                <h3 className={`text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {propertySections.find(s => s.id === activeSection)?.label || 'Properties'}
                </h3>
              </div>

              {/* Content Area */}
              <div className="p-4">
                {getActiveContent()}
              </div>
            </div>
          )}

          {/* Right Icon Bar */}
          <div className="w-20 flex-shrink-0 flex flex-col py-4">
            {/* Expand/Collapse Button */}
            <div className="flex justify-center mb-2">
              <button
                onClick={onToggleRightSidebar}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  transition-all duration-200 hover:scale-110 shadow-lg border-2
                  ${darkMode 
                    ? 'bg-blue-600 hover:bg-blue-500 border-gray-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-400 border-white text-white'}
                `}
                title={`${isPropertiesPanelExpanded ? 'Collapse' : 'Expand'} right sidebar`}
              >
                {isPropertiesPanelExpanded ? (
                  <ChevronRight size={14} />
                ) : (
                  <ChevronLeft size={14} />
                )}
              </button>
            </div>
            {propertySections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`
                  relative flex flex-col items-center justify-center p-3 mb-1 mx-2 rounded-lg
                  transition-all duration-150 group hover:scale-105
                  ${activeSection === section.id
                    ? darkMode
                      ? 'bg-violet-600 text-white shadow-lg'
                      : 'bg-violet-500 text-white shadow-lg'
                    : darkMode
                      ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                      : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <section.icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium leading-none">
                  {section.label}
                </span>
                
                {/* Canva-style active indicator */}
                {activeSection === section.id && (
                  <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-violet-500 rounded-r-full" />
                )}

                {/* Tooltip for collapsed state */}
                <div className={`
                  absolute left-full ml-2 px-2 py-1 text-xs rounded-lg
                  opacity-0 group-hover:opacity-100 transition-opacity
                  pointer-events-none whitespace-nowrap z-50
                  ${darkMode
                    ? 'bg-gray-800 text-white border border-gray-700'
                    : 'bg-gray-900 text-white'
                  }
                `}>
                  {section.label}
                  <br />
                  <span className="text-gray-400">{section.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Spacer */}
      <div className={`${isPropertiesPanelExpanded ? 'mr-80' : 'mr-20'} transition-all duration-200`}>
        {/* This ensures content doesn't get hidden behind the panel */}
      </div>
    </>
  );
};

export default PropertiesPanel;