import { renderHook } from '@testing-library/react';
import * as THREE from 'three';
import ScreenSpaceOptimizer, { useScreenSpaceOptimization } from './ScreenSpaceOptimization';

// Mock performance.now for consistent testing
const mockPerformanceNow = jest.spyOn(performance, 'now');

describe('ScreenSpaceOptimizer', () => {
  let optimizer;
  let mockCamera;
  let mockRenderer;

  beforeEach(() => {
    optimizer = new ScreenSpaceOptimizer({
      minPixelSize: 2,
      maxPixelSize: 20,
      basePixelSize: 10,
      cullingDistance: 500,
      lodLevels: 3
    });

    mockCamera = {
      position: new THREE.Vector3(0, 10, 0),
      fov: 75,
      projectionMatrix: new THREE.Matrix4(),
      matrixWorldInverse: new THREE.Matrix4()
    };

    mockRenderer = {
      getSize: jest.fn(() => new THREE.Vector2(1920, 1080))
    };

    // Mock performance.now to return predictable values
    mockPerformanceNow.mockReturnValue(100);
  });

  afterEach(() => {
    mockPerformanceNow.mockRestore();
  });

  describe('Initialization', () => {
    test('should initialize with default options', () => {
      const defaultOptimizer = new ScreenSpaceOptimizer();
      
      expect(defaultOptimizer.options.minPixelSize).toBe(2);
      expect(defaultOptimizer.options.maxPixelSize).toBe(20);
      expect(defaultOptimizer.options.basePixelSize).toBe(10);
      expect(defaultOptimizer.options.cullingDistance).toBe(1000);
      expect(defaultOptimizer.options.lodLevels).toBe(4);
    });

    test('should override default options', () => {
      const customOptimizer = new ScreenSpaceOptimizer({
        minPixelSize: 4,
        maxPixelSize: 30,
        basePixelSize: 15
      });
      
      expect(customOptimizer.options.minPixelSize).toBe(4);
      expect(customOptimizer.options.maxPixelSize).toBe(30);
      expect(customOptimizer.options.basePixelSize).toBe(15);
    });

    test('should generate LOD levels correctly', () => {
      expect(optimizer.lodLevels).toHaveLength(3);
      expect(optimizer.lodLevels[0].distanceThreshold).toBe(20);
      expect(optimizer.lodLevels[1].distanceThreshold).toBe(40);
      expect(optimizer.lodLevels[2].distanceThreshold).toBe(80);
    });
  });

  describe('Point Optimization', () => {
    test('should optimize points correctly', () => {
      const testPoints = [
        {
          position: { x: 0, y: 0, z: 0 },
          style: 'cross',
          type: 'normal'
        },
        {
          position: { x: 10, y: 0, z: 10 },
          style: 'circle',
          type: 'selected'
        },
        {
          position: { x: 1000, y: 0, z: 1000 }, // Should be culled
          style: 'x',
          type: 'normal'
        }
      ];

      const optimizedPoints = optimizer.optimizePoints(testPoints, mockCamera, mockRenderer);
      
      // Should remove the distant point
      expect(optimizedPoints.length).toBeLessThan(testPoints.length);
      
      // Remaining points should have optimization properties
      optimizedPoints.forEach(point => {
        expect(point).toHaveProperty('distance');
        expect(point).toHaveProperty('lodLevel');
        expect(point).toHaveProperty('screenSpaceSize');
        expect(point).toHaveProperty('priority');
      });
    });

    test('should handle empty points array', () => {
      const optimizedPoints = optimizer.optimizePoints([], mockCamera, mockRenderer);
      expect(optimizedPoints).toEqual([]);
    });

    test('should handle invalid points gracefully', () => {
      const invalidPoints = [
        null,
        undefined,
        { position: null },
        { position: { x: 0, y: 0, z: 0 }, style: 'cross' }
      ];

      expect(() => {
        optimizer.optimizePoints(invalidPoints, mockCamera, mockRenderer);
      }).not.toThrow();
    });
  });

  describe('LOD Level Calculation', () => {
    test('should calculate LOD levels based on distance', () => {
      expect(optimizer.calculateLODLevel(15)).toBe(0); // Close
      expect(optimizer.calculateLODLevel(35)).toBe(1); // Medium
      expect(optimizer.calculateLODLevel(75)).toBe(2); // Far
      expect(optimizer.calculateLODLevel(150)).toBe(2); // Very far (max LOD)
    });
  });

  describe('Screen Space Size Calculation', () => {
    test('should calculate screen space size correctly', () => {
      const worldPosition = new THREE.Vector3(0, 0, 0);
      const canvasSize = new THREE.Vector2(1920, 1080);
      
      const size = optimizer.calculateScreenSpaceSize(
        worldPosition, 
        mockCamera, 
        canvasSize, 
        1.0
      );
      
      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThanOrEqual(optimizer.options.maxPixelSize / canvasSize.height);
    });

    test('should clamp size to min/max limits', () => {
      const worldPosition = new THREE.Vector3(0, 0, 0);
      const canvasSize = new THREE.Vector2(1920, 1080);
      
      // Test with very large multiplier
      const largeSize = optimizer.calculateScreenSpaceSize(
        worldPosition, 
        mockCamera, 
        canvasSize, 
        100.0
      );
      
      expect(largeSize).toBeLessThanOrEqual(optimizer.options.maxPixelSize / canvasSize.height);
    });
  });

  describe('Point Priority Calculation', () => {
    test('should calculate priority correctly', () => {
      const selectedPoint = {
        position: { x: 0, y: 0, z: 0 },
        type: 'selected'
      };
      
      const normalPoint = {
        position: { x: 0, y: 0, z: 0 },
        type: 'normal'
      };
      
      const selectedPriority = optimizer.calculatePointPriority(selectedPoint, 10, 0.01);
      const normalPriority = optimizer.calculatePointPriority(normalPoint, 10, 0.01);
      
      expect(selectedPriority).toBeGreaterThan(normalPriority);
    });

    test('should prioritize closer points', () => {
      const point = {
        position: { x: 0, y: 0, z: 0 },
        type: 'normal'
      };
      
      const closePriority = optimizer.calculatePointPriority(point, 10, 0.01);
      const farPriority = optimizer.calculatePointPriority(point, 100, 0.01);
      
      expect(closePriority).toBeGreaterThan(farPriority);
    });
  });

  describe('Marker Style Selection', () => {
    test('should simplify styles for simple LOD', () => {
      expect(optimizer.selectMarkerStyle('diamond', 'simple')).toBe('circle');
      expect(optimizer.selectMarkerStyle('square', 'simple')).toBe('circle');
      expect(optimizer.selectMarkerStyle('x', 'simple')).toBe('cross');
      expect(optimizer.selectMarkerStyle('plus', 'simple')).toBe('cross');
    });

    test('should keep original style for detailed LOD', () => {
      expect(optimizer.selectMarkerStyle('diamond', 'detailed')).toBe('diamond');
      expect(optimizer.selectMarkerStyle('square', 'detailed')).toBe('square');
    });
  });

  describe('Density Reduction', () => {
    test('should skip points based on density reduction', () => {
      const lodConfig = { densityReduction: 2 };
      const point = { position: { x: 0, y: 0, z: 0 } };
      
      // Should be deterministic based on point hash
      const shouldSkip = optimizer.shouldSkipPointForDensity(point, lodConfig);
      expect(typeof shouldSkip).toBe('boolean');
    });

    test('should not skip points when density reduction is 1', () => {
      const lodConfig = { densityReduction: 1 };
      const point = { position: { x: 0, y: 0, z: 0 } };
      
      expect(optimizer.shouldSkipPointForDensity(point, lodConfig)).toBe(false);
    });
  });

  describe('Performance Tracking', () => {
    test('should track frame times', () => {
      // Simulate frame processing
      mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(116); // 16ms frame
      
      const points = [{ position: { x: 0, y: 0, z: 0 }, style: 'cross' }];
      optimizer.optimizePoints(points, mockCamera, mockRenderer);
      
      expect(optimizer.frameTimeHistory.length).toBeGreaterThan(0);
    });

    test('should provide performance statistics', () => {
      const stats = optimizer.getPerformanceStats();
      
      expect(stats).toHaveProperty('avgFrameTime');
      expect(stats).toHaveProperty('targetFrameTime');
      expect(stats).toHaveProperty('isPerformanceGood');
      expect(stats).toHaveProperty('totalFrames');
    });
  });

  describe('Dynamic Optimization', () => {
    test('should apply aggressive optimization when performance is poor', () => {
      // Simulate poor performance
      optimizer.frameTimeHistory = [30, 35, 40, 33, 38]; // High frame times
      
      const points = Array(100).fill().map((_, i) => ({
        position: { x: i, y: 0, z: 0 },
        style: 'cross',
        type: 'normal',
        distance: i * 2,
        priority: 0.5
      }));
      
      const optimized = optimizer.applyAggressiveOptimization(points, mockCamera);
      expect(optimized.length).toBeLessThan(points.length);
    });

    test('should enhance detail when performance is good', () => {
      // Simulate good performance
      optimizer.frameTimeHistory = [8, 10, 12, 9, 11]; // Low frame times
      
      const points = [{
        position: { x: 0, y: 0, z: 0 },
        style: 'cross',
        type: 'normal',
        distance: 20,
        quality: 1
      }];
      
      const enhanced = optimizer.enhanceDetailLevel(points, mockCamera);
      expect(enhanced[0].quality).toBeGreaterThan(points[0].quality);
    });
  });
});

