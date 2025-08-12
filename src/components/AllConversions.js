import React from 'react';
import { Calculator, Copy, Check } from 'lucide-react';

const AllConversions = ({ darkMode, totalAreaInSqM = 0, unitConversions }) => {
  const [copiedUnit, setCopiedUnit] = React.useState(null);

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

  // Format number for display
  const formatNumber = (value) => {
    if (value === 0) return '0';
    if (value < 0.001) return value.toExponential(3);
    if (value < 1) return value.toFixed(6).replace(/\.?0+$/, '');
    if (value < 10000) return value.toFixed(2).replace(/\.?0+$/, '');
    if (value < 1000000) return (value / 1000).toFixed(1).replace(/\.?0+$/, '') + 'K';
    return (value / 1000000).toFixed(1).replace(/\.?0+$/, '') + 'M';
  };

  // Convert area from square meters to other units
  const conversions = React.useMemo(() => {
    if (totalAreaInSqM === 0) return [];

    return [
      {
        unit: 'm²',
        name: 'Square Meters',
        value: totalAreaInSqM,
        factor: unitConversions['m²']
      },
      {
        unit: 'ft²',
        name: 'Square Feet',
        value: totalAreaInSqM / unitConversions['ft²'],
        factor: unitConversions['ft²']
      },
      {
        unit: 'hectares',
        name: 'Hectares',
        value: totalAreaInSqM / unitConversions['hectares'],
        factor: unitConversions['hectares']
      },
      {
        unit: 'acres',
        name: 'Acres',
        value: totalAreaInSqM / unitConversions['acres'],
        factor: unitConversions['acres']
      },
      {
        unit: 'arpent',
        name: 'Arpent',
        value: totalAreaInSqM / unitConversions['arpent'],
        factor: unitConversions['arpent']
      },
      {
        unit: 'perche',
        name: 'Perche',
        value: totalAreaInSqM / unitConversions['perche'],
        factor: unitConversions['perche']
      },
      {
        unit: 'toise',
        name: 'Toise',
        value: totalAreaInSqM / unitConversions['toise'],
        factor: unitConversions['toise']
      },
      {
        unit: 'yd²',
        name: 'Square Yards',
        value: totalAreaInSqM / unitConversions['yd²'],
        factor: unitConversions['yd²']
      },
      {
        unit: 'km²',
        name: 'Square Kilometers',
        value: totalAreaInSqM / unitConversions['km²'],
        factor: unitConversions['km²']
      }
    ];
  }, [totalAreaInSqM, unitConversions]);

  return (
    <div className={`rounded-xl shadow-sm border mt-4 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
    }`}>
      <div className={`p-4 border-b ${
        darkMode ? 'border-gray-600' : 'border-slate-200'
      }`}>
        <h3 className={`text-lg font-semibold flex items-center ${
          darkMode ? 'text-white' : 'text-slate-900'
        }`}>
          <Calculator className={`w-5 h-5 mr-2 ${
            darkMode ? 'text-gray-400' : 'text-slate-600'
          }`} />
          All Conversions
        </h3>
      </div>

      <div className="p-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {conversions.map((conversion) => (
              <div
                key={conversion.unit}
                className={`p-3 rounded-lg border transition-all duration-150 hover:shadow-md ${
                  darkMode
                    ? 'border-gray-600 bg-gray-700 hover:bg-gray-650'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
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
                
                <div className={`text-lg font-bold mb-1 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatNumber(conversion.value)}
                </div>
                
                <div className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {conversion.name}
                </div>
                
                {/* Conversion factor info */}
                <div className={`text-xs mt-1 ${
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  1 {conversion.unit} = {conversion.factor} m²
                </div>
              </div>
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
};

export default AllConversions;