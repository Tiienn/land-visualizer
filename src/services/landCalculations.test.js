import {
  getContextualComparisons,
  getComparisonsByCategory,
  getTraditionalUnitInfo,
  calculateComparisonQuantity,
  defaultComparisons,
  TRADITIONAL_UNITS
} from './landCalculations';

describe('Enhanced Visual Comparison System', () => {
  describe('getContextualComparisons', () => {
    test('should prioritize traditional objects for traditional units', () => {
      const results = getContextualComparisons(2500, 'perche', 5);
      
      expect(results).toBeDefined();
      expect(results.length).toBeLessThanOrEqual(5);
      
      // First few results should be traditional context
      const traditionalFirst = results.slice(0, 3);
      expect(traditionalFirst.every(obj => obj.context === 'Traditional')).toBe(true);
    });

    test('should prioritize modern objects for modern units', () => {
      const results = getContextualComparisons(2500, 'm²', 5);
      
      expect(results).toBeDefined();
      expect(results.length).toBeLessThanOrEqual(5);
      
      // Should have modern objects prioritized
      const hasModern = results.some(obj => obj.context === 'Modern');
      expect(hasModern).toBe(true);
    });

    test('should sort by area relevance', () => {
      const totalArea = 400; // 400 m² should be close to stone barn (400 m²)
      const results = getContextualComparisons(totalArea, 'm²', 10);
      
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      
      // First result should be reasonably close to the target area
      const firstResult = results[0];
      const ratio = totalArea / firstResult.area;
      expect(ratio).toBeGreaterThan(0.1);
      expect(ratio).toBeLessThan(10);
    });

    test('should limit results to maxResults', () => {
      const results = getContextualComparisons(1000, 'm²', 3);
      
      expect(results.length).toBeLessThanOrEqual(3);
    });
  });

  describe('getComparisonsByCategory', () => {
    test('should filter objects by category', () => {
      const traditionalBuildings = getComparisonsByCategory('Traditional Buildings');
      
      expect(traditionalBuildings).toBeDefined();
      expect(traditionalBuildings.length).toBeGreaterThan(0);
      expect(traditionalBuildings.every(obj => obj.category === 'Traditional Buildings')).toBe(true);
    });

    test('should return empty array for non-existent category', () => {
      const nonExistent = getComparisonsByCategory('NonExistent');
      
      expect(nonExistent).toBeDefined();
      expect(nonExistent).toEqual([]);
    });
  });

  describe('getTraditionalUnitInfo', () => {
    test('should return info for perche', () => {
      const info = getTraditionalUnitInfo('perche');
      
      expect(info).toBeDefined();
      expect(info.name).toBe('Perche');
      expect(info.description).toContain('traditional French unit');
      expect(info.historicalContext).toBeDefined();
      expect(info.modernEquivalent).toBeDefined();
    });

    test('should return info for toise', () => {
      const info = getTraditionalUnitInfo('toise');
      
      expect(info).toBeDefined();
      expect(info.name).toBe('Toise');
      expect(info.description).toContain('ancient French unit');
    });

    test('should return info for arpent', () => {
      const info = getTraditionalUnitInfo('arpent');
      
      expect(info).toBeDefined();
      expect(info.name).toBe('Arpent');
      expect(info.description).toContain('traditional French unit');
    });

    test('should return null for non-traditional unit', () => {
      const info = getTraditionalUnitInfo('m²');
      
      expect(info).toBeNull();
    });
  });

  describe('calculateComparisonQuantity', () => {
    test('should return percentage for very small fractions', () => {
      const result = calculateComparisonQuantity(10, 200); // 5% of object
      
      expect(result.type).toBe('fraction');
      expect(result.text).toContain('%');
      expect(result.quantity).toBe(0.05);
    });

    test('should return decimal for small fractions', () => {
      const result = calculateComparisonQuantity(150, 200); // 0.75 of object
      
      expect(result.type).toBe('fraction');
      expect(result.text).toContain('0.8 of');
      expect(result.quantity).toBe(0.75);
    });

    test('should return multiplier for larger areas', () => {
      const result = calculateComparisonQuantity(800, 200); // 4x object
      
      expect(result.type).toBe('multiple');
      expect(result.text).toContain('4.0 ×');
      expect(result.quantity).toBe(4);
    });

    test('should round large multiples', () => {
      const result = calculateComparisonQuantity(2150, 200); // 10.75x object
      
      expect(result.type).toBe('multiple');
      expect(result.text).toContain('11 ×');
      expect(result.quantity).toBe(11);
    });
  });

  describe('defaultComparisons structure', () => {
    test('should have traditional objects with proper structure', () => {
      const traditionalObjects = defaultComparisons.filter(obj => obj.context === 'Traditional');
      
      expect(traditionalObjects.length).toBeGreaterThan(5);
      
      traditionalObjects.forEach(obj => {
        expect(obj).toHaveProperty('id');
        expect(obj).toHaveProperty('name');
        expect(obj).toHaveProperty('area');
        expect(obj).toHaveProperty('category');
        expect(obj).toHaveProperty('context');
        expect(obj).toHaveProperty('description');
        expect(obj).toHaveProperty('traditionalContext');
        expect(typeof obj.area).toBe('number');
        expect(obj.area).toBeGreaterThan(0);
      });
    });

    test('should have objects covering different area ranges', () => {
      // Check coverage of different area ranges for traditional unit users
      const areas = defaultComparisons.map(obj => obj.area);
      
      // Should have small objects (< 100 m²)
      expect(areas.some(area => area < 100)).toBe(true);
      
      // Should have medium objects (100-1000 m²)
      expect(areas.some(area => area >= 100 && area <= 1000)).toBe(true);
      
      // Should have large objects (> 1000 m²)
      expect(areas.some(area => area > 1000)).toBe(true);
    });
  });

  describe('TRADITIONAL_UNITS constant', () => {
    test('should include all traditional units', () => {
      expect(TRADITIONAL_UNITS).toContain('perche');
      expect(TRADITIONAL_UNITS).toContain('toise');
      expect(TRADITIONAL_UNITS).toContain('arpent');
      expect(TRADITIONAL_UNITS.length).toBe(3);
    });
  });
});

