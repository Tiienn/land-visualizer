import { useState } from 'react';
import { X } from 'lucide-react';
import { getAvailableUnits } from '../services/unitConversions';

/**
 * Modal component for area input (Insert Area and Add Area functionality)
 */
export function AreaInputModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  buttonText,
  value,
  setValue,
  unit,
  setUnit,
  darkMode
}) {
  const [localValue, setLocalValue] = useState(value || '');
  const [localUnit, setLocalUnit] = useState(unit || 'm²');
  
  const availableUnits = getAvailableUnits();

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericValue = parseFloat(localValue);
    
    if (isNaN(numericValue) || numericValue <= 0) {
      alert('Please enter a valid positive number');
      return;
    }
    
    onSubmit(numericValue, localUnit);
    setLocalValue('');
    setLocalUnit('m²');
  };

  const handleClose = () => {
    setLocalValue('');
    setLocalUnit('m²');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`max-w-md w-full mx-4 p-6 rounded-lg shadow-xl ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={handleClose}
            className={`p-1 rounded-md transition-colors ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Area Value Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Area Value
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                placeholder="Enter area value"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                required
                autoFocus
              />
            </div>

            {/* Unit Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Unit
              </label>
              <select
                value={localUnit}
                onChange={(e) => setLocalUnit(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {availableUnits.map(unit => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Information */}
            <div className={`text-sm p-3 rounded-md ${
              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'
            }`}>
              <div className="flex justify-between">
                <span>Selected Unit:</span>
                <span className="font-medium">{localUnit}</span>
              </div>
              {localValue && !isNaN(parseFloat(localValue)) && (
                <div className="flex justify-between mt-1">
                  <span>Value:</span>
                  <span className="font-medium">{parseFloat(localValue).toLocaleString()} {localUnit}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AreaInputModal;