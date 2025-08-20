/**
 * Unit conversion factors and utilities for the Land Visualizer
 * All conversions are to square meters as the base unit
 */

// Unit conversion factors to square meters
export const unitToSquareMeters = {
  'm²': 1,
  'ft²': 0.092903,
  'yd²': 0.836127, // Square yards
  'hectares': 10000,
  'acres': 4046.86,
  'arpent': 3418.89, // Traditional French unit
  'perche': 51.072, // Traditional unit
  'toise': 3.798 // Traditional French unit
};

// Reverse conversion factors (from square meters)
export const squareMetersToUnit = Object.keys(unitToSquareMeters).reduce((acc, unit) => {
  acc[unit] = 1 / unitToSquareMeters[unit];
  return acc;
}, {});

/**
 * Convert area from one unit to another
 * @param {number} value - The area value to convert
 * @param {string} fromUnit - Source unit
 * @param {string} toUnit - Target unit
 * @returns {number} Converted value
 */
export function convertArea(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) return value;
  
  // Convert to square meters first, then to target unit
  const squareMeters = value * unitToSquareMeters[fromUnit];
  return squareMeters * squareMetersToUnit[toUnit];
}

/**
 * Get all available units
 * @returns {string[]} Array of unit names
 */
export function getAvailableUnits() {
  return Object.keys(unitToSquareMeters);
}

/**
 * Format area value with appropriate precision
 * @param {number} value - Area value
 * @param {string} unit - Unit name
 * @returns {string} Formatted string
 */
export function formatArea(value, unit) {
  if (value < 10) {
    return `${value.toFixed(2)} ${unit}`;
  } else if (value < 1000) {
    return `${value.toFixed(1)} ${unit}`;
  } else {
    return `${value.toFixed(0)} ${unit}`;
  }
}

/**
 * Calculate total area from multiple units
 * @param {Array} units - Array of {value, unit} objects
 * @returns {number} Total area in square meters
 */
export function calculateTotalArea(units) {
  return units.reduce((total, unit) => {
    return total + (unit.value * unitToSquareMeters[unit.unit]);
  }, 0);
}

/**
 * Get the most appropriate unit for displaying an area
 * @param {number} squareMeters - Area in square meters
 * @returns {string} Most appropriate unit
 */
export function getOptimalUnit(squareMeters) {
  if (squareMeters >= 10000) return 'hectares';
  if (squareMeters >= 4046.86) return 'acres';
  if (squareMeters >= 1000) return 'm²';
  return 'm²';
}

/**
 * Convert area to the most readable format
 * @param {number} squareMeters - Area in square meters
 * @returns {Object} {value, unit} in optimal format
 */
export function toOptimalFormat(squareMeters) {
  const unit = getOptimalUnit(squareMeters);
  const value = squareMeters * squareMetersToUnit[unit];
  return { value, unit };
}

const unitConversions = {
  unitToSquareMeters,
  squareMetersToUnit,
  convertArea,
  getAvailableUnits,
  formatArea,
  calculateTotalArea,
  getOptimalUnit,
  toOptimalFormat
};

export default unitConversions;