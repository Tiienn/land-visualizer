import {
  unitToSquareMeters,
  convertArea,
  getAvailableUnits,
  formatArea,
  calculateTotalArea,
  getOptimalUnit,
  toOptimalFormat
} from './unitConversions';

describe('unitConversions', () => {
  describe('convertArea', () => {
    test('should convert between different units correctly', () => {
      expect(convertArea(1, 'm²', 'm²')).toBe(1);
      expect(convertArea(1, 'm²', 'ft²')).toBeCloseTo(10.764, 2);
      expect(convertArea(1, 'hectares', 'm²')).toBe(10000);
      expect(convertArea(1, 'acres', 'm²')).toBeCloseTo(4046.86, 2);
    });

    test('should handle reverse conversions', () => {
      expect(convertArea(10000, 'm²', 'hectares')).toBe(1);
      expect(convertArea(4046.86, 'm²', 'acres')).toBeCloseTo(1, 2);
    });
  });

  describe('getAvailableUnits', () => {
    test('should return all available units', () => {
      const units = getAvailableUnits();
      expect(units).toContain('m²');
      expect(units).toContain('ft²');
      expect(units).toContain('hectares');
      expect(units).toContain('acres');
      expect(units).toContain('arpent');
      expect(units).toContain('perche');
      expect(units).toContain('toise');
    });
  });

  describe('formatArea', () => {
    test('should format small values with 2 decimal places', () => {
      expect(formatArea(5.567, 'm²')).toBe('5.57 m²');
    });

    test('should format medium values with 1 decimal place', () => {
      expect(formatArea(156.78, 'm²')).toBe('156.8 m²');
    });

    test('should format large values with no decimal places', () => {
      expect(formatArea(12345.67, 'm²')).toBe('12346 m²');
    });
  });

  describe('calculateTotalArea', () => {
    test('should calculate total area from multiple units', () => {
      const units = [
        { value: 1000, unit: 'm²' },
        { value: 1, unit: 'hectares' },
        { value: 1, unit: 'acres' }
      ];
      
      const total = calculateTotalArea(units);
      const expected = 1000 + 10000 + 4046.86;
      expect(total).toBeCloseTo(expected, 2);
    });

    test('should handle empty array', () => {
      expect(calculateTotalArea([])).toBe(0);
    });

    test('should handle single unit', () => {
      const units = [{ value: 5000, unit: 'm²' }];
      expect(calculateTotalArea(units)).toBe(5000);
    });
  });

  describe('getOptimalUnit', () => {
    test('should return hectares for large areas', () => {
      expect(getOptimalUnit(50000)).toBe('hectares');
    });

    test('should return acres for medium-large areas', () => {
      expect(getOptimalUnit(8000)).toBe('acres');
    });

    test('should return m² for medium areas', () => {
      expect(getOptimalUnit(2000)).toBe('m²');
    });

    test('should return m² for small areas', () => {
      expect(getOptimalUnit(500)).toBe('m²');
    });
  });

  describe('toOptimalFormat', () => {
    test('should convert to optimal unit and value', () => {
      const result = toOptimalFormat(50000);
      expect(result.unit).toBe('hectares');
      expect(result.value).toBe(5);
    });

    test('should handle smaller areas', () => {
      const result = toOptimalFormat(2000);
      expect(result.unit).toBe('m²');
      expect(result.value).toBe(2000);
    });
  });

  describe('unit conversion factors', () => {
    test('should have correct conversion factors', () => {
      expect(unitToSquareMeters['m²']).toBe(1);
      expect(unitToSquareMeters['ft²']).toBeCloseTo(0.092903, 5);
      expect(unitToSquareMeters['hectares']).toBe(10000);
      expect(unitToSquareMeters['acres']).toBeCloseTo(4046.86, 2);
    });

    test('should have traditional units', () => {
      expect(unitToSquareMeters['arpent']).toBeCloseTo(3418.89, 2);
      expect(unitToSquareMeters['perche']).toBeCloseTo(51.072, 3);
      expect(unitToSquareMeters['toise']).toBeCloseTo(3.798, 3);
    });
  });
});