describe('SpatialGrid', () => {
  // Note: SpatialGrid is not exported, so we test spatial functionality through the optimizer

  test('should organize points spatially', () => {
    const optimizer = new ScreenSpaceOptimizer();
    
    const points = [
      { position: { x: 0, y: 0, z: 0 } },
      { position: { x: 100, y: 0, z: 100 } },
      { position: { x: 5, y: 0, z: 5 } }
    ];
    
    optimizer.spatialGrid.updatePoints(points);
    
    // Should be able to retrieve points
    const nearbyPoints = optimizer.spatialGrid.getPointsInRadius(0, 0, 10);
    expect(nearbyPoints.length).toBeGreaterThan(0);
  });
});

describe('useScreenSpaceOptimization Hook', () => {
  test('should provide optimization function and stats', () => {
    const { result } = renderHook(() => 
      useScreenSpaceOptimization({ minPixelSize: 3 })
    );
    
    expect(result.current.optimizePoints).toBeInstanceOf(Function);
    expect(result.current.optimizer).toBeDefined();
    // performanceStats may be null initially
  });

  test('should memoize optimization function', () => {
    const { result, rerender } = renderHook(() => 
      useScreenSpaceOptimization()
    );
    
    const firstOptimizePoints = result.current.optimizePoints;
    rerender();
    const secondOptimizePoints = result.current.optimizePoints;
    
    expect(firstOptimizePoints).toBe(secondOptimizePoints);
  });
});

