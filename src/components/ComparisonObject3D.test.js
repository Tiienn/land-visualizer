/**
 * Tests for ComparisonObject3D component
 */

import React from 'react';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import ComparisonObject3D from './ComparisonObject3D';

// Mock object data for testing
const mockSoccerField = {
  id: 'soccer-field',
  name: 'Soccer Field',
  geometry3D: {
    base: {
      type: 'box',
      size: [105, 0.1, 68],
      position: [0, 0, 0],
      material: { 
        color: '#22c55e', 
        roughness: 0.8,
        metalness: 0.1
      }
    },
    features: [
      {
        name: 'penalty-box-left',
        type: 'box',
        size: [16.5, 0.02, 40.2],
        position: [-44.25, 0.06, 0],
        material: { 
          color: '#ffffff', 
          opacity: 0.8,
          transparent: true
        }
      },
      {
        name: 'center-circle',
        type: 'ring',
        innerRadius: 9.0,
        outerRadius: 9.3,
        position: [0, 0.08, 0],
        rotation: [-Math.PI / 2, 0, 0],
        material: { 
          color: '#ffffff',
          opacity: 0.9,
          transparent: true
        }
      },
      {
        name: 'goal-left',
        type: 'group',
        position: [-52.5, 0, 0],
        children: [
          {
            type: 'cylinder',
            radius: 0.06,
            height: 2.44,
            position: [0, 1.22, -3.66],
            material: { color: '#ffffff', metalness: 0.8 }
          }
        ]
      }
    ]
  },
  renderSettings: {
    castShadow: true,
    receiveShadow: true,
    LOD: {
      far: { hideFeatures: ['goal-left'] },
      medium: { hideFeatures: [] },
      near: { hideFeatures: [] }
    }
  }
};

const TestCanvas = ({ children }) => (
  <Canvas>
    <ambientLight intensity={0.5} />
    {children}
  </Canvas>
);

describe('ComparisonObject3D', () => {
  test('should render without crashing', () => {
    render(
      <TestCanvas>
        <ComparisonObject3D objectData={mockSoccerField} />
      </TestCanvas>
    );
  });

  test('should render with custom position and scale', () => {
    render(
      <TestCanvas>
        <ComparisonObject3D 
          objectData={mockSoccerField} 
          position={[10, 0, 10]}
          scale={0.5}
        />
      </TestCanvas>
    );
  });

  test('should not render when visible is false', () => {
    render(
      <TestCanvas>
        <ComparisonObject3D 
          objectData={mockSoccerField} 
          visible={false}
        />
      </TestCanvas>
    );
  });

  test('should handle object data without geometry3D', () => {
    const invalidObject = { id: 'test', name: 'Test' };
    
    render(
      <TestCanvas>
        <ComparisonObject3D objectData={invalidObject} />
      </TestCanvas>
    );
  });

  test('should handle empty features array', () => {
    const objectWithoutFeatures = {
      ...mockSoccerField,
      geometry3D: {
        base: mockSoccerField.geometry3D.base,
        features: []
      }
    };
    
    render(
      <TestCanvas>
        <ComparisonObject3D objectData={objectWithoutFeatures} />
      </TestCanvas>
    );
  });
});

describe('ComparisonObject3D geometry types', () => {
  test('should handle box geometry', () => {
    const boxObject = {
      geometry3D: {
        base: {
          type: 'box',
          size: [10, 1, 10],
          material: { color: '#ff0000' }
        },
        features: []
      },
      renderSettings: { castShadow: true }
    };
    
    render(
      <TestCanvas>
        <ComparisonObject3D objectData={boxObject} />
      </TestCanvas>
    );
  });

  test('should handle cylinder geometry', () => {
    const cylinderObject = {
      geometry3D: {
        base: {
          type: 'cylinder',
          radius: 1,
          height: 5,
          material: { color: '#00ff00' }
        },
        features: []
      },
      renderSettings: { castShadow: true }
    };
    
    render(
      <TestCanvas>
        <ComparisonObject3D objectData={cylinderObject} />
      </TestCanvas>
    );
  });

  test('should handle ring geometry', () => {
    const ringObject = {
      geometry3D: {
        base: {
          type: 'ring',
          innerRadius: 1,
          outerRadius: 2,
          material: { color: '#0000ff' }
        },
        features: []
      },
      renderSettings: { castShadow: true }
    };
    
    render(
      <TestCanvas>
        <ComparisonObject3D objectData={ringObject} />
      </TestCanvas>
    );
  });

  test('should handle torus geometry', () => {
    const torusObject = {
      geometry3D: {
        base: {
          type: 'torus',
          innerRadius: 1,
          outerRadius: 0.3,
          material: { color: '#ffff00' }
        },
        features: []
      },
      renderSettings: { castShadow: true }
    };
    
    render(
      <TestCanvas>
        <ComparisonObject3D objectData={torusObject} />
      </TestCanvas>
    );
  });

  test('should handle group geometry', () => {
    const groupObject = {
      geometry3D: {
        base: {
          type: 'group',
          children: [
            {
              type: 'box',
              size: [1, 1, 1],
              position: [0, 0, 0],
              material: { color: '#ff00ff' }
            },
            {
              type: 'cylinder',
              radius: 0.5,
              height: 2,
              position: [2, 0, 0],
              material: { color: '#00ffff' }
            }
          ],
          material: { color: '#ffffff' }
        },
        features: []
      },
      renderSettings: { castShadow: true }
    };
    
    render(
      <TestCanvas>
        <ComparisonObject3D objectData={groupObject} />
      </TestCanvas>
    );
  });

  test('should handle unknown geometry type gracefully', () => {
    const unknownObject = {
      geometry3D: {
        base: {
          type: 'unknown',
          material: { color: '#888888' }
        },
        features: []
      },
      renderSettings: { castShadow: true }
    };
    
    // Should not crash, but will log warning
    render(
      <TestCanvas>
        <ComparisonObject3D objectData={unknownObject} />
      </TestCanvas>
    );
  });
});