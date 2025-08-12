/**
 * Area presets for common land sizes and lot types
 */

export const areaPresets = {
  residential: [
    {
      id: 'small-urban-lot',
      name: 'Small Urban Lot',
      area: 300, // m²
      description: '300 m² (3,230 ft²) - Typical small city lot',
      dimensions: { width: 15, length: 20 },
      category: 'Residential'
    },
    {
      id: 'standard-suburban-lot',
      name: 'Standard Suburban Lot',
      area: 800, // m²
      description: '800 m² (8,611 ft²) - Common suburban home lot',
      dimensions: { width: 20, length: 40 },
      category: 'Residential'
    },
    {
      id: 'large-suburban-lot',
      name: 'Large Suburban Lot',
      area: 1200, // m²
      description: '1,200 m² (12,917 ft²) - Spacious suburban lot',
      dimensions: { width: 30, length: 40 },
      category: 'Residential'
    },
    {
      id: 'quarter-acre',
      name: 'Quarter Acre Lot',
      area: 1012, // m² (0.25 acres)
      description: '0.25 acres (1,012 m²) - Classic American lot size',
      dimensions: { width: 25.3, length: 40 },
      category: 'Residential'
    },
    {
      id: 'half-acre',
      name: 'Half Acre Lot',
      area: 2023, // m² (0.5 acres)
      description: '0.5 acres (2,023 m²) - Large residential lot',
      dimensions: { width: 35.7, length: 56.7 },
      category: 'Residential'
    },
    {
      id: 'full-acre',
      name: 'One Acre Lot',
      area: 4047, // m² (1 acre)
      description: '1 acre (4,047 m²) - Rural residential lot',
      dimensions: { width: 63.6, length: 63.6 },
      category: 'Residential'
    }
  ],
  
  commercial: [
    {
      id: 'small-retail',
      name: 'Small Retail Space',
      area: 150, // m²
      description: '150 m² (1,615 ft²) - Small shop or office',
      dimensions: { width: 10, length: 15 },
      category: 'Commercial'
    },
    {
      id: 'medium-retail',
      name: 'Medium Retail Space',
      area: 500, // m²
      description: '500 m² (5,382 ft²) - Medium store or restaurant',
      dimensions: { width: 20, length: 25 },
      category: 'Commercial'
    },
    {
      id: 'large-retail',
      name: 'Large Retail Space',
      area: 2000, // m²
      description: '2,000 m² (21,528 ft²) - Department store size',
      dimensions: { width: 40, length: 50 },
      category: 'Commercial'
    },
    {
      id: 'warehouse',
      name: 'Warehouse',
      area: 5000, // m²
      description: '5,000 m² (53,820 ft²) - Industrial warehouse',
      dimensions: { width: 50, length: 100 },
      category: 'Commercial'
    },
    {
      id: 'office-building',
      name: 'Office Building Footprint',
      area: 1500, // m²
      description: '1,500 m² (16,146 ft²) - Multi-story office base',
      dimensions: { width: 30, length: 50 },
      category: 'Commercial'
    }
  ],
  
  agricultural: [
    {
      id: 'small-farm',
      name: 'Small Farm',
      area: 20000, // m² (2 hectares)
      description: '2 hectares (20,000 m²) - Small family farm',
      dimensions: { width: 100, length: 200 },
      category: 'Agricultural'
    },
    {
      id: 'medium-farm',
      name: 'Medium Farm',
      area: 100000, // m² (10 hectares)
      description: '10 hectares (100,000 m²) - Medium-sized farm',
      dimensions: { width: 200, length: 500 },
      category: 'Agricultural'
    },
    {
      id: 'large-farm',
      name: 'Large Farm',
      area: 500000, // m² (50 hectares)
      description: '50 hectares (500,000 m²) - Large agricultural operation',
      dimensions: { width: 500, length: 1000 },
      category: 'Agricultural'
    }
  ],
  
  recreational: [
    {
      id: 'tennis-court',
      name: 'Tennis Court',
      area: 261, // m²
      description: '261 m² (2,808 ft²) - Standard tennis court',
      dimensions: { width: 10.97, length: 23.77 },
      category: 'Recreational'
    },
    {
      id: 'basketball-court',
      name: 'Basketball Court',
      area: 420, // m²
      description: '420 m² (4,520 ft²) - Full basketball court',
      dimensions: { width: 15, length: 28 },
      category: 'Recreational'
    },
    {
      id: 'soccer-field',
      name: 'Soccer Field',
      area: 7140, // m²
      description: '7,140 m² (76,854 ft²) - FIFA standard soccer field',
      dimensions: { width: 68, length: 105 },
      category: 'Recreational'
    },
    {
      id: 'baseball-field',
      name: 'Baseball Field',
      area: 8361, // m²
      description: '8,361 m² (90,000 ft²) - Standard baseball field',
      dimensions: { width: 91.4, length: 91.4 },
      category: 'Recreational'
    }
  ]
};

/**
 * Get all presets as a flat array
 */
export const getAllPresets = () => {
  return Object.values(areaPresets).flat();
};

/**
 * Get presets by category
 */
export const getPresetsByCategory = (category) => {
  return areaPresets[category] || [];
};

/**
 * Get preset by ID
 */
export const getPresetById = (id) => {
  return getAllPresets().find(preset => preset.id === id);
};

/**
 * Search presets by name or description
 */
export const searchPresets = (searchTerm) => {
  const term = searchTerm.toLowerCase();
  return getAllPresets().filter(preset => 
    preset.name.toLowerCase().includes(term) || 
    preset.description.toLowerCase().includes(term)
  );
};