describe('Performance Tests', () => {
  let optimizer;
  let mockCamera;
  let mockRenderer;

  beforeEach(() => {
    optimizer = new ScreenSpaceOptimizer({
      minPixelSize: 2,
      maxPixelSize: 20,
      basePixelSize: 10,
      cullingDistance: 500,
      lodLevels: 3
    });

    mockCamera = {
      position: new THREE.Vector3(0, 10, 0),
      fov: 75,
      projectionMatrix: new THREE.Matrix4(),
      matrixWorldInverse: new THREE.Matrix4()
    };

    mockRenderer = {
      getSize: jest.fn(() => new THREE.Vector2(1920, 1080))
    };
  });

  test('should handle large point datasets efficiently', () => {
    // Generate 5000 points
    const largePointSet = Array(5000).fill().map((_, i) => ({
      position: { 
        x: (i % 100) * 5, 
        y: 0, 
        z: Math.floor(i / 100) * 5 
      },
      style: 'cross',
      type: 'normal'
    }));
    
    const startTime = performance.now();
    const optimizedPoints = optimizer.optimizePoints(
      largePointSet, 
      mockCamera, 
      mockRenderer
    );
    const endTime = performance.now();
    
    // Should process in reasonable time (less than 100ms)
    expect(endTime - startTime).toBeLessThan(100);
    
    // Should reduce the number of points
    expect(optimizedPoints.length).toBeLessThan(largePointSet.length);
  });

  test('should optimize incrementally without performance degradation', () => {
    const basePoints = Array(1000).fill().map((_, i) => ({
      position: { x: i, y: 0, z: 0 },
      style: 'cross',
      type: 'normal'
    }));
    
    // First optimization
    const start1 = performance.now();
    optimizer.optimizePoints(basePoints, mockCamera, mockRenderer);
    const time1 = performance.now() - start1;
    
    // Second optimization with more points
    const morePoints = [...basePoints, ...Array(1000).fill().map((_, i) => ({
      position: { x: i + 1000, y: 0, z: 0 },
      style: 'circle',
      type: 'normal'
    }))];
    
    const start2 = performance.now();
    optimizer.optimizePoints(morePoints, mockCamera, mockRenderer);
    const time2 = performance.now() - start2;
    
    // Second optimization shouldn't be more than 3x slower
    expect(time2).toBeLessThan(time1 * 3);
  });
});

