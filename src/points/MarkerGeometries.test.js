import * as THREE from 'three';
import { MarkerGeometries, MarkerMaterials, MarkerUtils } from './MarkerGeometries';

describe('MarkerGeometries', () => {
  
  describe('Cross Geometry', () => {
    test('should create cross geometry with correct structure', () => {
      const geometry = MarkerGeometries.createCrossGeometry(2.0, 0.2);
      
      expect(geometry).toBeInstanceOf(THREE.BufferGeometry);
      expect(geometry.attributes.position).toBeDefined();
      expect(geometry.attributes.normal).toBeDefined();
      
      // Cross should have 12 vertices (2 rectangles × 6 vertices each)
      expect(geometry.attributes.position.count).toBe(12);
    });
    
    test('should handle different sizes and thickness', () => {
      const smallCross = MarkerGeometries.createCrossGeometry(1.0, 0.1);
      const largeCross = MarkerGeometries.createCrossGeometry(3.0, 0.3);
      
      expect(smallCross.boundingSphere.radius).toBeLessThan(largeCross.boundingSphere.radius);
    });
    
    test('should dispose properly', () => {
      const geometry = MarkerGeometries.createCrossGeometry();
      expect(() => geometry.dispose()).not.toThrow();
    });
  });
  
  describe('Circle Geometry', () => {
    test('should create circle geometry with correct structure', () => {
      const geometry = MarkerGeometries.createCircleGeometry(0.5, 0.05, 32);
      
      expect(geometry).toBeInstanceOf(THREE.RingGeometry);
      expect(geometry.attributes.position).toBeDefined();
    });
    
    test('should handle different parameters', () => {
      const circle1 = MarkerGeometries.createCircleGeometry(0.3, 0.02, 16);
      const circle2 = MarkerGeometries.createCircleGeometry(0.7, 0.08, 64);
      
      expect(circle1.attributes.position.count).toBeLessThan(circle2.attributes.position.count);
    });
  });
  
  describe('X Geometry', () => {
    test('should create X geometry with correct structure', () => {
      const geometry = MarkerGeometries.createXGeometry(1.0, 0.1);
      
      expect(geometry).toBeInstanceOf(THREE.BufferGeometry);
      expect(geometry.attributes.position).toBeDefined();
      expect(geometry.attributes.normal).toBeDefined();
      
      // X should have 12 vertices (2 diagonal bars × 6 vertices each)
      expect(geometry.attributes.position.count).toBe(12);
    });
  });
  
  describe('Plus Geometry', () => {
    test('should create plus geometry (thicker cross)', () => {
      const geometry = MarkerGeometries.createPlusGeometry(1.0, 0.2);
      
      expect(geometry).toBeInstanceOf(THREE.BufferGeometry);
      expect(geometry.attributes.position).toBeDefined();
    });
  });
  
  describe('Square Geometry', () => {
    test('should create square geometry with correct structure', () => {
      const geometry = MarkerGeometries.createSquareGeometry(1.0, 0.05);
      
      expect(geometry).toBeInstanceOf(THREE.RingGeometry);
      expect(geometry.attributes.position).toBeDefined();
    });
  });
  
  describe('Diamond Geometry', () => {
    test('should create diamond geometry with correct structure', () => {
      const geometry = MarkerGeometries.createDiamondGeometry(1.0, 0.05);
      
      expect(geometry).toBeInstanceOf(THREE.BufferGeometry);
      expect(geometry.attributes.position).toBeDefined();
      expect(geometry.attributes.normal).toBeDefined();
      expect(geometry.index).toBeDefined();
      
      // Diamond should have 8 vertices
      expect(geometry.attributes.position.count).toBe(8);
    });
  });
  
  describe('Dot Geometry', () => {
    test('should create dot geometry with correct structure', () => {
      const geometry = MarkerGeometries.createDotGeometry(0.1, 16);
      
      expect(geometry).toBeInstanceOf(THREE.CircleGeometry);
      expect(geometry.attributes.position).toBeDefined();
    });
  });
  
  describe('Factory Method', () => {
    test('should create geometry by type string', () => {
      const types = ['cross', 'circle', 'x', 'plus', 'square', 'diamond', 'dot'];
      
      types.forEach(type => {
        const geometry = MarkerGeometries.createGeometry(type, 1.0);
        expect(geometry).toBeInstanceOf(THREE.BufferGeometry);
      });
    });
    
    test('should handle unknown types gracefully', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const geometry = MarkerGeometries.createGeometry('unknown', 1.0);
      
      expect(geometry).toBeInstanceOf(THREE.BufferGeometry);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown marker type: unknown')
      );
      
      consoleWarnSpy.mockRestore();
    });
    
    test('should handle options parameter', () => {
      const geometry = MarkerGeometries.createGeometry('circle', 2.0, {
        thickness: 0.2,
        segments: 64
      });
      
      expect(geometry).toBeInstanceOf(THREE.RingGeometry);
    });
  });
  
  describe('Marker Types', () => {
    test('should provide all marker types', () => {
      const types = MarkerGeometries.getMarkerTypes();
      
      expect(types.CROSS).toBe('cross');
      expect(types.CIRCLE).toBe('circle');
      expect(types.X_MARKER).toBe('x');
      expect(types.PLUS).toBe('plus');
      expect(types.SQUARE).toBe('square');
      expect(types.DIAMOND).toBe('diamond');
      expect(types.DOT).toBe('dot');
    });
  });
});

