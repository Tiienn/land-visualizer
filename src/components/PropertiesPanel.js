import React, { useState, useEffect } from 'react';
import { Settings, Ruler, Mountain, Compass, ChevronLeft, ChevronRight, Edit, Search } from 'lucide-react';
import MeasuringTape from './MeasuringTape';
import CompassBearing from './CompassBearing';
import { TerrainControls } from './TerrainElevation';

const PropertiesPanel = ({
  darkMode,
  
  // Active tool state
  activeTool = null, // 'measuring', 'compass', 'terrain', etc.
  
  // Panel expansion callback
  onPropertiesPanelExpansionChange,
  
  // Measuring Tape props
  measuringTapeActive,
  toggleMeasuringTape,
  tapeMeasurements,
  addTapeMeasurement,
  deleteTapeMeasurement,
  selectedTapeMeasurement,
  selectTapeMeasurement,
  
  // Compass props
  compassBearingActive,
  toggleCompassBearing,
  bearings,
  addBearing,
  deleteBearing,
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
  isPropertiesPanelExpanded
}) => {
  const [activeSection, setActiveSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Update active section when activeTool changes
  useEffect(() => {
    if (activeTool && activeTool !== activeSection) {
      setActiveSection(activeTool);
      // Notify parent about expansion state
      if (onPropertiesPanelExpansionChange) {
        onPropertiesPanelExpansionChange(true);
      }
    }
    // Don't auto-close when activeTool becomes null - let user close manually
  }, [activeTool, onPropertiesPanelExpansionChange]);

  // Handle section change
  const handleSectionChange = (sectionId) => {
    const newActiveSection = activeSection === sectionId ? null : sectionId;
    setActiveSection(newActiveSection);
    
    // Notify parent about expansion state
    if (onPropertiesPanelExpansionChange) {
      onPropertiesPanelExpansionChange(newActiveSection !== null);
    }
  };

  // Define property sections similar to left sidebar
  const propertySections = [
    {
      id: 'measuring',
      label: 'Measuring',
      icon: Ruler,
      description: 'Measuring tape tools'
    },
    {
      id: 'compass',
      label: 'Compass',
      icon: Compass,
      description: 'Bearing & compass tools'
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
      label: 'Settings',
      icon: Settings,
      description: 'General settings'
    }
  ];
  const getActiveToolContent = () => {
    switch (activeTool) {
      case 'measuring':
        return (
          <MeasuringTape
            measurements={tapeMeasurements}
            onAddMeasurement={addTapeMeasurement}
            onDeleteMeasurement={deleteTapeMeasurement}
            selectedMeasurement={selectedTapeMeasurement}
            onSelectMeasurement={selectTapeMeasurement}
            darkMode={darkMode}
            isActive={measuringTapeActive}
            onToggle={toggleMeasuringTape}
          />
        );
      
      case 'compass':
        return (
          <CompassBearing
            bearings={bearings}
            onAddBearing={addBearing}
            onDeleteBearing={deleteBearing}
            onClearAll={clearAllBearings}
            darkMode={darkMode}
            isActive={compassBearingActive}
            onToggle={toggleCompassBearing}
          />
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
                  value={manualDimensions.width}
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
                  value={manualDimensions.length}
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
                  value={manualDimensions.label}
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
                  disabled={!manualDimensions.width || !manualDimensions.length}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    !manualDimensions.width || !manualDimensions.length
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
      case 'measuring':
        return <Ruler className="w-5 h-5" />;
      case 'compass':
        return <Compass className="w-5 h-5" />;
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
      case 'measuring':
        return 'Measuring Tape';
      case 'compass':
        return 'Compass & Bearing';
      case 'terrain':
        return 'Terrain Elevation';
      case 'dimensions':
        return 'Enter Dimensions';
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
          ${activeSection ? 'w-80' : 'w-20'}
          ${darkMode
            ? 'bg-gray-950 border-l border-gray-800'
            : 'bg-white border-l border-gray-100'
          } shadow-sm
        `}
        style={{ top: '200px', height: 'calc(100vh - 200px)' }}
      >
        <div className="flex h-full">
          {/* Right Content Panel */}
          {activeSection && (
            <div className={`
              flex-1 border-r overflow-y-auto
              ${darkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-100 bg-white'}
            `}>
              {/* Header with Search */}
              <div className={`
                sticky top-0 z-10 p-4 border-b
                ${darkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-100 bg-white'}
              `}>
                <h3 className={`text-lg font-semibold mb-3 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {propertySections.find(s => s.id === activeSection)?.label}
                </h3>
                
                {/* Canva-style Search Bar */}
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    placeholder={`Search ${propertySections.find(s => s.id === activeSection)?.label.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`
                      w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm
                      transition-all duration-150 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                      ${darkMode
                        ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                      }
                    `}
                  />
                </div>
              </div>

              {/* Content Area */}
              <div className="p-4">
                {getActiveToolContent()}
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
                title={`${activeSection ? 'Collapse' : 'Expand'} right sidebar`}
              >
                {activeSection ? (
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
      <div className={`${activeSection ? 'mr-80' : 'mr-20'} transition-all duration-200`}>
        {/* This ensures content doesn't get hidden behind the panel */}
      </div>
    </>
  );
};

export default PropertiesPanel;