describe('Edge Cases', () => {
  let optimizer;
  let mockCamera;
  let mockRenderer;

  beforeEach(() => {
    optimizer = new ScreenSpaceOptimizer({
      minPixelSize: 2,
      maxPixelSize: 20,
      basePixelSize: 10,
      cullingDistance: 500,
      lodLevels: 3
    });

    mockCamera = {
      position: new THREE.Vector3(0, 10, 0),
      fov: 75,
      projectionMatrix: new THREE.Matrix4(),
      matrixWorldInverse: new THREE.Matrix4()
    };

    mockRenderer = {
      getSize: jest.fn(() => new THREE.Vector2(1920, 1080))
    };
  });

  test('should handle camera at origin', () => {
    const cameraAtOrigin = {
      position: new THREE.Vector3(0, 0, 0),
      fov: 75,
      projectionMatrix: new THREE.Matrix4(),
      matrixWorldInverse: new THREE.Matrix4()
    };
    
    const points = [{ position: { x: 1, y: 0, z: 1 }, style: 'cross' }];
    
    expect(() => {
      optimizer.optimizePoints(points, cameraAtOrigin, mockRenderer);
    }).not.toThrow();
  });

  test('should handle extreme FOV values', () => {
    const extremeCamera = {
      position: new THREE.Vector3(0, 10, 0),
      fov: 179, // Very wide FOV
      projectionMatrix: new THREE.Matrix4(),
      matrixWorldInverse: new THREE.Matrix4()
    };
    
    const points = [{ position: { x: 0, y: 0, z: 0 }, style: 'cross' }];
    
    expect(() => {
      optimizer.optimizePoints(points, extremeCamera, mockRenderer);
    }).not.toThrow();
  });

  test('should handle points with same position', () => {
    const duplicatePoints = Array(10).fill().map(() => ({
      position: { x: 0, y: 0, z: 0 },
      style: 'cross',
      type: 'normal'
    }));
    
    expect(() => {
      optimizer.optimizePoints(duplicatePoints, mockCamera, mockRenderer);
    }).not.toThrow();
  });
});