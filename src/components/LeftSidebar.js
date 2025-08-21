import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff,
  Search,
  Plus,
  Trash2,
  Home,
  Palette,
  Image,
  Upload,
  FolderOpen,
  Settings,
  Layers,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Save,
  X,
  Square,
  ChevronUp,
  ChevronDown,
  SkipForward,
  SkipBack,
  MoreVertical,
  GripVertical,
  Info,
  BookOpen
} from 'lucide-react';
import UnitConverter from './UnitConverter';
import { 
  getContextualComparisons, 
  getTraditionalUnitInfo, 
  calculateComparisonQuantity,
  TRADITIONAL_UNITS 
} from '../services/landCalculations';

const LeftSidebar = ({
  darkMode,
  // Visual Comparisons props (enhanced)
  comparisonOptions = [],
  selectedComparison,
  onComparisonSelect,
  customComparisons = [],
  onAddCustomComparison,
  onRemoveCustomComparison,
  totalAreaSquareMeters = 0,
  inputUnit = 'm²',
  // Unit Converter props
  unitConversions = {},
  // Sidebar expansion callback
  onSidebarExpansionChange,
  // Toggle function
  onToggleLeftSidebar,
  isLeftSidebarExpanded,
  // Layer management props
  subdivisions = [],
  onUpdateSubdivision,
  onDeleteSubdivision,
  selectedSubdivision,
  onSelectSubdivision,
  // Additional props that might be passed from App.js
  units,
  setUnits,
  setSubdivisions,
  showAreaConfiguration,
  setShowAreaConfiguration,
  showInsertAreaDropdown,
  setShowInsertAreaDropdown,
  showPresetSelector,
  setShowPresetSelector,
  showManualInput,
  setShowManualInput,
  manualDimensions,
  setManualDimensions,
  activeTool,
  setActiveTool,
  drawingMode,
  onDrawingModeChange
}) => {
  const [activeSection, setActiveSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEducationalTooltip, setShowEducationalTooltip] = useState(false);
  // Initialize all categories as collapsed by default
  const [collapsedCategories, setCollapsedCategories] = useState(new Set([
    'Sports', 'Modern', 'Monuments', 'Room', 'Traditional Buildings', 'Agriculture', 'Artisan', 'Custom'
  ]));
  
  // Layer editing state
  const [editingLayer, setEditingLayer] = useState(null);
  const [editName, setEditName] = useState('');
  const [showColorPalette, setShowColorPalette] = useState(null); // Track which layer's color palette is open
  
  // Drag and drop state for layer reordering
  const [draggedLayer, setDraggedLayer] = useState(null);
  const [dragOverLayer, setDragOverLayer] = useState(null);

  // Enhanced comparison system with traditional unit support
  const isTraditionalUnit = TRADITIONAL_UNITS.includes(inputUnit);
  
  const contextualComparisons = totalAreaSquareMeters > 0 
    ? getContextualComparisons(totalAreaSquareMeters, inputUnit, 25)
    : comparisonOptions;
  
  const traditionalUnitInfo = isTraditionalUnit ? getTraditionalUnitInfo(inputUnit) : null;

  // Toggle category collapse state
  const toggleCategory = (category) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Handle section change and notify parent
  const handleSectionChange = (sectionId) => {
    // Prevent infinite loops by checking if the section is actually changing
    if (activeSection === sectionId) {
      // If clicking the same section, just toggle it off
      setActiveSection(null);
      return;
    }
    
    // Set the new active section
    setActiveSection(sectionId);
    
    // Only expand sidebar if it's not already expanded
    if (sectionId && !isLeftSidebarExpanded) {
      onToggleLeftSidebar();
    }
    
    // Notify parent about expansion state if callback exists
    if (onSidebarExpansionChange) {
      onSidebarExpansionChange(sectionId !== null);
    }
  };

  // Group enhanced comparisons by category for better organization
  const groupedComparisons = contextualComparisons.reduce((groups, item) => {
    // Add quantity display for each comparison
    const enhancedItem = {
      ...item,
      quantityDisplay: totalAreaSquareMeters > 0 
        ? calculateComparisonQuantity(totalAreaSquareMeters, item.area)
        : null
    };
    
    const category = item.category || 'General';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(enhancedItem);
    return groups;
  }, {});

  // Add custom comparisons to groups
  if (customComparisons.length > 0) {
    groupedComparisons['Custom'] = customComparisons;
  }

  // Layer management functions
  const userLayers = subdivisions.filter(sub => sub.id !== 'default-square');
  
  const handleEditStart = (layer) => {
    if (editingLayer === layer.id) {
      // If already editing this layer, close edit mode
      setEditingLayer(null);
      setEditName('');
    } else {
      // Start editing this layer
      setEditingLayer(layer.id);
      setEditName(layer.label);
    }
  };

  const handleEditSave = () => {
    if (editingLayer && onUpdateSubdivision) {
      onUpdateSubdivision(editingLayer, {
        label: editName.trim() || 'Unnamed Layer'
      });
      setEditingLayer(null);
      setEditName('');
    }
  };

  const handleClickOutside = (e) => {
    // Check if click is outside the editing input
    if (editingLayer && !e.target.closest('.layer-edit-input')) {
      handleEditSave();
    }
  };

  const handleEditCancel = () => {
    setEditingLayer(null);
    setEditName('');
  };

  // Handle immediate color application from palette
  const handleColorSelect = (color, layerId = null) => {
    const targetLayerId = layerId || editingLayer;
    if (targetLayerId && onUpdateSubdivision) {
      onUpdateSubdivision(targetLayerId, {
        label: layerId ? userLayers.find(l => l.id === layerId)?.label : editName.trim() || 'Unnamed Layer',
        color: color
      });
      // Close the color editor/palette immediately
      if (!layerId) {
        setEditingLayer(null);
        setEditName('');
      }
      setShowColorPalette(null);
    }
  };

  // Layer ordering functions
  const bringToFront = (layerId) => {
    if (onUpdateSubdivision) {
      const maxOrder = Math.max(...userLayers.map(layer => layer.order || 0));
      onUpdateSubdivision(layerId, { order: maxOrder + 1 });
    }
  };

  const bringForward = (layerId) => {
    if (onUpdateSubdivision) {
      const currentLayer = userLayers.find(l => l.id === layerId);
      const currentOrder = currentLayer?.order || 0;
      const nextHigherOrder = userLayers
        .filter(l => (l.order || 0) > currentOrder)
        .sort((a, b) => (a.order || 0) - (b.order || 0))[0]?.order;
      
      if (nextHigherOrder !== undefined) {
        onUpdateSubdivision(layerId, { order: nextHigherOrder + 0.1 });
      }
    }
  };

  const sendBackward = (layerId) => {
    if (onUpdateSubdivision) {
      const currentLayer = userLayers.find(l => l.id === layerId);
      const currentOrder = currentLayer?.order || 0;
      const nextLowerOrder = userLayers
        .filter(l => (l.order || 0) < currentOrder)
        .sort((a, b) => (b.order || 0) - (a.order || 0))[0]?.order;
      
      if (nextLowerOrder !== undefined) {
        onUpdateSubdivision(layerId, { order: nextLowerOrder - 0.1 });
      }
    }
  };

  const sendToBack = (layerId) => {
    if (onUpdateSubdivision) {
      const minOrder = Math.min(...userLayers.map(layer => layer.order || 0));
      onUpdateSubdivision(layerId, { order: minOrder - 1 });
    }
  };

  const toggleLayerVisibility = (layerId, currentVisibility) => {
    if (onUpdateSubdivision) {
      onUpdateSubdivision(layerId, {
        visible: currentVisibility !== false ? false : true
      });
    }
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

  // Drag and drop handlers for layer reordering
  const handleDragStart = (e, layer) => {
    setDraggedLayer(layer);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', layer.id);
  };

  const handleDragOver = (e, layer) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverLayer(layer.id);
  };

  const handleDragLeave = (e) => {
    setDragOverLayer(null);
  };

  const handleDrop = (e, targetLayer) => {
    e.preventDefault();
    setDragOverLayer(null);
    
    if (draggedLayer && targetLayer && draggedLayer.id !== targetLayer.id && onUpdateSubdivision) {
      // Swap the order values
      const draggedOrder = draggedLayer.order || 0;
      const targetOrder = targetLayer.order || 0;
      
      onUpdateSubdivision(draggedLayer.id, { order: targetOrder });
      onUpdateSubdivision(targetLayer.id, { order: draggedOrder });
    }
    
    setDraggedLayer(null);
  };

  const handleDragEnd = () => {
    setDraggedLayer(null);
    setDragOverLayer(null);
  };

  // Predefined color palette
  const colorPalette = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6',
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#64748b', '#6b7280', '#374151', '#1f2937'
  ];

  const sidebarSections = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      description: 'Main dashboard'
    },
    {
      id: 'comparisons',
      label: 'Visual Comparison',
      icon: Eye,
      description: 'Comparison objects'
    },
    {
      id: 'converter',
      label: 'Unit Converter',
      icon: Calculator,
      description: 'Unit conversion tools'
    },
    {
      id: 'tools',
      label: 'Quick Tools',
      icon: Settings,
      description: 'Frequently used tools'
    },
    {
      id: 'layers',
      label: 'Layers',
      icon: Layers,
      description: 'Manage visualization layers'
    },
    {
      id: 'uploads',
      label: 'Uploads',
      icon: Upload,
      description: 'Your uploaded content'
    },
    {
      id: 'photos',
      label: 'Photos',
      icon: Image,
      description: 'Stock photos and images'
    },
    {
      id: 'draw',
      label: 'Draw',
      icon: Palette,
      description: 'Drawing and shape tools'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderOpen,
      description: 'Your saved projects'
    }
  ];

  return (
    <>
      {/* Canva-style Sidebar */}
      <div
        className={`
          fixed left-0 z-30 transition-all duration-200 ease-out
          ${isLeftSidebarExpanded ? 'w-80' : 'w-20'}
          ${darkMode
            ? 'bg-gray-950 border-r border-gray-800'
            : 'bg-white border-r border-gray-100'
          } shadow-sm
        `}
        style={{ top: '200px', height: 'calc(100vh - 200px)' }}
      >
        <div className="flex h-full">
          {/* Left Icon Bar */}
          <div className="w-20 flex-shrink-0 flex flex-col py-4">
            {/* Expand/Collapse Button */}
            <div className="flex justify-center mb-2">
              <button
                onClick={onToggleLeftSidebar}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  transition-all duration-200 hover:scale-110 shadow-lg border-2
                  ${darkMode 
                    ? 'bg-blue-600 hover:bg-blue-500 border-gray-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-400 border-white text-white'}
                `}
                title={`${isLeftSidebarExpanded ? 'Collapse' : 'Expand'} left sidebar`}
              >
                {isLeftSidebarExpanded ? (
                  <ChevronLeft size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            </div>
            {sidebarSections.map((section, index) => (
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
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-violet-500 rounded-l-full" />
                )}
              </button>
            ))}
          </div>

          {/* Right Content Panel */}
          {isLeftSidebarExpanded && (
            <div className={`
              flex-1 border-l overflow-y-auto left-sidebar-content
              ${darkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-100 bg-white light-mode-safeguards'}
            `}>
              {/* Header with Search */}
              <div className={`
                sticky top-0 z-10 p-4 border-b
                ${darkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-100 bg-white'}
              `}>
                <h3 className={`text-lg font-semibold mb-3 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {sidebarSections.find(s => s.id === activeSection)?.label}
                </h3>
                
                {/* Canva-style Search Bar */}
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    placeholder={`Search ${sidebarSections.find(s => s.id === activeSection)?.label.toLowerCase()}...`}
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
                {/* Elements/Comparisons Section */}
                {activeSection === 'comparisons' && (
                  <div>
                    {/* Enhanced Header with Traditional Unit Support */}
                    {isTraditionalUnit && (
                      <div className={`mb-4 p-3 rounded-lg border ${
                        darkMode 
                          ? 'bg-amber-900/20 border-amber-700 text-amber-200' 
                          : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4" />
                            <span className="text-sm font-medium">Traditional Unit Mode</span>
                          </div>
                          {traditionalUnitInfo && (
                            <button
                              onClick={() => setShowEducationalTooltip(!showEducationalTooltip)}
                              className={`p-1 rounded-full transition-colors ${
                                darkMode 
                                  ? 'hover:bg-amber-800 text-amber-300 hover:text-amber-100' 
                                  : 'hover:bg-amber-200 text-amber-600 hover:text-amber-800'
                              }`}
                              title="Learn about traditional units"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs">
                          Objects sized for {traditionalUnitInfo?.name || inputUnit} measurements
                        </p>
                        
                        {/* Educational Tooltip */}
                        {showEducationalTooltip && traditionalUnitInfo && (
                          <div className={`mt-3 p-3 rounded-lg border text-xs ${
                            darkMode 
                              ? 'bg-gray-800 border-gray-600 text-gray-300' 
                              : 'bg-blue-50 border-blue-200 text-gray-700'
                          }`}>
                            <div className="font-medium mb-1">{traditionalUnitInfo.name}</div>
                            <p className="mb-2">{traditionalUnitInfo.description}</p>
                            <div className="text-xs opacity-75">
                              <div><strong>Historical:</strong> {traditionalUnitInfo.historicalContext}</div>
                              <div className="mt-1"><strong>Modern equivalent:</strong> {traditionalUnitInfo.modernEquivalent}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Canva-style Grid Layout */}
                    <div className="space-y-6">
                      {(() => {
                        // Define category order as requested
                        const categoryOrder = ['Sports', 'Modern', 'Monuments', 'Room', 'Traditional Buildings', 'Agriculture', 'Artisan', 'Custom'];
                        
                        return Object.entries(groupedComparisons)
                          .map(([category, items]) => {
                            // Filter items based on search term
                            const filteredItems = items.filter(item => 
                              searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase())
                            );
                            return [category, filteredItems];
                          })
                          .filter(([category, filteredItems]) => filteredItems.length > 0) // Only show categories with matching items
                          .sort(([categoryA], [categoryB]) => {
                            // Sort categories according to the defined order
                            const indexA = categoryOrder.indexOf(categoryA);
                            const indexB = categoryOrder.indexOf(categoryB);
                            
                            // Categories not in the order list go to the end
                            if (indexA === -1 && indexB === -1) return categoryA.localeCompare(categoryB);
                            if (indexA === -1) return 1;
                            if (indexB === -1) return -1;
                            
                            return indexA - indexB;
                          });
                      })().map(([category, filteredItems]) => (
                        <div key={category}>
                          {/* Category Header */}
                          <button
                            onClick={() => toggleCategory(category)}
                            className={`
                              w-full text-sm font-semibold mb-3 flex items-center justify-between
                              transition-colors duration-150 rounded-lg p-2
                              ${darkMode 
                                ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-800' 
                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                              }
                            `}
                          >
                            <div className="flex items-center space-x-2">
                              {collapsedCategories.has(category) ? (
                                <ChevronRight size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                              <span>{category}</span>
                            </div>
                            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {filteredItems.length}
                            </span>
                          </button>

                          {/* List of Items - Only show if not collapsed */}
                          {!collapsedCategories.has(category) && (
                            <div className="space-y-2">
                            {filteredItems.map((comparison) => (
                              <button
                                key={comparison.id}
                                onClick={() => onComparisonSelect(comparison)}
                                className={`
                                  relative group w-full rounded-lg border-2 transition-all duration-200
                                  flex items-center p-3 hover:scale-[1.02]
                                  ${selectedComparison?.id === comparison.id
                                    ? darkMode
                                      ? 'border-blue-400 bg-blue-900 text-blue-200'
                                      : 'border-blue-300 bg-blue-100 text-blue-700'
                                    : darkMode
                                      ? 'border-gray-700 hover:border-gray-600 bg-gray-900 hover:bg-gray-800'
                                      : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                                  }
                                `}
                              >
                                {/* Icon */}
                                <div className="text-xl mr-3 flex-shrink-0">
                                  {comparison.icon}
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 text-left">
                                  {/* Name */}
                                  <div className={`text-sm font-semibold leading-tight mb-1 ${
                                    selectedComparison?.id === comparison.id
                                      ? darkMode ? 'text-blue-200' : 'text-blue-700'
                                      : darkMode ? 'text-gray-200' : 'text-gray-800'
                                  }`}>
                                    {comparison.name}
                                  </div>
                                  
                                  {/* Area */}
                                  <div className={`text-xs mb-1 ${
                                    selectedComparison?.id === comparison.id
                                      ? darkMode ? 'text-blue-300' : 'text-blue-600'
                                      : darkMode ? 'text-gray-400' : 'text-gray-600'
                                  }`}>
                                    {comparison.area.toLocaleString()} m² • {comparison.description}
                                  </div>

                                  {/* Enhanced: Quantity Display */}
                                  {comparison.quantityDisplay && (
                                    <div className={`text-xs font-medium ${
                                      selectedComparison?.id === comparison.id
                                        ? darkMode ? 'text-blue-200' : 'text-blue-700'
                                        : comparison.quantityDisplay.type === 'multiple' 
                                          ? (darkMode ? 'text-green-400' : 'text-green-600')
                                          : (darkMode ? 'text-blue-400' : 'text-blue-600')
                                    }`}>
                                      {comparison.quantityDisplay.text} {comparison.name}
                                    </div>
                                  )}

                                  {/* Enhanced: Traditional Context */}
                                  {comparison.context === 'Traditional' && comparison.traditionalContext && (
                                    <div className={`text-xs mt-1 italic ${
                                      darkMode ? 'text-gray-500' : 'text-gray-500'
                                    }`}>
                                      {comparison.traditionalContext}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Delete button for custom items */}
                                {category === 'Custom' && onRemoveCustomComparison && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRemoveCustomComparison(comparison.id);
                                    }}
                                    className={`
                                      w-6 h-6 rounded-full ml-2 flex-shrink-0
                                      opacity-0 group-hover:opacity-100 transition-opacity
                                      flex items-center justify-center
                                      ${darkMode
                                        ? 'bg-red-600 hover:bg-red-500 text-white'
                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                      }
                                    `}
                                    title="Delete"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                                
                                {/* Selection indicator */}
                                {selectedComparison?.id === comparison.id && (
                                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-violet-500 rounded-r-full" />
                                )}
                              </button>
                            ))}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Empty state */}
                      {Object.keys(groupedComparisons).length === 0 && (
                        <div className={`
                          text-center py-12
                          ${darkMode ? 'text-gray-400' : 'text-gray-500'}
                        `}>
                          <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p className="text-sm font-medium mb-1">No elements available</p>
                          <p className="text-xs">Add custom objects to get started</p>
                        </div>
                      )}
                    </div>
                    
                    {/* List-style Add Button */}
                    {onAddCustomComparison && (
                      <div className="mt-4">
                        <button
                          onClick={onAddCustomComparison}
                          className={`
                            w-full rounded-lg border-2 border-dashed transition-all duration-200
                            flex items-center justify-center p-3 hover:scale-[1.02]
                            ${darkMode
                              ? 'border-gray-600 text-gray-400 hover:border-violet-400 hover:text-violet-400 hover:bg-gray-800'
                              : 'border-gray-300 text-gray-500 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50'
                            }
                          `}
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          <span className="text-sm font-medium">
                            Add custom object
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Unit Converter Section */}
                {activeSection === 'converter' && (
                  <div>
                    <UnitConverter
                      darkMode={darkMode}
                      unitConversions={unitConversions}
                    />
                  </div>
                )}

                {/* Quick Tools Section */}
                {activeSection === 'tools' && (
                  <div>
                    <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Settings className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium mb-1">Quick Tools</p>
                      <p className="text-xs">Frequently used tools and shortcuts</p>
                    </div>
                  </div>
                )}

                {/* Layers Section */}
                {activeSection === 'layers' && (
                  <div>
                    {/* Layer Count Header */}
                    <div className={`mb-4 p-3 rounded-lg border ${
                      darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                    }`}>
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
                    {userLayers.length === 0 ? (
                      <div className="text-center py-8">
                        <Square className={`mx-auto mb-3 ${
                          darkMode ? 'text-gray-500' : 'text-gray-400'
                        }`} size={32} />
                        <p className={`text-sm mb-1 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          No layers yet
                        </p>
                        <p className={`text-xs ${
                          darkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          Use Rectangle tool to draw areas
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {userLayers
                          .filter(layer => 
                            searchTerm === '' || 
                            layer.label.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .sort((a, b) => (b.order || 0) - (a.order || 0)) // Sort by order, highest first
                          .map((layer) => (
                          <div
                            key={layer.id}
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, layer)}
                            onDragOver={(e) => handleDragOver(e, layer)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, layer)}
                            onDragEnd={handleDragEnd}
                            className={`p-3 rounded-lg border transition-all cursor-move relative ${
                              dragOverLayer === layer.id
                                ? darkMode
                                  ? 'border-green-400 bg-green-900/30 scale-105'
                                  : 'border-green-400 bg-green-50 scale-105'
                                : draggedLayer?.id === layer.id
                                  ? darkMode
                                    ? 'border-blue-400 bg-blue-900/50 opacity-50'
                                    : 'border-blue-400 bg-blue-100 opacity-50'
                                  : selectedSubdivision?.id === layer.id
                                    ? darkMode 
                                      ? 'border-blue-500 bg-blue-900/30' 
                                      : 'border-blue-500 bg-blue-50'
                                    : darkMode
                                      ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
                                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={(e) => {
                              if (!draggedLayer) {
                                handleClickOutside(e);
                                onSelectSubdivision && onSelectSubdivision(layer);
                              }
                            }}
                          >
                            
                            {/* Layer Header */}
                            <div className="flex items-center gap-2 mb-2">
                              {/* Drag Handle */}
                              <div className={`cursor-move ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} title="Drag to reorder">
                                <GripVertical size={14} />
                              </div>
                              
                              {/* Clickable Color Indicator */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowColorPalette(showColorPalette === layer.id ? null : layer.id);
                                }}
                                className="w-4 h-4 rounded border-2 border-white shadow-sm flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
                                style={{ backgroundColor: layer.color }}
                                title="Change color"
                              />
                              
                              {/* Layer Name */}
                              {editingLayer === layer.id ? (
                                <div className="flex items-center flex-1 layer-edit-input">
                                  <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleEditSave();
                                      if (e.key === 'Escape') handleEditCancel();
                                    }}
                                    className={`flex-1 px-2 py-1 text-sm rounded-l border-l border-t border-b w-24 ${
                                      darkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white' 
                                        : 'bg-white border-gray-300 text-gray-900'
                                    } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditCancel();
                                    }}
                                    className={`px-2 py-1 rounded-r border-r border-t border-b transition-colors ${
                                      darkMode 
                                        ? 'bg-gray-600 border-gray-600 text-gray-400 hover:bg-gray-500 hover:text-white' 
                                        : 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                                    }`}
                                    title="Cancel editing"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ) : (
                                <span className={`flex-1 text-sm font-medium truncate ${
                                  darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {layer.label}
                                </span>
                              )}
                              
                              {/* Layer Actions */}
                              <div className="flex items-center gap-1">
                                {editingLayer !== layer.id && (
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
                                      {layer.visible !== false ? <Eye size={12} /> : <EyeOff size={12} />}
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
                                      <Edit3 size={12} />
                                    </button>
                                    
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`Delete layer "${layer.label}"?`)) {
                                          onDeleteSubdivision && onDeleteSubdivision(layer.id);
                                        }
                                      }}
                                      className={`p-1 rounded transition-colors ${
                                        darkMode 
                                          ? 'hover:bg-gray-600 text-red-400' 
                                          : 'hover:bg-gray-200 text-red-500'
                                      }`}
                                      title="Delete layer"
                                    >
                                      <Trash2 size={12} />
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

                            {/* Color Palette (shows when color square is clicked) */}
                            {showColorPalette === layer.id && (
                              <div className="mt-3 pt-3 border-t border-gray-600">
                                <div className="flex items-center gap-2 mb-2">
                                  <Palette size={12} />
                                  <span className="text-xs font-medium">Choose Color</span>
                                </div>
                                <div className="grid grid-cols-10 gap-1 mb-2">
                                  {colorPalette.map((color) => (
                                    <button
                                      key={color}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleColorSelect(color, layer.id);
                                      }}
                                      className={`w-5 h-5 rounded border-2 transition-all hover:scale-110 ${
                                        layer.color === color 
                                          ? 'border-white shadow-lg scale-110' 
                                          : 'border-gray-400'
                                      }`}
                                      style={{ backgroundColor: color }}
                                      title={`Select ${color}`}
                                    />
                                  ))}
                                </div>
                                <input
                                  type="color"
                                  value={layer.color}
                                  onChange={(e) => {
                                    handleColorSelect(e.target.value, layer.id);
                                  }}
                                  className="w-full h-6 rounded border border-gray-600"
                                  onClick={(e) => e.stopPropagation()}
                                  title="Select custom color"
                                />
                              </div>
                            )}

                            {/* Layer Ordering Controls (shown when editing) */}
                            {editingLayer === layer.id && (
                              <div className="mt-3 pt-3 border-t border-gray-600">
                                <div className="flex items-center gap-2 mb-3">
                                  <Layers size={12} />
                                  <span className="text-xs font-medium">Layer Order</span>
                                </div>
                                
                                {/* Layer Ordering Buttons */}
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      bringToFront(layer.id);
                                    }}
                                    className={`flex items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                                      darkMode 
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600' 
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                                    }`}
                                    title="Bring to front"
                                  >
                                    <SkipForward size={10} />
                                    <span className="text-xs">To Front</span>
                                  </button>
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      bringForward(layer.id);
                                    }}
                                    className={`flex items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                                      darkMode 
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600' 
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                                    }`}
                                    title="Bring forward"
                                  >
                                    <ChevronUp size={10} />
                                    <span className="text-xs">Forward</span>
                                  </button>
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      sendBackward(layer.id);
                                    }}
                                    className={`flex items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                                      darkMode 
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600' 
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                                    }`}
                                    title="Send backward"
                                  >
                                    <ChevronDown size={10} />
                                    <span className="text-xs">Backward</span>
                                  </button>
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      sendToBack(layer.id);
                                    }}
                                    className={`flex items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                                      darkMode 
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600' 
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                                    }`}
                                    title="Send to back"
                                  >
                                    <SkipBack size={10} />
                                    <span className="text-xs">To Back</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Draw Section */}
                {activeSection === 'draw' && (
                  <div>
                    <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Palette className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium mb-1">Drawing tools</p>
                      <p className="text-xs">Coming soon</p>
                    </div>
                  </div>
                )}

                {/* Other Sections */}
                {(activeSection === 'home' || activeSection === 'uploads' || activeSection === 'photos' || activeSection === 'projects') && (
                  <div>
                    <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {activeSection === 'home' && <Home className="w-12 h-12 mx-auto mb-3 opacity-30" />}
                      {activeSection === 'uploads' && <Upload className="w-12 h-12 mx-auto mb-3 opacity-30" />}
                      {activeSection === 'photos' && <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />}
                      {activeSection === 'projects' && <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />}
                      <p className="text-sm font-medium mb-1">
                        {sidebarSections.find(s => s.id === activeSection)?.label}
                      </p>
                      <p className="text-xs">Coming soon</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LeftSidebar;