/**
 * Land calculation utilities and services
 */

// Default comparison objects with accurate area calculations
export const defaultComparisons = [
  {
    id: 'soccer-field',
    name: 'Soccer Field',
    area: 7140, // FIFA standard field: 105m × 68m
    type: 'rectangle',
    dimensions: { length: 105, width: 68 },
    color: 'green',
    icon: '⚽'
  },
  {
    id: 'basketball-court',
    name: 'Basketball Court',
    area: 420, // NBA court: 28m × 15m
    type: 'rectangle',
    dimensions: { length: 28.65, width: 15.24 },
    color: 'orange',
    icon: '🏀'
  },
  {
    id: 'tennis-court',
    name: 'Tennis Court',
    area: 261, // Standard court: 23.77m × 10.97m
    type: 'rectangle',
    dimensions: { length: 23.77, width: 10.97 },
    color: 'red',
    icon: '🎾'
  },
  {
    id: 'parking-space',
    name: 'Parking Space',
    area: 12.5, // Standard: 5m × 2.5m
    type: 'rectangle',
    dimensions: { length: 5, width: 2.5 },
    color: 'gray',
    icon: '🚗'
  },
  {
    id: 'house-footprint',
    name: 'Average House',
    area: 200, // Typical house footprint
    type: 'rectangle',
    dimensions: { length: 20, width: 10 },
    color: 'brown',
    icon: '🏠'
  }
];

// Color mapping for 3D visualization
export const colorMap = {
  'purple': '#8b5cf6',
  'indigo': '#6366f1',
  'pink': '#ec4899',
  'red': '#ef4444',
  'orange': '#f97316',
  'yellow': '#eab308',
  'lime': '#84cc16',
  'green': '#22c55e',
  'teal': '#14b8a6',
  'cyan': '#06b6d4',
  'emerald': '#10b981',
  'amber': '#f59e0b',
  'sky': '#0ea5e9',
  'violet': '#8b5cf6',
  'slate': '#64748b',
  'lightblue': '#ADD8E6',
  'gray': '#6b7280',
  'brown': '#92400e'
};

/**
 * Calculate area from rectangular dimensions
 */
export const calculateRectangleArea = (length, width) => {
  return length * width;
};

/**
 * Calculate area from polygon points using shoelace formula
 */
export const calculatePolygonArea = (points) => {
  if (points.length < 3) return 0;
  
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
};

/**
 * Calculate distance between two 3D points
 */
export const calculateDistance = (point1, point2) => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const dz = point2.z - point1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

/**
 * Generate optimal arrangement for comparison objects
 */
export const arrangeComparisonObjects = (totalArea, objectArea, maxObjects = 50) => {
  const count = Math.min(Math.floor(totalArea / objectArea), maxObjects);
  const positions = [];
  
  if (count === 0) return positions;
  
  // Calculate grid layout
  const gridSize = Math.ceil(Math.sqrt(count));
  const spacing = Math.sqrt(totalArea) / gridSize;
  
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    
    const x = (col - gridSize / 2) * spacing;
    const z = (row - gridSize / 2) * spacing;
    
    positions.push({ x, y: 0.01, z });
  }
  
  return positions;
};

/**
 * Format numbers for display with appropriate units
 */
export const formatNumber = (num) => {
  if (num < 1000) return num.toFixed(2);
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
  return (num / 1000000).toFixed(1) + 'M';
};

/**
 * Unit conversion factors to square meters
 */
export const UNIT_CONVERSIONS = {
  'm²': 1,
  'ft²': 0.09290304,
  'acres': 4046.86,
  'hectares': 10000,
  'yd²': 0.83612736,
  'km²': 1000000,
  'arpent': 3419,
  'perche': 25.29285264,
  'toise': 3.7987
};

/**
 * Convert area from one unit to another
 */
export const convertArea = (value, fromUnit, toUnit) => {
  const sqMeters = value * (UNIT_CONVERSIONS[fromUnit] || 1);
  return sqMeters / (UNIT_CONVERSIONS[toUnit] || 1);
};