describe('3D Geometry Definitions', () => {
  describe('Soccer Field 3D Geometry', () => {
    const soccerField = defaultComparisons.find(obj => obj.id === 'soccer-field');
    
    test('should have complete 3D geometry structure', () => {
      expect(soccerField).toBeDefined();
      expect(soccerField.geometry3D).toBeDefined();
      expect(soccerField.geometry3D.base).toBeDefined();
      expect(soccerField.geometry3D.features).toBeDefined();
      expect(Array.isArray(soccerField.geometry3D.features)).toBe(true);
    });

    test('should have accurate field dimensions', () => {
      const base = soccerField.geometry3D.base;
      expect(base.size).toEqual([105, 0.1, 68]); // FIFA standard: 105m × 68m
      expect(base.type).toBe('box');
    });

    test('should have penalty boxes with correct dimensions', () => {
      const penaltyBoxLeft = soccerField.geometry3D.features.find(f => f.name === 'penalty-box-left');
      const penaltyBoxRight = soccerField.geometry3D.features.find(f => f.name === 'penalty-box-right');
      
      expect(penaltyBoxLeft).toBeDefined();
      expect(penaltyBoxRight).toBeDefined();
      
      // 16.5m from goal × 40.2m wide
      expect(penaltyBoxLeft.size).toEqual([16.5, 0.02, 40.2]);
      expect(penaltyBoxRight.size).toEqual([16.5, 0.02, 40.2]);
    });

    test('should have goal areas with correct dimensions', () => {
      const goalAreaLeft = soccerField.geometry3D.features.find(f => f.name === 'goal-area-left');
      const goalAreaRight = soccerField.geometry3D.features.find(f => f.name === 'goal-area-right');
      
      expect(goalAreaLeft).toBeDefined();
      expect(goalAreaRight).toBeDefined();
      
      // 5.5m from goal × 18.3m wide
      expect(goalAreaLeft.size).toEqual([5.5, 0.02, 18.3]);
      expect(goalAreaRight.size).toEqual([5.5, 0.02, 18.3]);
    });

    test('should have center circle with correct radius', () => {
      const centerCircle = soccerField.geometry3D.features.find(f => f.name === 'center-circle');
      
      expect(centerCircle).toBeDefined();
      expect(centerCircle.type).toBe('ring');
      expect(centerCircle.innerRadius).toBe(9.0);
      expect(centerCircle.outerRadius).toBe(9.3);
    });

    test('should have goals with correct structure', () => {
      const goalLeft = soccerField.geometry3D.features.find(f => f.name === 'goal-left');
      const goalRight = soccerField.geometry3D.features.find(f => f.name === 'goal-right');
      
      expect(goalLeft).toBeDefined();
      expect(goalRight).toBeDefined();
      expect(goalLeft.type).toBe('group');
      expect(goalRight.type).toBe('group');
      expect(goalLeft.children).toHaveLength(3); // 2 posts + crossbar
      expect(goalRight.children).toHaveLength(3); // 2 posts + crossbar
    });

    test('should have render settings', () => {
      expect(soccerField.renderSettings).toBeDefined();
      expect(soccerField.renderSettings.castShadow).toBe(true);
      expect(soccerField.renderSettings.receiveShadow).toBe(true);
      expect(soccerField.renderSettings.LOD).toBeDefined();
    });

    test('should have materials defined for all components', () => {
      const base = soccerField.geometry3D.base;
      expect(base.material).toBeDefined();
      expect(base.material.color).toBe('#22c55e'); // Green field color
      
      soccerField.geometry3D.features.forEach(feature => {
        if (feature.type !== 'group') {
          expect(feature.material).toBeDefined();
        }
      });
    });

    test('should be composite type', () => {
      expect(soccerField.type).toBe('composite');
    });
  });

  describe('Basketball Court 3D Geometry', () => {
    const basketballCourt = defaultComparisons.find(obj => obj.id === 'basketball-court');
    
    test('should have complete 3D geometry structure', () => {
      expect(basketballCourt).toBeDefined();
      expect(basketballCourt.geometry3D).toBeDefined();
      expect(basketballCourt.geometry3D.base).toBeDefined();
      expect(basketballCourt.geometry3D.features).toBeDefined();
      expect(Array.isArray(basketballCourt.geometry3D.features)).toBe(true);
    });

    test('should have accurate court dimensions', () => {
      const base = basketballCourt.geometry3D.base;
      expect(base.size).toEqual([28.65, 0.05, 15.24]); // NBA standard: 28.65m × 15.24m
      expect(base.type).toBe('box');
    });

    test('should have keys with correct dimensions', () => {
      const keyLeft = basketballCourt.geometry3D.features.find(f => f.name === 'key-left');
      const keyRight = basketballCourt.geometry3D.features.find(f => f.name === 'key-right');
      
      expect(keyLeft).toBeDefined();
      expect(keyRight).toBeDefined();
      
      // 5.79m × 4.88m (NBA key dimensions)
      expect(keyLeft.size).toEqual([5.79, 0.02, 4.88]);
      expect(keyRight.size).toEqual([5.79, 0.02, 4.88]);
    });

    test('should have hoops with correct structure', () => {
      const hoopLeft = basketballCourt.geometry3D.features.find(f => f.name === 'hoop-left');
      const hoopRight = basketballCourt.geometry3D.features.find(f => f.name === 'hoop-right');
      
      expect(hoopLeft).toBeDefined();
      expect(hoopRight).toBeDefined();
      expect(hoopLeft.type).toBe('group');
      expect(hoopRight.type).toBe('group');
      expect(hoopLeft.children).toHaveLength(3); // backboard + rim + post
      expect(hoopRight.children).toHaveLength(3); // backboard + rim + post
    });

    test('should be composite type', () => {
      expect(basketballCourt.type).toBe('composite');
    });
  });

  describe('3D Geometry Validation Helpers', () => {
    test('should validate position arrays', () => {
      const soccerField = defaultComparisons.find(obj => obj.id === 'soccer-field');
      
      // Check base position
      expect(Array.isArray(soccerField.geometry3D.base.position)).toBe(true);
      expect(soccerField.geometry3D.base.position).toHaveLength(3);
      
      // Check feature positions
      soccerField.geometry3D.features.forEach(feature => {
        if (feature.position) {
          expect(Array.isArray(feature.position)).toBe(true);
          expect(feature.position).toHaveLength(3);
        }
      });
    });

    test('should validate size arrays for box geometries', () => {
      const soccerField = defaultComparisons.find(obj => obj.id === 'soccer-field');
      
      // Check base size
      expect(Array.isArray(soccerField.geometry3D.base.size)).toBe(true);
      expect(soccerField.geometry3D.base.size).toHaveLength(3);
      
      // Check feature sizes for box types
      soccerField.geometry3D.features.forEach(feature => {
        if (feature.type === 'box') {
          expect(Array.isArray(feature.size)).toBe(true);
          expect(feature.size).toHaveLength(3);
        }
      });
    });
  });
});

describe('Traditional Unit Context Validation', () => {
  test('100 perches should have appropriate comparisons', () => {
    const hundredPerches = 100 * 25.29; // ~2529 m²
    const results = getContextualComparisons(hundredPerches, 'perche', 5);
    
    expect(results.length).toBeGreaterThan(0);
    
    // Should find objects that make sense for this area
    const quantities = results.map(obj => calculateComparisonQuantity(hundredPerches, obj.area));
    const reasonableQuantities = quantities.filter(q => q.quantity >= 0.1 && q.quantity <= 100);
    
    expect(reasonableQuantities.length).toBeGreaterThan(0);
  });

  test('100 toises should have appropriate comparisons', () => {
    const hundredToises = 100 * 3.8; // ~380 m²
    const results = getContextualComparisons(hundredToises, 'toise', 5);
    
    expect(results.length).toBeGreaterThan(0);
    
    // Should prioritize traditional context for toises
    expect(results[0].context).toBe('Traditional');
  });
});