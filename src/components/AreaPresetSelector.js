import React, { useState, memo } from 'react';
import { Search, Grid3x3, Home, Building2, Tractor, Trophy } from 'lucide-react';
import { areaPresets, searchPresets } from '../services/areaPresets';

const AreaPresetSelector = memo(function AreaPresetSelector({ onSelectPreset, darkMode, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('residential');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const categories = [
    { id: 'residential', name: 'Residential', icon: Home },
    { id: 'commercial', name: 'Commercial', icon: Building2 },
    { id: 'agricultural', name: 'Agricultural', icon: Tractor },
    { id: 'recreational', name: 'Recreational', icon: Trophy }
  ];

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      setSearchResults(searchPresets(term));
    } else {
      setSearchResults([]);
    }
  };

  const handlePresetSelect = (preset) => {
    onSelectPreset(preset);
    onClose();
  };

  const currentPresets = searchTerm ? searchResults : areaPresets[selectedCategory];

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
      <div className={`max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden rounded-lg shadow-xl ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Area Presets
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${
                darkMode 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              ×
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search area presets..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        <div className="flex h-[60vh]">
          {/* Categories Sidebar */}
          {!searchTerm && (
            <div className={`w-1/3 border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="p-4">
                <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          selectedCategory === category.id
                            ? darkMode 
                              ? 'bg-blue-900 text-blue-200' 
                              : 'bg-blue-100 text-blue-800'
                            : darkMode
                              ? 'hover:bg-gray-700 text-gray-300'
                              : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <IconComponent size={18} />
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                          darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {areaPresets[category.id].length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Presets Grid */}
          <div className={`${searchTerm ? 'w-full' : 'w-2/3'} overflow-y-auto`}>
            <div className="p-4">
              {searchTerm && (
                <div className="mb-4">
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {searchResults.length} results for "{searchTerm}"
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {currentPresets.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:scale-[1.02] ${
                      darkMode 
                        ? 'border-gray-600 hover:border-gray-500 bg-gray-700 hover:bg-gray-600' 
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {preset.name}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {preset.category}
                      </span>
                    </div>
                    
                    <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {preset.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div>Area: {preset.area.toLocaleString()} m²</div>
                        <div>
                          {preset.dimensions.width.toFixed(1)}m × {preset.dimensions.length.toFixed(1)}m
                        </div>
                      </div>
                      
                      <Grid3x3 className="text-blue-500" size={20} />
                    </div>
                  </div>
                ))}
              </div>
              
              {currentPresets.length === 0 && (
                <div className="text-center py-12">
                  <Grid3x3 className={`mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={48} />
                  <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {searchTerm ? 'No presets found' : 'No presets available'}
                  </p>
                  {searchTerm && (
                    <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Try a different search term
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AreaPresetSelector;