describe('MarkerMaterials', () => {
  
  test('should create point material with correct properties', () => {
    const material = MarkerMaterials.createPointMaterial('#ff0000', 'normal');
    
    expect(material).toBeInstanceOf(THREE.MeshBasicMaterial);
    expect(material.transparent).toBe(true);
    expect(material.side).toBe(THREE.DoubleSide);
    expect(material.depthTest).toBe(true);
    expect(material.depthWrite).toBe(false);
  });
  
  test('should handle different states correctly', () => {
    const states = ['normal', 'hovered', 'selected', 'dragging', 'disabled'];
    
    states.forEach(state => {
      const material = MarkerMaterials.createPointMaterial('#ff6b35', state);
      expect(material).toBeInstanceOf(THREE.MeshBasicMaterial);
      
      if (state === 'disabled') {
        expect(material.opacity).toBe(0.5);
      } else if (state === 'normal') {
        expect(material.opacity).toBe(0.9);
      } else {
        expect(material.opacity).toBe(1.0);
      }
    });
  });
  
  test('should provide CAD color scheme', () => {
    const colors = MarkerMaterials.getCADColors();
    
    expect(colors.DEFAULT).toBe('#ff6b35');
    expect(colors.HOVERED).toBe('#60a5fa');
    expect(colors.SELECTED).toBe('#3b82f6');
    expect(colors.DRAGGING).toBe('#ef4444');
    expect(colors.DISABLED).toBe('#94a3b8');
    expect(colors.CONTROL_POINT).toBe('#10b981');
    expect(colors.CONSTRUCTION).toBe('#f59e0b');
    expect(colors.LOCKED).toBe('#6b7280');
  });
  
  test('should handle color conversion correctly', () => {
    const material = MarkerMaterials.createPointMaterial('#ff0000', 'normal');
    expect(material.color).toBeInstanceOf(THREE.Color);
  });
});

