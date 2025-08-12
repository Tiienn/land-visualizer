import React, { useState, useRef, useEffect } from 'react';
import { Plus, Check, X } from 'lucide-react';

const InsertAreaDropdown = ({
  darkMode,
  isOpen,
  onClose,
  onInsertArea,
  position = { top: 0, left: 0 },
  unitOptions = [
    'm²', 'ft²', 'acres', 'hectares', 
    'sq yards', 'sq miles', 'arpent', 
    'perche', 'toise', 'sq inches'
  ]
}) => {
  const [areaValue, setAreaValue] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('m²');
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const numValue = parseFloat(areaValue);
    
    if (isNaN(numValue) || numValue <= 0) {
      alert('Please enter a valid area value greater than 0');
      return;
    }

    if (numValue > 1000000) {
      alert('Area value is too large. Please enter a smaller value.');
      return;
    }

    onInsertArea({
      value: numValue,
      unit: selectedUnit
    });

    // Reset form
    setAreaValue('');
    setSelectedUnit('m²');
    onClose();
  };

  // Handle unit selection
  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
    setShowUnitDropdown(false);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`
        absolute z-50 min-w-80 max-w-96
        rounded-xl shadow-2xl border
        ${darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
        }
      `}
      style={{
        top: position.top + 10,
        left: position.left,
        transform: position.left > window.innerWidth / 2 ? 'translateX(-100%)' : 'none'
      }}
    >
      {/* Header */}
      <div className={`
        p-4 border-b
        ${darkMode ? 'border-gray-700 bg-gradient-to-r from-gray-700 to-gray-800' : 'border-gray-200 bg-gradient-to-r from-slate-50 to-slate-100'}
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Plus className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Insert Area
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`
              p-1 rounded-lg transition-colors
              ${darkMode
                ? 'hover:bg-gray-600 text-gray-400 hover:text-white'
                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Enter area value and select unit
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="space-y-4">
          {/* Area Value Input */}
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${darkMode ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Area Value *
            </label>
            <input
              ref={inputRef}
              type="number"
              value={areaValue}
              onChange={(e) => setAreaValue(e.target.value)}
              placeholder="Enter area value"
              min="0"
              max="1000000"
              step="any"
              required
              className={`
                w-full px-3 py-2 rounded-lg border transition-colors
                ${darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
            />
          </div>

          {/* Unit Selection */}
          <div className="relative">
            <label className={`
              block text-sm font-medium mb-2
              ${darkMode ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Unit *
            </label>
            <button
              type="button"
              onClick={() => setShowUnitDropdown(!showUnitDropdown)}
              className={`
                w-full px-3 py-2 rounded-lg border text-left flex items-center justify-between
                transition-colors
                ${darkMode
                  ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'
                }
              `}
            >
              <span>{selectedUnit}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showUnitDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Unit Dropdown */}
            {showUnitDropdown && (
              <div className={`
                absolute top-full left-0 right-0 mt-1 z-60
                max-h-48 overflow-y-auto rounded-lg border shadow-lg
                ${darkMode
                  ? 'bg-gray-800 border-gray-600'
                  : 'bg-white border-gray-300'
                }
              `}>
                {unitOptions.map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => handleUnitSelect(unit)}
                    className={`
                      w-full px-3 py-2 text-left transition-colors
                      ${selectedUnit === unit
                        ? darkMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-900'
                        : darkMode
                          ? 'hover:bg-gray-700 text-gray-300'
                          : 'hover:bg-gray-50 text-gray-900'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{unit}</span>
                      {selectedUnit === unit && (
                        <Check className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Common Values Quick Select */}
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${darkMode ? 'text-gray-300' : 'text-gray-700'}
            `}>
              Quick Select
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 1000, unit: 'm²', label: '1K m²' },
                { value: 5000, unit: 'm²', label: '5K m²' },
                { value: 1, unit: 'acres', label: '1 acre' },
                { value: 5, unit: 'acres', label: '5 acres' },
                { value: 1, unit: 'hectares', label: '1 ha' },
                { value: 10000, unit: 'ft²', label: '10K ft²' }
              ].map((preset) => (
                <button
                  key={`${preset.value}-${preset.unit}`}
                  type="button"
                  onClick={() => {
                    setAreaValue(preset.value.toString());
                    setSelectedUnit(preset.unit);
                  }}
                  className={`
                    px-2 py-1 text-xs rounded-lg border transition-colors
                    ${darkMode
                      ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              type="submit"
              className={`
                flex-1 px-4 py-2 rounded-lg font-medium transition-colors
                ${darkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
            >
              Insert Area
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`
                px-4 py-2 rounded-lg font-medium border transition-colors
                ${darkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>

      {/* Instructions */}
      <div className={`
        px-4 pb-4 text-xs
        ${darkMode ? 'text-gray-400' : 'text-gray-500'}
      `}>
        <div className="flex items-start space-x-2">
          <span>💡</span>
          <div>
            <p className="mb-1">Tips:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Use decimal values for precision (e.g., 2.5)</li>
              <li>Maximum value: 1,000,000</li>
              <li>Press Escape to cancel</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsertAreaDropdown;