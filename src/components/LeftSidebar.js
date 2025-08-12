import React, { useState } from 'react';
import { 
  Eye, 
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
  ChevronRight
} from 'lucide-react';
import UnitConverter from './UnitConverter';

const LeftSidebar = ({
  darkMode,
  // Visual Comparisons props
  comparisonOptions = [],
  selectedComparison,
  onComparisonSelect,
  customComparisons = [],
  onAddCustomComparison,
  onRemoveCustomComparison,
  // Unit Converter props
  unitConversions = {},
  // Sidebar expansion callback
  onSidebarExpansionChange,
  // Toggle function
  onToggleLeftSidebar,
  isLeftSidebarExpanded
}) => {
  const [activeSection, setActiveSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle section change and notify parent
  const handleSectionChange = (sectionId) => {
    const newActiveSection = activeSection === sectionId ? null : sectionId;
    setActiveSection(newActiveSection);
    
    // Notify parent about expansion state
    if (onSidebarExpansionChange) {
      onSidebarExpansionChange(newActiveSection !== null);
    }
  };

  // Group comparisons by category for better organization
  const groupedComparisons = comparisonOptions.reduce((groups, item) => {
    const category = item.category || 'General';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  // Add custom comparisons to groups
  if (customComparisons.length > 0) {
    groupedComparisons['Custom'] = customComparisons;
  }

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
          ${activeSection ? 'w-80' : 'w-20'}
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
                title={`${activeSection ? 'Collapse' : 'Expand'} left sidebar`}
              >
                {activeSection ? (
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
          {activeSection && (
            <div className={`
              flex-1 border-l overflow-y-auto
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
                    {/* Canva-style Grid Layout */}
                    <div className="space-y-6">
                      {Object.entries(groupedComparisons).map(([category, items]) => (
                        <div key={category}>
                          {/* Category Header */}
                          <div className={`
                            text-sm font-semibold mb-3 flex items-center justify-between
                            ${darkMode ? 'text-gray-300' : 'text-gray-700'}
                          `}>
                            <span>{category}</span>
                            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {items.length}
                            </span>
                          </div>

                          {/* Grid of Items */}
                          <div className="grid grid-cols-2 gap-2">
                            {items
                              .filter(item => searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                              .map((comparison) => (
                              <button
                                key={comparison.id}
                                onClick={() => onComparisonSelect(comparison)}
                                className={`
                                  relative group aspect-square rounded-xl border-2 transition-all duration-200
                                  flex flex-col items-center justify-center p-3 hover:scale-105
                                  ${selectedComparison?.id === comparison.id
                                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                                    : darkMode
                                      ? 'border-gray-700 hover:border-gray-600 bg-gray-900'
                                      : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                                  }
                                `}
                              >
                                {/* Large Icon */}
                                <div className="text-2xl mb-2">
                                  {comparison.icon}
                                </div>
                                
                                {/* Name */}
                                <div className={`text-xs font-medium text-center leading-tight ${
                                  selectedComparison?.id === comparison.id
                                    ? 'text-violet-700 dark:text-violet-300'
                                    : darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  {comparison.name}
                                </div>
                                
                                {/* Area */}
                                <div className={`text-xs mt-1 ${
                                  selectedComparison?.id === comparison.id
                                    ? 'text-violet-600 dark:text-violet-400'
                                    : darkMode ? 'text-gray-500' : 'text-gray-500'
                                }`}>
                                  {comparison.area.toLocaleString()} m²
                                </div>
                                
                                {/* Delete button for custom items */}
                                {category === 'Custom' && onRemoveCustomComparison && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRemoveCustomComparison(comparison.id);
                                    }}
                                    className={`
                                      absolute top-1 right-1 w-6 h-6 rounded-full
                                      opacity-0 group-hover:opacity-100 transition-opacity
                                      flex items-center justify-center
                                      ${darkMode
                                        ? 'bg-red-600 hover:bg-red-500 text-white'
                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                      }
                                    `}
                                    title="Delete"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                )}
                                
                                {/* Selection indicator */}
                                {selectedComparison?.id === comparison.id && (
                                  <div className="absolute top-2 left-2 w-2 h-2 bg-violet-500 rounded-full" />
                                )}
                              </button>
                            ))}
                          </div>
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
                    
                    {/* Canva-style Add Button */}
                    {onAddCustomComparison && (
                      <div className="mt-6">
                        <button
                          onClick={onAddCustomComparison}
                          className={`
                            w-full aspect-square rounded-xl border-2 border-dashed transition-all duration-200
                            flex flex-col items-center justify-center p-4 hover:scale-105
                            ${darkMode
                              ? 'border-gray-600 text-gray-400 hover:border-violet-400 hover:text-violet-400 hover:bg-gray-800'
                              : 'border-gray-300 text-gray-500 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50'
                            }
                          `}
                        >
                          <Plus className="w-8 h-8 mb-2" />
                          <span className="text-xs font-medium text-center">
                            Add custom<br />object
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
                    <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium mb-1">Layers</p>
                      <p className="text-xs">Manage visualization layers</p>
                    </div>
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