import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Eye, ChevronRight, ChevronDown, Target, Plus, Info, BookOpen } from 'lucide-react';
import { 
  getContextualComparisons, 
  getTraditionalUnitInfo, 
  calculateComparisonQuantity,
  TRADITIONAL_UNITS 
} from '../services/landCalculations';

const ExpandableVisualComparisons = ({
  darkMode,
  comparisonOptions = [],
  selectedComparison,
  onComparisonSelect,
  customComparisons = [],
  onAddCustomComparison,
  // Enhanced properties for traditional unit support
  totalAreaSquareMeters = 0,
  inputUnit = 'm²',
  showTraditionalInfo = false,
  onTraditionalInfoToggle,
  // Position and styling
  position = 'left', // 'left' or 'right'
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [expandTimeout, setExpandTimeout] = useState(null);
  const [showEducationalTooltip, setShowEducationalTooltip] = useState(false);
  const menuRef = useRef(null);

  // Enhanced comparison system with traditional unit support
  const isTraditionalUnit = useMemo(() => 
    TRADITIONAL_UNITS.includes(inputUnit), 
    [inputUnit]
  );

  const contextualComparisons = useMemo(() => {
    if (totalAreaSquareMeters > 0) {
      return getContextualComparisons(totalAreaSquareMeters, inputUnit, 8) || [];
    }
    return comparisonOptions || [];
  }, [totalAreaSquareMeters, inputUnit, comparisonOptions]);

  const traditionalUnitInfo = useMemo(() => 
    isTraditionalUnit ? getTraditionalUnitInfo(inputUnit) : null, 
    [isTraditionalUnit, inputUnit]
  );

  // Calculate quantity displays for each comparison
  const enhancedComparisons = useMemo(() => {
    return contextualComparisons.map(comparison => ({
      ...comparison,
      quantityDisplay: totalAreaSquareMeters > 0 
        ? calculateComparisonQuantity(totalAreaSquareMeters, comparison.area)
        : null
    }));
  }, [contextualComparisons, totalAreaSquareMeters]);

  // Handle mouse enter with slight delay
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (expandTimeout) {
      clearTimeout(expandTimeout);
      setExpandTimeout(null);
    }
    const timeout = setTimeout(() => {
      setIsExpanded(true);
    }, 150); // Small delay for smooth UX
    setExpandTimeout(timeout);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (expandTimeout) {
      clearTimeout(expandTimeout);
      setExpandTimeout(null);
    }
    
    // Delay collapse to allow moving to expanded content
    const timeout = setTimeout(() => {
      if (!isHovered) {
        setIsExpanded(false);
      }
    }, 300);
    setExpandTimeout(timeout);
  };

  // Handle clicks outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (expandTimeout) {
        clearTimeout(expandTimeout);
      }
    };
  }, [expandTimeout]);

  // Toggle expansion on click
  const handleToggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle comparison selection
  const handleComparisonClick = (comparison) => {
    onComparisonSelect(comparison);
    // Optionally collapse after selection
    // setIsExpanded(false);
  };

  // Group enhanced comparisons by category for better organization
  const groupedComparisons = enhancedComparisons.reduce((groups, item) => {
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

  return (
    <div
      ref={menuRef}
      className={`fixed top-1/2 transform -translate-y-1/2 z-40 ${
        position === 'left' ? 'left-4' : 'right-4'
      } ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <div
        className={`
          flex items-center justify-center w-12 h-12 rounded-full shadow-lg cursor-pointer
          transition-all duration-300 transform
          ${isExpanded || isHovered ? 'scale-110' : 'scale-100'}
          ${darkMode
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700'
            : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 border border-gray-200'
          }
        `}
        onClick={handleToggleExpansion}
        title="Visual Comparisons - Hover to expand"
      >
        <Eye className="w-5 h-5" />
        
        {/* Expansion indicator */}
        <div
          className={`
            absolute -right-1 -bottom-1 w-4 h-4 rounded-full flex items-center justify-center
            transition-all duration-200
            ${isExpanded
              ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
              : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
            }
          `}
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </div>
      </div>

      {/* Expanded Menu */}
      <div
        className={`
          absolute ${position === 'left' ? 'left-16' : 'right-16'} top-0
          min-w-72 max-w-80 max-h-96 overflow-y-auto
          rounded-xl shadow-2xl border
          transition-all duration-300 transform origin-${position}
          ${isExpanded
            ? 'opacity-100 scale-100 translate-x-0'
            : 'opacity-0 scale-95 translate-x-2 pointer-events-none'
          }
          ${darkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
          }
        `}
      >
        {/* Header */}
        <div className={`
          p-4 border-b
          ${darkMode ? 'border-gray-700 bg-gradient-to-r from-gray-700 to-gray-800' : 'border-gray-200 bg-gradient-to-r from-slate-50 to-slate-100'}
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Visual Comparisons
              </h3>
              {isTraditionalUnit && (
                <div className="flex items-center space-x-1">
                  <BookOpen className={`w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${darkMode ? 'bg-amber-900 text-amber-200' : 'bg-amber-100 text-amber-800'}`}>
                    Traditional
                  </span>
                </div>
              )}
            </div>
            {traditionalUnitInfo && (
              <button
                onClick={() => setShowEducationalTooltip(!showEducationalTooltip)}
                className={`p-1 rounded-full transition-colors ${
                  darkMode 
                    ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200' 
                    : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                }`}
                title="Learn about traditional units"
              >
                <Info className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {isTraditionalUnit 
              ? `Objects sized for ${traditionalUnitInfo?.name || inputUnit} measurements`
              : 'Select objects to visualize land scale'
            }
          </p>
          
          {/* Traditional Unit Educational Tooltip */}
          {showEducationalTooltip && traditionalUnitInfo && (
            <div className={`
              mt-3 p-3 rounded-lg border text-xs
              ${darkMode 
                ? 'bg-gray-800 border-gray-600 text-gray-300' 
                : 'bg-blue-50 border-blue-200 text-gray-700'
              }
            `}>
              <div className="font-medium mb-1">{traditionalUnitInfo.name}</div>
              <p className="mb-2">{traditionalUnitInfo.description}</p>
              <div className="text-xs opacity-75">
                <div><strong>Historical:</strong> {traditionalUnitInfo.historicalContext}</div>
                <div className="mt-1"><strong>Modern equivalent:</strong> {traditionalUnitInfo.modernEquivalent}</div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-2 space-y-3">
          {Object.entries(groupedComparisons).map(([category, items]) => (
            <div key={category}>
              {/* Category Label */}
              <div className={`
                px-2 py-1 text-xs font-medium uppercase tracking-wide
                ${darkMode ? 'text-gray-400' : 'text-gray-500'}
              `}>
                {category}
              </div>

              {/* Category Items */}
              <div className="space-y-1">
                {items.map((comparison) => (
                  <button
                    key={comparison.id}
                    onClick={() => handleComparisonClick(comparison)}
                    className={`
                      w-full flex items-center space-x-3 p-2 rounded-lg text-left
                      transition-all duration-150 border-2
                      ${selectedComparison?.id === comparison.id
                        ? darkMode
                          ? 'bg-blue-600 text-white shadow-md border-blue-400'
                          : 'bg-blue-500 text-white shadow-lg border-blue-600'
                        : darkMode
                          ? 'hover:bg-gray-700 text-gray-300 hover:text-white border-transparent hover:border-gray-600'
                          : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-transparent hover:border-gray-200'
                      }
                    `}
                  >
                    {/* Icon */}
                    <div className={`
                      flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm
                      ${selectedComparison?.id === comparison.id
                        ? 'bg-white/20'
                        : darkMode
                          ? 'bg-gray-600'
                          : 'bg-gray-100'
                      }
                    `}>
                      {comparison.icon}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {comparison.name}
                      </div>
                      <div className="space-y-0.5">
                        <div className={`
                          text-xs truncate
                          ${selectedComparison?.id === comparison.id
                            ? 'text-white/80'
                            : darkMode ? 'text-gray-400' : 'text-gray-500'
                          }
                        `}>
                          {comparison.area.toLocaleString()} m²
                        </div>
                        {/* Quantity display for enhanced comparisons */}
                        {comparison.quantityDisplay && (
                          <div className={`
                            text-xs font-medium
                            ${selectedComparison?.id === comparison.id
                              ? 'text-white'
                              : comparison.quantityDisplay.type === 'multiple' 
                                ? darkMode ? 'text-green-400' : 'text-green-600'
                                : darkMode ? 'text-blue-400' : 'text-blue-600'
                            }
                          `}>
                            {comparison.quantityDisplay.text} {comparison.name}
                          </div>
                        )}
                        {/* Traditional context for traditional objects */}
                        {comparison.context === 'Traditional' && comparison.traditionalContext && (
                          <div className={`
                            text-xs italic truncate
                            ${selectedComparison?.id === comparison.id
                              ? 'text-white/70'
                              : darkMode ? 'text-gray-500' : 'text-gray-400'
                            }
                          `}>
                            {comparison.traditionalContext}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selected indicator */}
                    {selectedComparison?.id === comparison.id && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* No comparisons message */}
          {Object.keys(groupedComparisons).length === 0 && (
            <div className={`
              text-center py-6
              ${darkMode ? 'text-gray-400' : 'text-gray-500'}
            `}>
              <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No comparison objects available</p>
            </div>
          )}

          {/* Add Custom Button */}
          {onAddCustomComparison && (
            <div className="pt-2 border-t">
              <button
                onClick={onAddCustomComparison}
                className={`
                  w-full flex items-center justify-center space-x-2 p-2 rounded-lg
                  border-2 border-dashed transition-all duration-150
                  ${darkMode
                    ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700'
                  }
                `}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Add Custom Object</span>
              </button>
            </div>
          )}
        </div>

        {/* Enhanced Stats Footer */}
        {selectedComparison && (
          <div className={`
            p-3 border-t text-xs
            ${darkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}
          `}>
            <div className={`flex justify-between ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <span>Selected:</span>
              <span className="font-medium">{selectedComparison.name}</span>
            </div>
            <div className={`flex justify-between mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <span>Area:</span>
              <span>{selectedComparison.area.toLocaleString()} m²</span>
            </div>
            {totalAreaSquareMeters > 0 && (
              <div className={`flex justify-between mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                <span>Your land equals:</span>
                <span className="font-medium">
                  {(() => {
                    const quantity = calculateComparisonQuantity(totalAreaSquareMeters, selectedComparison.area);
                    return `${quantity.text} ${selectedComparison.name}${quantity.quantity > 1 ? 's' : ''}`;
                  })()}
                </span>
              </div>
            )}
            {isTraditionalUnit && selectedComparison.traditionalContext && (
              <div className={`mt-2 pt-2 border-t text-xs italic ${
                darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'
              }`}>
                {selectedComparison.traditionalContext}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpandableVisualComparisons;