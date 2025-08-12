import React, { useState, useEffect, useRef } from 'react';
import { Eye, ChevronRight, ChevronDown, Target, Plus } from 'lucide-react';

const ExpandableVisualComparisons = ({
  darkMode,
  comparisonOptions = [],
  selectedComparison,
  onComparisonSelect,
  customComparisons = [],
  onAddCustomComparison,
  // Position and styling
  position = 'left', // 'left' or 'right'
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [expandTimeout, setExpandTimeout] = useState(null);
  const menuRef = useRef(null);

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
          <div className="flex items-center space-x-2">
            <Target className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Visual Comparisons
            </h3>
          </div>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Select objects to visualize land scale
          </p>
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
                      transition-all duration-150
                      ${selectedComparison?.id === comparison.id
                        ? darkMode
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-blue-100 text-blue-900 shadow-md'
                        : darkMode
                          ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                          : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
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
                      <div className={`
                        text-xs truncate
                        ${selectedComparison?.id === comparison.id
                          ? 'text-white/70'
                          : darkMode ? 'text-gray-400' : 'text-gray-500'
                        }
                      `}>
                        {comparison.area.toLocaleString()} m²
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

        {/* Quick Stats Footer */}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpandableVisualComparisons;