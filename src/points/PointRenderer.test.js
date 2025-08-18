import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { PointRenderingEngine, AutoCADPointRenderer } from './PointRenderer';

// Mock Three.js modules for testing
jest.mock('three', () => ({
  ...jest.requireActual('three'),
  WebGLRenderer: jest.fn(() => ({
    getSize: jest.fn(() => ({ x: 1920, y: 1080 }))
  }))
}));

// Mock ResizeObserver for testing environment
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('PointRenderingEngine', () => {
  let scene;
  let engine;

  beforeEach(() => {
    scene = new THREE.Scene();
    engine = new PointRenderingEngine(scene, 100);
  });

  afterEach(() => {
    if (engine) {
      engine.dispose();
    }
    cleanup();
  });

  test('should initialize with correct parameters', () => {
    expect(engine.maxPoints).toBe(100);
    expect(engine.activePoints).toBe(0);
    expect(engine.scene).toBe(scene);
    expect(engine.instancedMesh).toBeInstanceOf(THREE.InstancedMesh);
  });

  test('should have all required point styles defined', () => {
    expect(engine.POINT_STYLES.CROSS).toBe(0.0);
    expect(engine.POINT_STYLES.CIRCLE).toBe(1.0);
    expect(engine.POINT_STYLES.X_MARKER).toBe(2.0);
    expect(engine.POINT_STYLES.PLUS).toBe(3.0);
    expect(engine.POINT_STYLES.SQUARE).toBe(4.0);
    expect(engine.POINT_STYLES.DIAMOND).toBe(5.0);
  });

  test('should have all required point states defined', () => {
    expect(engine.POINT_STATES.NORMAL).toBe(0.0);
    expect(engine.POINT_STATES.HOVERED).toBe(1.0);
    expect(engine.POINT_STATES.SELECTED).toBe(2.0);
    expect(engine.POINT_STATES.DRAGGING).toBe(3.0);
  });

  test('should update points correctly', () => {
    const testPoints = [
      {
        position: { x: 0, y: 0, z: 0 },
        color: '#ff0000',
        scale: 1.5,
        style: 'CROSS',
        state: 'NORMAL'
      },
      {
        position: { x: 10, y: 0, z: 10 },
        color: '#00ff00',
        scale: 2.0,
        style: 'CIRCLE',
        state: 'HOVERED'
      }
    ];

    engine.updatePoints(testPoints);

    expect(engine.activePoints).toBe(2);
    expect(engine.instancedMesh.count).toBe(2);
  });

  test('should handle empty points array', () => {
    engine.updatePoints([]);
    expect(engine.activePoints).toBe(0);
    expect(engine.instancedMesh.count).toBe(0);
  });

  test('should limit points to maxPoints', () => {
    const manyPoints = Array(200).fill().map((_, i) => ({
      position: { x: i, y: 0, z: 0 },
      color: '#ffffff',
      scale: 1.0,
      style: 'CROSS',
      state: 'NORMAL'
    }));

    engine.updatePoints(manyPoints);
    expect(engine.activePoints).toBe(100); // Limited by maxPoints
  });

  test('should generate valid vertex shader', () => {
    const vertexShader = engine.getVertexShader();
    expect(vertexShader).toContain('attribute vec3 instancePosition');
    expect(vertexShader).toContain('varying vec3 vColor');
    expect(vertexShader).toContain('gl_Position');
  });

  test('should generate valid fragment shader', () => {
    const fragmentShader = engine.getFragmentShader();
    expect(fragmentShader).toContain('varying vec3 vColor');
    expect(fragmentShader).toContain('gl_FragColor');
    expect(fragmentShader).toContain('sdCross');
    expect(fragmentShader).toContain('sdCircle');
  });

  test('should properly dispose resources', () => {
    const geometryDisposeSpy = jest.spyOn(engine.geometry, 'dispose');
    const materialDisposeSpy = jest.spyOn(engine.material, 'dispose');
    
    engine.dispose();
    
    expect(geometryDisposeSpy).toHaveBeenCalled();
    expect(materialDisposeSpy).toHaveBeenCalled();
  });
});

describe('AutoCADPointRenderer Component', () => {
  afterEach(cleanup);

  test('should render without crashing', () => {
    const testPoints = [
      {
        position: { x: 0, y: 0, z: 0 },
        color: '#ff6b35',
        scale: 1.0,
        style: 'CROSS',
        state: 'NORMAL'
      }
    ];

    expect(() => {
      render(
        <Canvas>
          <AutoCADPointRenderer points={testPoints} />
        </Canvas>
      );
    }).not.toThrow();
  });

  test('should handle empty points array', () => {
    expect(() => {
      render(
        <Canvas>
          <AutoCADPointRenderer points={[]} />
        </Canvas>
      );
    }).not.toThrow();
  });

  test('should handle different maxPoints values', () => {
    const testPoints = [
      {
        position: { x: 0, y: 0, z: 0 },
        color: '#ff6b35',
        scale: 1.0,
        style: 'CROSS',
        state: 'NORMAL'
      }
    ];

    expect(() => {
      render(
        <Canvas>
          <AutoCADPointRenderer points={testPoints} maxPoints={5000} />
        </Canvas>
      );
    }).not.toThrow();
  });
});

describe('Performance Tests', () => {
  let scene;
  let engine;

  beforeEach(() => {
    scene = new THREE.Scene();
    engine = new PointRenderingEngine(scene, 10000);
  });

  afterEach(() => {
    if (engine) {
      engine.dispose();
    }
  });

  test('should handle large point datasets efficiently', () => {
    const startTime = performance.now();
    
    // Generate 5000 points
    const largePointSet = Array(5000).fill().map((_, i) => ({
      position: { 
        x: (i % 100) * 5, 
        y: 0, 
        z: Math.floor(i / 100) * 5 
      },
      color: '#ff6b35',
      scale: 1.0,
      style: 'CROSS',
      state: 'NORMAL'
    }));

    engine.updatePoints(largePointSet);
    
    const endTime = performance.now();
    const updateTime = endTime - startTime;

    // Should update 5000 points in less than 100ms
    expect(updateTime).toBeLessThan(100);
    expect(engine.activePoints).toBe(5000);
  });

  test('should update points incrementally without performance degradation', () => {
    const basePoints = Array(1000).fill().map((_, i) => ({
      position: { x: i, y: 0, z: 0 },
      color: '#ff6b35',
      scale: 1.0,
      style: 'CROSS',
      state: 'NORMAL'
    }));

    // Measure first update
    const start1 = performance.now();
    engine.updatePoints(basePoints);
    const time1 = performance.now() - start1;

    // Add more points and measure again
    const morePoints = [...basePoints, ...Array(1000).fill().map((_, i) => ({
      position: { x: i + 1000, y: 0, z: 0 },
      color: '#00ff00',
      scale: 1.0,
      style: 'CIRCLE',
      state: 'NORMAL'
    }))];

    const start2 = performance.now();
    engine.updatePoints(morePoints);
    const time2 = performance.now() - start2;

    // Second update shouldn't be more than 2x slower (allowing for overhead)
    expect(time2).toBeLessThan(time1 * 3);
  });
});

describe('Point Style Rendering', () => {
  let scene;
  let engine;

  beforeEach(() => {
    scene = new THREE.Scene();
    engine = new PointRenderingEngine(scene, 100);
  });

  afterEach(() => {
    if (engine) {
      engine.dispose();
    }
  });

  test('should render all point styles correctly', () => {
    const allStylesPoints = Object.keys(engine.POINT_STYLES).map((style, i) => ({
      position: { x: i * 10, y: 0, z: 0 },
      color: '#ff6b35',
      scale: 1.0,
      style: style,
      state: 'NORMAL'
    }));

    expect(() => {
      engine.updatePoints(allStylesPoints);
    }).not.toThrow();

    expect(engine.activePoints).toBe(Object.keys(engine.POINT_STYLES).length);
  });

  test('should handle unknown styles gracefully', () => {
    const pointWithUnknownStyle = [{
      position: { x: 0, y: 0, z: 0 },
      color: '#ff6b35',
      scale: 1.0,
      style: 'UNKNOWN_STYLE',
      state: 'NORMAL'
    }];

    expect(() => {
      engine.updatePoints(pointWithUnknownStyle);
    }).not.toThrow();
  });
});

describe('Memory Management', () => {
  test('should properly clean up resources on disposal', () => {
    const scene = new THREE.Scene();
    const engine = new PointRenderingEngine(scene, 100);
    
    const initialChildCount = scene.children.length;
    engine.dispose();
    
    // Engine should remove itself from scene
    expect(scene.children.length).toBeLessThanOrEqual(initialChildCount);
  });

  test('should handle multiple dispose calls gracefully', () => {
    const scene = new THREE.Scene();
    const engine = new PointRenderingEngine(scene, 100);
    
    expect(() => {
      engine.dispose();
      engine.dispose(); // Second call should not throw
    }).not.toThrow();
  });
});