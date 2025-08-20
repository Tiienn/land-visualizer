import React from 'react';
import { Calculator, Copy, Check } from 'lucide-react';
import { calculateTotalArea, unitToSquareMeters } from '../services/unitConversions';

const UnitMetrics = ({ 
  darkMode, 
  units = [], 
  title = "Unit Metrics",
  subtitle = "Automatic area conversions for all popular units" 
}) => {
  const [copiedUnit, setCopiedUnit] = React.useState(null);

  // Calculate total area from units array
  const totalAreaInSqM = React.useMemo(() => {
    return calculateTotalArea(units);
  }, [units]);

  // Copy value to clipboard
  const copyValue = async (value, unit) => {
    try {
      await navigator.clipboard.writeText(value.toString());
      setCopiedUnit(unit);
      setTimeout(() => setCopiedUnit(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Format number for display - always show full numeric value
  const formatNumber = (value) => {
    if (value === 0) return '0';
    if (value < 0.001) return value.toExponential(3);
    if (value < 1) return value.toFixed(6).replace(/\.?0+$/, '');
    if (value < 1000) return value.toFixed(2).replace(/\.?0+$/, '');
    // Always show full numbers with commas for readability
    return value.toLocaleString(undefined, { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    });
  };

  // Convert area from square meters to other units
  const conversions = React.useMemo(() => {
    if (totalAreaInSqM === 0) return [];

    return [
      {
        unit: 'm²',
        name: 'Square Meters',
        value: totalAreaInSqM,
        factor: unitToSquareMeters['m²']
      },
      {
        unit: 'ft²',
        name: 'Square Feet',
        value: totalAreaInSqM / unitToSquareMeters['ft²'],
        factor: unitToSquareMeters['ft²']
      },
      {
        unit: 'yd²',
        name: 'Square Yards',
        value: totalAreaInSqM / unitToSquareMeters['yd²'],
        factor: unitToSquareMeters['yd²']
      },
      {
        unit: 'acres',
        name: 'Acres',
        value: totalAreaInSqM / unitToSquareMeters['acres'],
        factor: unitToSquareMeters['acres']
      },
      {
        unit: 'hectares',
        name: 'Hectares',
        value: totalAreaInSqM / unitToSquareMeters['hectares'],
        factor: unitToSquareMeters['hectares']
      },
      {
        unit: 'arpent',
        name: 'Arpent',
        value: totalAreaInSqM / unitToSquareMeters['arpent'],
        factor: unitToSquareMeters['arpent']
      },
      {
        unit: 'perche',
        name: 'Perche',
        value: totalAreaInSqM / unitToSquareMeters['perche'],
        factor: unitToSquareMeters['perche']
      },
      {
        unit: 'toise',
        name: 'Toise',
        value: totalAreaInSqM / unitToSquareMeters['toise'],
        factor: unitToSquareMeters['toise']
      }
    ];
  }, [totalAreaInSqM]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-4">
        <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h4>
        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {subtitle}
        </p>
      </div>

      {totalAreaInSqM === 0 ? (
        <div className={`text-center py-8 ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <Calculator className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">
            Enter land area values to see automatic conversions
          </p>
        </div>
      ) : (
        <>
          {/* Total Area Display */}
          <div className={`p-3 rounded-lg border ${
            darkMode 
              ? 'border-blue-600 bg-blue-900/20' 
              : 'border-blue-200 bg-blue-50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-sm font-medium ${
                  darkMode ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  Total Area
                </span>
                <div className={`text-lg font-bold ${
                  darkMode ? 'text-blue-200' : 'text-blue-900'
                }`}>
                  {formatNumber(totalAreaInSqM)} m²
                </div>
              </div>
              <Calculator className={`w-6 h-6 ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
          </div>

          {/* Conversions Grid */}
          <div className="space-y-2">
            <h5 className={`text-sm font-medium ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              All Unit Conversions
            </h5>
            
            <div className="space-y-2">
              {conversions.map((conversion) => (
                <div
                  key={conversion.unit}
                  className={`p-3 rounded-lg border transition-all duration-150 hover:shadow-sm ${
                    darkMode
                      ? 'border-gray-600 bg-gray-700/50 hover:bg-gray-700'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {conversion.unit}
                    </span>
                    <button
                      onClick={() => copyValue(conversion.value.toFixed(6), conversion.unit)}
                      className={`p-1 rounded transition-colors ${
                        darkMode
                          ? 'hover:bg-gray-600 text-gray-400 hover:text-white'
                          : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                      }`}
                      title={`Copy ${conversion.unit} value`}
                    >
                      {copiedUnit === conversion.unit ? (
                        <Check size={12} className="text-green-500" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>
                  
                  <div className={`font-semibold mb-1 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  } ${conversion.value > 10000 ? 'text-sm' : 'text-lg'}`}>
                    {formatNumber(conversion.value)}
                  </div>
                  
                  <div className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {conversion.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UnitMetrics;