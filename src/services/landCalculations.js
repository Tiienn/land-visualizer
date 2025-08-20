/**
 * Land calculation utilities and services
 */

// Comprehensive comparison objects with traditional and modern references
export const defaultComparisons = [
  // Modern Sports & Recreation
  {
    id: 'soccer-field',
    name: 'Soccer Field',
    area: 7140, // FIFA standard field: 105m × 68m
    type: 'composite',
    dimensions: { length: 105, width: 68 },
    color: 'green',
    icon: '⚽',
    category: 'Sports',
    context: 'Modern',
    description: 'FIFA regulation soccer field',
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
          name: 'penalty-box-right',
          type: 'box',
          size: [16.5, 0.02, 40.2],
          position: [44.25, 0.06, 0],
          material: { 
            color: '#ffffff', 
            opacity: 0.8,
            transparent: true
          }
        },
        {
          name: 'goal-area-left',
          type: 'box',
          size: [5.5, 0.02, 18.3],
          position: [-49.75, 0.07, 0],
          material: { 
            color: '#ffffff', 
            opacity: 0.9,
            transparent: true
          }
        },
        {
          name: 'goal-area-right',
          type: 'box',
          size: [5.5, 0.02, 18.3],
          position: [49.75, 0.07, 0],
          material: { 
            color: '#ffffff', 
            opacity: 0.9,
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
            },
            {
              type: 'cylinder',
              radius: 0.06,
              height: 2.44,
              position: [0, 1.22, 3.66],
              material: { color: '#ffffff', metalness: 0.8 }
            },
            {
              type: 'cylinder',
              radius: 0.06,
              height: 7.32,
              position: [0, 2.44, 0],
              rotation: [0, 0, Math.PI / 2],
              material: { color: '#ffffff', metalness: 0.8 }
            }
          ]
        },
        {
          name: 'goal-right',
          type: 'group',
          position: [52.5, 0, 0],
          children: [
            {
              type: 'cylinder',
              radius: 0.06,
              height: 2.44,
              position: [0, 1.22, -3.66],
              material: { color: '#ffffff', metalness: 0.8 }
            },
            {
              type: 'cylinder',
              radius: 0.06,
              height: 2.44,
              position: [0, 1.22, 3.66],
              material: { color: '#ffffff', metalness: 0.8 }
            },
            {
              type: 'cylinder',
              radius: 0.06,
              height: 7.32,
              position: [0, 2.44, 0],
              rotation: [0, 0, Math.PI / 2],
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
        far: { hideFeatures: ['goal-left', 'goal-right'] },
        medium: { hideFeatures: [] },
        near: { hideFeatures: [] }
      }
    }
  },
  {
    id: 'basketball-court',
    name: 'Basketball Court',
    area: 420, // NBA court: 28.65m × 15.24m
    type: 'composite',
    dimensions: { length: 28.65, width: 15.24 },
    color: 'orange',
    icon: '🏀',
    category: 'Sports',
    context: 'Modern',
    description: 'Professional basketball court',
    geometry3D: {
      base: {
        type: 'box',
        size: [28.65, 0.05, 15.24],
        position: [0, 0, 0],
        material: { 
          color: '#f97316', 
          roughness: 0.6,
          metalness: 0.1
        }
      },
      features: [
        {
          name: 'key-left',
          type: 'box',
          size: [5.79, 0.02, 4.88],
          position: [-11.43, 0.03, 0],
          material: { 
            color: '#ffffff', 
            opacity: 0.8,
            transparent: true
          }
        },
        {
          name: 'key-right',
          type: 'box',
          size: [5.79, 0.02, 4.88],
          position: [11.43, 0.03, 0],
          material: { 
            color: '#ffffff', 
            opacity: 0.8,
            transparent: true
          }
        },
        {
          name: 'center-circle',
          type: 'ring',
          innerRadius: 1.73,
          outerRadius: 1.93,
          position: [0, 0.04, 0],
          rotation: [-Math.PI / 2, 0, 0],
          material: { 
            color: '#ffffff',
            opacity: 0.9,
            transparent: true
          }
        },
        {
          name: 'three-point-arc-left',
          type: 'ring',
          innerRadius: 7.14,
          outerRadius: 7.34,
          position: [-13.75, 0.04, 0],
          rotation: [-Math.PI / 2, 0, 0],
          material: { 
            color: '#ffffff',
            opacity: 0.9,
            transparent: true
          }
        },
        {
          name: 'three-point-arc-right',
          type: 'ring',
          innerRadius: 7.14,
          outerRadius: 7.34,
          position: [13.75, 0.04, 0],
          rotation: [-Math.PI / 2, 0, 0],
          material: { 
            color: '#ffffff',
            opacity: 0.9,
            transparent: true
          }
        },
        {
          name: 'hoop-left',
          type: 'group',
          position: [-14.325, 0, 0],
          children: [
            {
              type: 'box',
              size: [1.83, 1.07, 0.05],
              position: [0, 3.05, 0],
              material: { color: '#ffffff', metalness: 0.2 }
            },
            {
              type: 'torus',
              innerRadius: 0.20,
              outerRadius: 0.23,
              position: [0, 3.05, 0.3],
              material: { color: '#ff6600', metalness: 0.8 }
            },
            {
              type: 'cylinder',
              radius: 0.05,
              height: 3.05,
              position: [0, 1.525, -0.6],
              material: { color: '#666666', metalness: 0.7 }
            }
          ]
        },
        {
          name: 'hoop-right',
          type: 'group',
          position: [14.325, 0, 0],
          children: [
            {
              type: 'box',
              size: [1.83, 1.07, 0.05],
              position: [0, 3.05, 0],
              material: { color: '#ffffff', metalness: 0.2 }
            },
            {
              type: 'torus',
              innerRadius: 0.20,
              outerRadius: 0.23,
              position: [0, 3.05, -0.3],
              material: { color: '#ff6600', metalness: 0.8 }
            },
            {
              type: 'cylinder',
              radius: 0.05,
              height: 3.05,
              position: [0, 1.525, 0.6],
              material: { color: '#666666', metalness: 0.7 }
            }
          ]
        }
      ]
    },
    renderSettings: {
      castShadow: true,
      receiveShadow: true,
      LOD: {
        far: { hideFeatures: ['hoop-left', 'hoop-right'] },
        medium: { hideFeatures: [] },
        near: { hideFeatures: [] }
      }
    }
  },
  {
    id: 'tennis-court',
    name: 'Tennis Court',
    area: 261, // Standard court: 23.77m × 10.97m
    type: 'composite',
    dimensions: { length: 23.77, width: 10.97 },
    color: 'red',
    icon: '🎾',
    category: 'Sports',
    context: 'Modern',
    description: 'Professional tennis court',
    geometry3D: {
      base: {
        type: 'box',
        size: [23.77, 0.05, 10.97],
        position: [0, 0, 0],
        material: { 
          color: '#dc2626', 
          roughness: 0.7,
          metalness: 0.1
        }
      },
      features: [
        {
          name: 'service-box-left-near',
          type: 'box',
          size: [6.4, 0.02, 4.115],
          position: [-5.95, 0.03, -3.427],
          material: { 
            color: '#ffffff', 
            opacity: 0.8,
            transparent: true
          }
        },
        {
          name: 'service-box-left-far',
          type: 'box',
          size: [6.4, 0.02, 4.115],
          position: [-5.95, 0.03, 3.427],
          material: { 
            color: '#ffffff', 
            opacity: 0.8,
            transparent: true
          }
        },
        {
          name: 'service-box-right-near',
          type: 'box',
          size: [6.4, 0.02, 4.115],
          position: [5.95, 0.03, -3.427],
          material: { 
            color: '#ffffff', 
            opacity: 0.8,
            transparent: true
          }
        },
        {
          name: 'service-box-right-far',
          type: 'box',
          size: [6.4, 0.02, 4.115],
          position: [5.95, 0.03, 3.427],
          material: { 
            color: '#ffffff', 
            opacity: 0.8,
            transparent: true
          }
        },
        {
          name: 'center-line',
          type: 'box',
          size: [0.05, 0.03, 23.77],
          position: [0, 0.03, 0],
          material: { 
            color: '#ffffff',
            opacity: 0.9,
            transparent: true
          }
        },
        {
          name: 'net',
          type: 'group',
          position: [0, 0, 0],
          children: [
            {
              type: 'box',
              size: [0.1, 0.91, 12.8],
              position: [0, 0.455, 0],
              material: { 
                color: '#ffffff',
                opacity: 0.7,
                transparent: true,
                wireframe: true
              }
            },
            {
              type: 'cylinder',
              radius: 0.05,
              height: 1.07,
              position: [0, 0.535, -6.4],
              material: { color: '#8b4513', metalness: 0.3 }
            },
            {
              type: 'cylinder',
              radius: 0.05,
              height: 1.07,
              position: [0, 0.535, 6.4],
              material: { color: '#8b4513', metalness: 0.3 }
            }
          ]
        },
        {
          name: 'baseline-near',
          type: 'box',
          size: [0.05, 0.03, 10.97],
          position: [-11.885, 0.03, 0],
          material: { 
            color: '#ffffff',
            opacity: 0.9,
            transparent: true
          }
        },
        {
          name: 'baseline-far',
          type: 'box',
          size: [0.05, 0.03, 10.97],
          position: [11.885, 0.03, 0],
          material: { 
            color: '#ffffff',
            opacity: 0.9,
            transparent: true
          }
        }
      ],
      castShadow: true,
      receiveShadow: true,
      LOD: {
        far: { hideFeatures: ['net'] },
        medium: { hideFeatures: [] },
        near: { hideFeatures: [] }
      }
    }
  },
  {
    id: 'boxing-ring',
    name: 'Boxing Ring',
    area: 37, // Professional ring: 6.1m × 6.1m
    type: 'composite',
    dimensions: { length: 6.1, width: 6.1 },
    color: 'red',
    icon: '🥊',
    category: 'Sports',
    context: 'Modern',
    description: 'Professional boxing ring',
    geometry3D: {
      base: {
        type: 'box',
        size: [6.1, 0.6, 6.1],
        position: [0, 0.3, 0],
        material: { 
          color: '#1f2937', 
          roughness: 0.8,
          metalness: 0.2
        }
      },
      features: [
        {
          name: 'canvas',
          type: 'box',
          size: [6.1, 0.05, 6.1],
          position: [0, 0.625, 0],
          material: { 
            color: '#ffffff', 
            roughness: 0.6,
            metalness: 0.1
          }
        },
        {
          name: 'corner-post-1',
          type: 'cylinder',
          radius: 0.08,
          height: 1.5,
          position: [-3.05, 1.35, -3.05],
          material: { 
            color: '#dc2626',
            metalness: 0.8,
            roughness: 0.2
          }
        },
        {
          name: 'corner-post-2',
          type: 'cylinder',
          radius: 0.08,
          height: 1.5,
          position: [3.05, 1.35, -3.05],
          material: { 
            color: '#dc2626',
            metalness: 0.8,
            roughness: 0.2
          }
        },
        {
          name: 'corner-post-3',
          type: 'cylinder',
          radius: 0.08,
          height: 1.5,
          position: [3.05, 1.35, 3.05],
          material: { 
            color: '#dc2626',
            metalness: 0.8,
            roughness: 0.2
          }
        },
        {
          name: 'corner-post-4',
          type: 'cylinder',
          radius: 0.08,
          height: 1.5,
          position: [-3.05, 1.35, 3.05],
          material: { 
            color: '#dc2626',
            metalness: 0.8,
            roughness: 0.2
          }
        },
        {
          name: 'top-rope-north',
          type: 'cylinder',
          radius: 0.02,
          height: 6.1,
          position: [0, 1.83, -3.05],
          rotation: [0, 0, Math.PI / 2],
          material: { 
            color: '#ffffff',
            metalness: 0.5,
            roughness: 0.3
          }
        },
        {
          name: 'top-rope-south',
          type: 'cylinder',
          radius: 0.02,
          height: 6.1,
          position: [0, 1.83, 3.05],
          rotation: [0, 0, Math.PI / 2],
          material: { 
            color: '#ffffff',
            metalness: 0.5,
            roughness: 0.3
          }
        },
        {
          name: 'top-rope-east',
          type: 'cylinder',
          radius: 0.02,
          height: 6.1,
          position: [3.05, 1.83, 0],
          rotation: [0, Math.PI / 2, 0],
          material: { 
            color: '#ffffff',
            metalness: 0.5,
            roughness: 0.3
          }
        },
        {
          name: 'top-rope-west',
          type: 'cylinder',
          radius: 0.02,
          height: 6.1,
          position: [-3.05, 1.83, 0],
          rotation: [0, Math.PI / 2, 0],
          material: { 
            color: '#ffffff',
            metalness: 0.5,
            roughness: 0.3
          }
        },
        {
          name: 'middle-rope-north',
          type: 'cylinder',
          radius: 0.02,
          height: 6.1,
          position: [0, 1.45, -3.05],
          rotation: [0, 0, Math.PI / 2],
          material: { 
            color: '#ffffff',
            metalness: 0.5,
            roughness: 0.3
          }
        },
        {
          name: 'middle-rope-south',
          type: 'cylinder',
          radius: 0.02,
          height: 6.1,
          position: [0, 1.45, 3.05],
          rotation: [0, 0, Math.PI / 2],
          material: { 
            color: '#ffffff',
            metalness: 0.5,
            roughness: 0.3
          }
        },
        {
          name: 'middle-rope-east',
          type: 'cylinder',
          radius: 0.02,
          height: 6.1,
          position: [3.05, 1.45, 0],
          rotation: [0, Math.PI / 2, 0],
          material: { 
            color: '#ffffff',
            metalness: 0.5,
            roughness: 0.3
          }
        },
        {
          name: 'middle-rope-west',
          type: 'cylinder',
          radius: 0.02,
          height: 6.1,
          position: [-3.05, 1.45, 0],
          rotation: [0, Math.PI / 2, 0],
          material: { 
            color: '#ffffff',
            metalness: 0.5,
            roughness: 0.3
          }
        },
        {
          name: 'bottom-rope-north',
          type: 'cylinder',
          radius: 0.02,
          height: 6.1,
          position: [0, 1.07, -3.05],
          rotation: [0, 0, Math.PI / 2],
          material: { 
            color: '#ffffff',
            metalness: 0.5,
            roughness: 0.3
          }
        },
        {
          name: 'bottom-rope-south',
          type: 'cylinder',
          radius: 0.02,
          height: 6.1,
          position: [0, 1.07, 3.05],
          rotation: [0, 0, Math.PI / 2],
          material: { 
            color: '#ffffff',
            metalness: 0.5,
            roughness: 0.3
          }
        },
        {
          name: 'bottom-rope-east',
          type: 'cylinder',
          radius: 0.02,
          height: 6.1,
          position: [3.05, 1.07, 0],
          rotation: [0, Math.PI / 2, 0],
          material: { 
            color: '#ffffff',
            metalness: 0.5,
            roughness: 0.3
          }
        },
        {
          name: 'bottom-rope-west',
          type: 'cylinder',
          radius: 0.02,
          height: 6.1,
          position: [-3.05, 1.07, 0],
          rotation: [0, Math.PI / 2, 0],
          material: { 
            color: '#ffffff',
            metalness: 0.5,
            roughness: 0.3
          }
        }
      ],
      castShadow: true,
      receiveShadow: true,
      LOD: {
        far: { hideFeatures: ['middle-rope-north', 'middle-rope-south', 'middle-rope-east', 'middle-rope-west', 'bottom-rope-north', 'bottom-rope-south', 'bottom-rope-east', 'bottom-rope-west'] },
        medium: { hideFeatures: ['bottom-rope-north', 'bottom-rope-south', 'bottom-rope-east', 'bottom-rope-west'] },
        near: { hideFeatures: [] }
      }
    }
  },

  // Traditional Buildings & Structures
  {
    id: 'traditional-farmhouse',
    name: 'Traditional Farmhouse',
    area: 150, // Typical 18th-19th century farmhouse
    type: 'rectangle',
    dimensions: { length: 15, width: 10 },
    color: 'brown',
    icon: '🏚️',
    category: 'Traditional Buildings',
    context: 'Traditional',
    description: 'Historic farmhouse footprint (~6 toises)',
    traditionalContext: 'Common in rural areas measured in perches'
  },
  {
    id: 'stone-barn',
    name: 'Stone Barn',
    area: 400, // Large traditional barn
    type: 'rectangle',
    dimensions: { length: 25, width: 16 },
    color: 'slate',
    icon: '🏭',
    category: 'Traditional Buildings',
    context: 'Traditional',
    description: 'Traditional stone barn (~16 perches)',
    traditionalContext: 'Essential farm building, ~105 toises'
  },
  {
    id: 'village-church',
    name: 'Village Church',
    area: 600, // Small parish church
    type: 'rectangle',
    dimensions: { length: 30, width: 20 },
    color: 'gray',
    icon: '⛪',
    category: 'Traditional Buildings',
    context: 'Traditional',
    description: 'Small parish church (~24 perches)',
    traditionalContext: 'Village centerpiece, ~158 toises'
  },
  {
    id: 'market-square',
    name: 'Village Market Square',
    area: 900, // Traditional market square
    type: 'rectangle',
    dimensions: { length: 30, width: 30 },
    color: 'amber',
    icon: '🏛️',
    category: 'Traditional Buildings',
    context: 'Traditional',
    description: 'Village market square (~36 perches)',
    traditionalContext: 'Community gathering space, ~237 toises'
  },
  {
    id: 'manor-courtyard',
    name: 'Manor House Courtyard',
    area: 1200, // Manor house with courtyard
    type: 'rectangle',
    dimensions: { length: 40, width: 30 },
    color: 'purple',
    icon: '🏰',
    category: 'Traditional Buildings',
    context: 'Traditional',
    description: 'Manor house compound (~47 perches)',
    traditionalContext: 'Noble residence, ~316 toises'
  },

  // Agricultural & Land Use
  {
    id: 'kitchen-garden',
    name: 'Kitchen Garden',
    area: 100, // Traditional home garden
    type: 'rectangle',
    dimensions: { length: 10, width: 10 },
    color: 'lime',
    icon: '🌱',
    category: 'Agriculture',
    context: 'Traditional',
    description: 'Traditional kitchen garden (~4 perches)',
    traditionalContext: 'Family vegetable garden, ~26 toises'
  },
  {
    id: 'vineyard-section',
    name: 'Vineyard Section',
    area: 2500, // Quarter hectare vineyard
    type: 'rectangle',
    dimensions: { length: 50, width: 50 },
    color: 'violet',
    icon: '🍇',
    category: 'Agriculture',
    context: 'Traditional',
    description: 'Traditional vineyard plot (~99 perches)',
    traditionalContext: 'Wine growing section, ~658 toises'
  },
  {
    id: 'wheat-field',
    name: 'Wheat Field',
    area: 5000, // Half hectare field
    type: 'rectangle',
    dimensions: { length: 100, width: 50 },
    color: 'yellow',
    icon: '🌾',
    category: 'Agriculture',
    context: 'Traditional',
    description: 'Traditional wheat field (~198 perches)',
    traditionalContext: 'Grain cultivation plot, ~1316 toises'
  },
  {
    id: 'pasture-paddock',
    name: 'Livestock Paddock',
    area: 3000, // Grazing paddock
    type: 'rectangle',
    dimensions: { length: 75, width: 40 },
    color: 'emerald',
    icon: '🐄',
    category: 'Agriculture',
    context: 'Traditional',
    description: 'Livestock grazing paddock (~119 perches)',
    traditionalContext: 'Animal pasture, ~790 toises'
  },

  // Artisan & Trade
  {
    id: 'blacksmith-workshop',
    name: 'Blacksmith Workshop',
    area: 80, // Traditional smithy
    type: 'rectangle',
    dimensions: { length: 10, width: 8 },
    color: 'slate',
    icon: '⚒️',
    category: 'Artisan',
    context: 'Traditional',
    description: 'Traditional smithy (~3 perches)',
    traditionalContext: 'Village craftsman workshop, ~21 toises'
  },
  {
    id: 'mill-compound',
    name: 'Windmill Compound',
    area: 300, // Mill with surrounding area
    type: 'rectangle',
    dimensions: { length: 20, width: 15 },
    color: 'cyan',
    icon: '🌾',
    category: 'Artisan',
    context: 'Traditional',
    description: 'Windmill and compound (~12 perches)',
    traditionalContext: 'Grain processing facility, ~79 toises'
  },

  // Modern References (for comparison)
  {
    id: 'parking-space',
    name: 'Parking Space',
    area: 12.5, // Standard: 5m × 2.5m
    type: 'rectangle',
    dimensions: { length: 5, width: 2.5 },
    color: 'gray',
    icon: '🚗',
    category: 'Modern',
    context: 'Modern',
    description: 'Standard parking space'
  },
  {
    id: 'modern-house',
    name: 'Modern House',
    area: 200, // Contemporary house footprint
    type: 'rectangle',
    dimensions: { length: 20, width: 10 },
    color: 'brown',
    icon: '🏠',
    category: 'Modern',
    context: 'Modern',
    description: 'Contemporary house footprint'
  },
  {
    id: 'average-house',
    name: 'Average House',
    area: 150, // Average house footprint
    type: 'rectangle',
    dimensions: { length: 15, width: 10 },
    color: 'brown',
    icon: '🏡',
    category: 'Modern',
    context: 'Modern',
    description: 'Average residential house footprint'
  },
  {
    id: 'eiffel-tower-base',
    name: 'Eiffel Tower Base',
    area: 15625, // 125m × 125m base
    type: 'rectangle',
    dimensions: { length: 125, width: 125 },
    color: 'amber',
    icon: '🗼',
    category: 'Monuments',
    context: 'Modern',
    description: 'Eiffel Tower base footprint'
  },
  {
    id: 'statue-of-liberty-base',
    name: 'Statue of Liberty Base',
    area: 2025, // 45m × 45m pedestal
    type: 'rectangle',
    dimensions: { length: 45, width: 45 },
    color: 'green',
    icon: '🗽',
    category: 'Monuments',
    context: 'Modern',
    description: 'Statue of Liberty pedestal area'
  },
  {
    id: 'christ-redeemer-base',
    name: 'Christ the Redeemer Base',
    area: 1600, // 40m × 40m platform
    type: 'rectangle',
    dimensions: { length: 40, width: 40 },
    color: 'white',
    icon: '⛪',
    category: 'Monuments',
    context: 'Modern',
    description: 'Christ the Redeemer platform'
  },
  {
    id: 'average-office',
    name: 'Average Office',
    area: 120, // Average office space
    type: 'rectangle',
    dimensions: { length: 12, width: 10 },
    color: 'gray',
    icon: '🏢',
    category: 'Modern',
    context: 'Modern',
    description: 'Average office space'
  },
  {
    id: 'mcdonalds-restaurant',
    name: 'McDonald\'s Restaurant',
    area: 300, // Typical McDonald's footprint
    type: 'rectangle',
    dimensions: { length: 20, width: 15 },
    color: 'yellow',
    icon: '🍟',
    category: 'Modern',
    context: 'Modern',
    description: 'Typical McDonald\'s restaurant'
  },
  {
    id: 'average-shop',
    name: 'Average Shop',
    area: 80, // Small retail shop
    type: 'rectangle',
    dimensions: { length: 10, width: 8 },
    color: 'orange',
    icon: '🏪',
    category: 'Modern',
    context: 'Modern',
    description: 'Small retail shop'
  },
  {
    id: 'supermarket',
    name: 'Supermarket',
    area: 2500, // Large supermarket
    type: 'rectangle',
    dimensions: { length: 50, width: 50 },
    color: 'blue',
    icon: '🛒',
    category: 'Modern',
    context: 'Modern',
    description: 'Large supermarket store'
  },
  {
    id: 'average-plane',
    name: 'Average Plane',
    area: 280, // Boeing 737 footprint: ~35m × 8m
    type: 'rectangle',
    dimensions: { length: 35, width: 8 },
    color: 'silver',
    icon: '✈️',
    category: 'Modern',
    context: 'Modern',
    description: 'Commercial aircraft footprint'
  },
  {
    id: 'single-parking-space',
    name: 'Single Parking Space',
    area: 15, // Larger standard: 5m × 3m
    type: 'rectangle',
    dimensions: { length: 5, width: 3 },
    color: 'gray',
    icon: '🅿️',
    category: 'Modern',
    context: 'Modern',
    description: 'Standard single parking space'
  },

  // Kitchen & Room Spaces
  {
    id: 'kitchen',
    name: 'Kitchen',
    area: 20, // Average kitchen: 4m × 5m
    type: 'rectangle',
    dimensions: { length: 5, width: 4 },
    color: 'amber',
    icon: '🍳',
    category: 'Room',
    context: 'Modern',
    description: 'Average kitchen space'
  },
  {
    id: 'living-room',
    name: 'Living Room',
    area: 35, // Average living room: 7m × 5m
    type: 'rectangle',
    dimensions: { length: 7, width: 5 },
    color: 'brown',
    icon: '🛋️',
    category: 'Room',
    context: 'Modern',
    description: 'Average living room space'
  },
  {
    id: 'master-bedroom',
    name: 'Master Bedroom',
    area: 25, // Master bedroom: 5m × 5m
    type: 'rectangle',
    dimensions: { length: 5, width: 5 },
    color: 'purple',
    icon: '🛏️',
    category: 'Room',
    context: 'Modern',
    description: 'Master bedroom space'
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    area: 18, // Regular bedroom: 4.5m × 4m
    type: 'rectangle',
    dimensions: { length: 4.5, width: 4 },
    color: 'blue',
    icon: '🛏️',
    category: 'Room',
    context: 'Modern',
    description: 'Standard bedroom space'
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    area: 8, // Average bathroom: 2.5m × 3.2m
    type: 'rectangle',
    dimensions: { length: 3.2, width: 2.5 },
    color: 'cyan',
    icon: '🚿',
    category: 'Room',
    context: 'Modern',
    description: 'Average bathroom space'
  },
  {
    id: 'dining-room',
    name: 'Dining Room',
    area: 28, // Dining room: 7m × 4m
    type: 'rectangle',
    dimensions: { length: 7, width: 4 },
    color: 'red',
    icon: '🍽️',
    category: 'Room',
    context: 'Modern',
    description: 'Dining room space'
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

/**
 * Traditional units that should prioritize traditional context objects
 */
export const TRADITIONAL_UNITS = ['perche', 'toise', 'arpent'];

/**
 * Get appropriate comparison objects based on context and area range
 */
export const getContextualComparisons = (totalAreaSqM, inputUnit = 'm²', maxResults = 35) => {
  const isTraditionalUnit = TRADITIONAL_UNITS.includes(inputUnit);
  
  // Filter objects based on context preference
  let availableObjects = isTraditionalUnit 
    ? defaultComparisons.filter(obj => obj.context === 'Traditional').concat(
        defaultComparisons.filter(obj => obj.context === 'Modern')
      )
    : defaultComparisons.filter(obj => obj.context === 'Modern').concat(
        defaultComparisons.filter(obj => obj.context === 'Traditional')
      );
  
  // Group objects by category for balanced representation
  const objectsByCategory = availableObjects.reduce((groups, obj) => {
    if (!groups[obj.category]) groups[obj.category] = [];
    groups[obj.category].push(obj);
    return groups;
  }, {});
  
  // Sort objects within each category by relevance
  Object.keys(objectsByCategory).forEach(category => {
    objectsByCategory[category].sort((a, b) => {
      const aFit = totalAreaSqM / a.area;
      const bFit = totalAreaSqM / b.area;
      
      // Enhanced scoring: include very small and very large objects for diversity
      const aScore = aFit >= 0.5 && aFit <= 2 ? Math.abs(Math.log10(aFit)) * 0.5 :
                     aFit >= 0.1 && aFit <= 10 ? Math.abs(Math.log10(aFit)) :
                     aFit >= 0.01 && aFit <= 100 ? Math.abs(Math.log10(aFit)) * 1.5 :
                     aFit < 0.01 ? 10 + (0.01 - aFit) : 10 + (aFit - 100) / 100;
      const bScore = bFit >= 0.5 && bFit <= 2 ? Math.abs(Math.log10(bFit)) * 0.5 :
                     bFit >= 0.1 && bFit <= 10 ? Math.abs(Math.log10(bFit)) :
                     bFit >= 0.01 && bFit <= 100 ? Math.abs(Math.log10(bFit)) * 1.5 :
                     bFit < 0.01 ? 10 + (0.01 - bFit) : 10 + (aFit - 100) / 100;
      
      return aScore - bScore;
    });
  });
  
  // Ensure good representation from each category with minimums
  const categoryMinimums = {
    'Sports': 4,           // All sports objects
    'Room': 6,             // All room objects for scale reference
    'Modern': 7,           // Keep current modern objects
    'Traditional Buildings': 5, // Keep current traditional buildings
    'Agriculture': 4,      // Keep current agriculture
    'Monuments': 3,        // Keep current monuments 
    'Artisan': 2           // Keep current artisan objects
  };
  
  let finalObjects = [];
  
  // First, include minimum objects from each category
  Object.keys(categoryMinimums).forEach(category => {
    if (objectsByCategory[category]) {
      const minCount = Math.min(categoryMinimums[category], objectsByCategory[category].length);
      finalObjects.push(...objectsByCategory[category].slice(0, minCount));
    }
  });
  
  // Fill remaining slots with best-fitting objects from any category
  const usedObjects = new Set(finalObjects.map(obj => obj.id));
  const remainingObjects = availableObjects
    .filter(obj => !usedObjects.has(obj.id))
    .sort((a, b) => {
      const aFit = totalAreaSqM / a.area;
      const bFit = totalAreaSqM / b.area;
      const aScore = Math.abs(Math.log10(aFit));
      const bScore = Math.abs(Math.log10(bFit));
      return aScore - bScore;
    });
  
  const remainingSlots = maxResults - finalObjects.length;
  if (remainingSlots > 0) {
    finalObjects.push(...remainingObjects.slice(0, remainingSlots));
  }
  
  return finalObjects;
};

/**
 * Get objects by category
 */
export const getComparisonsByCategory = (category) => {
  return defaultComparisons.filter(obj => obj.category === category);
};

/**
 * Get traditional unit education context
 */
export const getTraditionalUnitInfo = (unit) => {
  const unitInfo = {
    'perche': {
      name: 'Perche',
      description: 'A traditional French unit of area, approximately 25.3 square meters',
      historicalContext: 'Used in medieval France for land measurement, varying by region',
      modernEquivalent: '~25.3 m² or ~272 ft²'
    },
    'toise': {
      name: 'Toise',
      description: 'An ancient French unit of area, approximately 3.8 square meters', 
      historicalContext: 'Originally based on the span of outstretched arms, used until 1795',
      modernEquivalent: '~3.8 m² or ~41 ft²'
    },
    'arpent': {
      name: 'Arpent',
      description: 'A traditional French unit of area, approximately 3,419 square meters',
      historicalContext: 'Used in medieval France and French colonies, roughly 1 hectare',
      modernEquivalent: '~3,419 m² or ~0.84 acres'
    }
  };
  
  return unitInfo[unit] || null;
};

/**
 * Calculate quantity display for comparison objects
 */
export const calculateComparisonQuantity = (totalArea, objectArea) => {
  const quantity = totalArea / objectArea;
  
  if (quantity < 0.1) {
    return {
      type: 'fraction',
      text: `${(quantity * 100).toFixed(0)}% of`,
      quantity: quantity
    };
  } else if (quantity < 1) {
    return {
      type: 'fraction',
      text: `${(quantity).toFixed(1)} of`,
      quantity: quantity
    };
  } else if (quantity < 10) {
    return {
      type: 'multiple',
      text: `${quantity.toFixed(1)} ×`,
      quantity: quantity
    };
  } else {
    return {
      type: 'multiple',
      text: `${Math.round(quantity)} ×`,
      quantity: Math.round(quantity)
    };
  }
};