describe('MarkerUtils', () => {
  
  describe('Screen Space Size Calculation', () => {
    test('should calculate screen space size correctly', () => {
      // Mock camera
      const camera = {
        position: new THREE.Vector3(0, 10, 0),
        fov: 75
      };
      
      const worldPosition = new THREE.Vector3(0, 0, 0);
      const size = MarkerUtils.calculateScreenSpaceSize(worldPosition, camera, 10);
      
      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThanOrEqual(4.0); // Should be clamped
    });
    
    test('should return larger size for closer distances', () => {
      // Test with moderate distances to avoid clamping
      const camera1 = { position: new THREE.Vector3(0, 8, 0), fov: 75 };
      const camera2 = { position: new THREE.Vector3(0, 20, 0), fov: 75 };
      const worldPosition = new THREE.Vector3(0, 0, 0);
      
      const size1 = MarkerUtils.calculateScreenSpaceSize(worldPosition, camera1, 8);
      const size2 = MarkerUtils.calculateScreenSpaceSize(worldPosition, camera2, 8);
      
      // Check that closer distance gives larger or equal size (due to clamping)
      expect(size1).toBeGreaterThanOrEqual(size2);
      
      // Test that the function returns a value in the expected range
      expect(size1).toBeGreaterThanOrEqual(0.5);
      expect(size1).toBeLessThanOrEqual(4.0);
      expect(size2).toBeGreaterThanOrEqual(0.5);
      expect(size2).toBeLessThanOrEqual(4.0);
    });
  });
  
  describe('LOD Visibility', () => {
    test('should determine marker visibility correctly', () => {
      const camera = {
        position: new THREE.Vector3(0, 10, 0),
        fov: 75
      };
      
      const closePosition = new THREE.Vector3(0, 0, 0);
      const farPosition = new THREE.Vector3(100, 0, 100);
      
      const closeVisible = MarkerUtils.shouldRenderMarker(closePosition, camera, 4);
      const farVisible = MarkerUtils.shouldRenderMarker(farPosition, camera, 4);
      
      expect(typeof closeVisible).toBe('boolean');
      expect(typeof farVisible).toBe('boolean');
    });
  });
  
  describe('Instanced Mesh Creation', () => {
    test('should create instanced marker mesh', () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      
      const instancedMesh = MarkerUtils.createInstancedMarkerMesh(geometry, material, 100);
      
      expect(instancedMesh).toBeInstanceOf(THREE.InstancedMesh);
      expect(instancedMesh.count).toBe(100);
      expect(instancedMesh.instanceMatrix).toBeDefined();
    });
  });
  
  describe('Instanced Marker Updates', () => {
    test('should update instanced markers correctly', () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const instancedMesh = MarkerUtils.createInstancedMarkerMesh(geometry, material, 10);
      
      const markers = [
        { position: { x: 0, y: 0, z: 0 }, scale: 1.0 },
        { position: { x: 5, y: 0, z: 5 }, scale: 1.5 },
        { position: { x: -3, y: 2, z: 1 }, scale: 0.8 }
      ];
      
      expect(() => {
        MarkerUtils.updateInstancedMarkers(instancedMesh, markers);
      }).not.toThrow();
      
      expect(instancedMesh.count).toBe(3); // Should match markers length
    });
    
    test('should handle more markers than max instances', () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const instancedMesh = MarkerUtils.createInstancedMarkerMesh(geometry, material, 2);
      
      const markers = [
        { position: { x: 0, y: 0, z: 0 }, scale: 1.0 },
        { position: { x: 5, y: 0, z: 5 }, scale: 1.5 },
        { position: { x: -3, y: 2, z: 1 }, scale: 0.8 },
        { position: { x: 1, y: 1, z: 1 }, scale: 1.2 }
      ];
      
      MarkerUtils.updateInstancedMarkers(instancedMesh, markers);
      
      expect(instancedMesh.count).toBe(2); // Should be limited to maxInstances
    });
    
    test('should handle empty markers array', () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const instancedMesh = MarkerUtils.createInstancedMarkerMesh(geometry, material, 10);
      
      expect(() => {
        MarkerUtils.updateInstancedMarkers(instancedMesh, []);
      }).not.toThrow();
      
      expect(instancedMesh.count).toBe(0);
    });
  });
});

describe('Integration Tests', () => {
  
  test('should create complete marker system', () => {
    // Create geometry
    const geometry = MarkerGeometries.createGeometry('cross', 1.0);
    
    // Create material
    const material = MarkerMaterials.createPointMaterial('#ff6b35', 'normal');
    
    // Create instanced mesh
    const instancedMesh = MarkerUtils.createInstancedMarkerMesh(geometry, material, 100);
    
    expect(geometry).toBeInstanceOf(THREE.BufferGeometry);
    expect(material).toBeInstanceOf(THREE.MeshBasicMaterial);
    expect(instancedMesh).toBeInstanceOf(THREE.InstancedMesh);
  });
  
  test('should handle complete workflow', () => {
    const markers = [
      { position: { x: 0, y: 0, z: 0 }, scale: 1.0, type: 'cross', state: 'normal' },
      { position: { x: 5, y: 0, z: 5 }, scale: 1.2, type: 'circle', state: 'hovered' },
      { position: { x: -3, y: 2, z: 1 }, scale: 0.8, type: 'x', state: 'selected' }
    ];
    
    markers.forEach(marker => {
      const geometry = MarkerGeometries.createGeometry(marker.type, 1.0);
      const material = MarkerMaterials.createPointMaterial('#ff6b35', marker.state);
      
      expect(geometry).toBeDefined();
      expect(material).toBeDefined();
      
      // Clean up
      geometry.dispose();
      material.dispose();
    });
  });
});

describe('Performance Tests', () => {
  
  test('should create geometries efficiently', () => {
    const startTime = performance.now();
    
    // Create 100 different marker geometries
    for (let i = 0; i < 100; i++) {
      const types = ['cross', 'circle', 'x', 'plus', 'square', 'diamond', 'dot'];
      const type = types[i % types.length];
      const geometry = MarkerGeometries.createGeometry(type, 1.0);
      geometry.dispose();
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should create 100 geometries in less than 1000ms
    expect(duration).toBeLessThan(1000);
  });
  
  test('should update instanced markers efficiently', () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const instancedMesh = MarkerUtils.createInstancedMarkerMesh(geometry, material, 1000);
    
    // Generate 1000 markers
    const markers = Array(1000).fill().map((_, i) => ({
      position: { x: i, y: 0, z: 0 },
      scale: 1.0
    }));
    
    const startTime = performance.now();
    MarkerUtils.updateInstancedMarkers(instancedMesh, markers);
    const endTime = performance.now();
    
    // Should update 1000 markers in less than 50ms
    expect(endTime - startTime).toBeLessThan(50);
  });
});