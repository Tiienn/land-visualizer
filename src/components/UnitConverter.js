import React, { useState } from 'react';
import { Calculator, ArrowRightLeft, Copy, Check } from 'lucide-react';

const UnitConverter = ({ darkMode, unitConversions }) => {
  const [fromValue, setFromValue] = useState('');
  const [fromUnit, setFromUnit] = useState('m²');
  const [toUnit, setToUnit] = useState('ft²');
  const [copied, setCopied] = useState(false);

  // Calculate converted value
  const convertedValue = fromValue && !isNaN(fromValue) 
    ? (parseFloat(fromValue) * unitConversions[fromUnit] / unitConversions[toUnit]).toFixed(6)
    : '';

  // Format the converted value for display (remove trailing zeros)
  const formattedValue = convertedValue ? parseFloat(convertedValue).toString() : '';

  // Handle unit swap
  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  // Copy result to clipboard
  const copyResult = async () => {
    if (formattedValue) {
      try {
        await navigator.clipboard.writeText(formattedValue);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  // Unit options for display
  const unitOptions = Object.keys(unitConversions);

  return (
    <div className="space-y-3">
      {/* Input Value */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          darkMode ? 'text-gray-300' : 'text-slate-700'
        }`}>
          Value
        </label>
        <input
          type="number"
          value={fromValue}
          onChange={(e) => setFromValue(e.target.value)}
          placeholder="Enter value"
          className={`w-full px-2 py-1.5 text-sm rounded border transition-colors ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
          } focus:outline-none focus:ring-1 focus:ring-blue-500/20`}
        />
      </div>

      {/* From Unit */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          darkMode ? 'text-gray-300' : 'text-slate-700'
        }`}>
          From
        </label>
        <select
          value={fromUnit}
          onChange={(e) => setFromUnit(e.target.value)}
          className={`w-full px-2 py-1.5 text-sm rounded border transition-colors ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
          } focus:outline-none focus:ring-1 focus:ring-blue-500/20`}
        >
          {unitOptions.map(unit => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
      </div>

      {/* To Unit */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          darkMode ? 'text-gray-300' : 'text-slate-700'
        }`}>
          To
        </label>
        <select
          value={toUnit}
          onChange={(e) => setToUnit(e.target.value)}
          className={`w-full px-2 py-1.5 text-sm rounded border transition-colors ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
          } focus:outline-none focus:ring-1 focus:ring-blue-500/20`}
        >
          {unitOptions.map(unit => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
      </div>

      {/* Result */}
      <div>
        <label className={`block text-xs font-medium mb-1 ${
          darkMode ? 'text-gray-300' : 'text-slate-700'
        }`}>
          Result
        </label>
        <div className={`relative px-2 py-1.5 text-sm rounded border ${
          darkMode
            ? 'bg-gray-700 border-gray-600 text-white'
            : 'bg-gray-50 border-gray-300 text-gray-900'
        }`}>
          <span className={`${!formattedValue ? 'text-gray-400' : ''} text-sm`}>
            {formattedValue || '---'}
          </span>
          {formattedValue && (
            <button
              onClick={copyResult}
              className={`absolute right-1 top-1/2 transform -translate-y-1/2 p-0.5 rounded transition-colors ${
                darkMode
                  ? 'hover:bg-gray-600 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
              }`}
              title="Copy result"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          )}
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center">
        <button
          onClick={swapUnits}
          className={`flex items-center px-2 py-1 text-xs rounded border transition-colors ${
            darkMode
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          title="Swap units"
        >
          <ArrowRightLeft className="w-3 h-3 mr-1" />
          Swap
        </button>
      </div>
    </div>
  );
};

export default UnitConverter;