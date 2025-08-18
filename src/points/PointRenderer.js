import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * High-performance GPU-instanced point renderer for AutoCAD-style markers
 * Supports 10,000+ points with adaptive sizing and professional styling
 */
export class PointRenderingEngine {
  constructor(scene, maxPoints = 10000) {
    this.scene = scene;
    this.maxPoints = maxPoints;
    this.activePoints = 0;
    
    // Create instanced mesh for maximum performance
    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        globalScale: { value: 1.0 },
        screenHeight: { value: 1080 }
      },
      vertexShader: this.getVertexShader(),
      fragmentShader: this.getFragmentShader(),
      transparent: true,
      depthTest: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    
    this.instancedMesh = new THREE.InstancedMesh(
      this.geometry,
      this.material,
      maxPoints
    );
    
    // GPU attribute buffers for efficient updates
    this.positionAttribute = new THREE.InstancedBufferAttribute(
      new Float32Array(maxPoints * 3), 3
    );
    this.colorAttribute = new THREE.InstancedBufferAttribute(
      new Float32Array(maxPoints * 3), 3
    );
    this.scaleAttribute = new THREE.InstancedBufferAttribute(
      new Float32Array(maxPoints), 1
    );
    this.styleAttribute = new THREE.InstancedBufferAttribute(
      new Float32Array(maxPoints), 1
    );
    this.stateAttribute = new THREE.InstancedBufferAttribute(
      new Float32Array(maxPoints), 1
    );
    
    // Add attributes to geometry
    this.instancedMesh.geometry.setAttribute('instancePosition', this.positionAttribute);
    this.instancedMesh.geometry.setAttribute('instanceColor', this.colorAttribute);
    this.instancedMesh.geometry.setAttribute('instanceScale', this.scaleAttribute);
    this.instancedMesh.geometry.setAttribute('instanceStyle', this.styleAttribute);
    this.instancedMesh.geometry.setAttribute('instanceState', this.stateAttribute);
    
    // Add to scene
    this.scene.add(this.instancedMesh);
    
    // Point style constants
    this.POINT_STYLES = {
      CROSS: 0.0,      // + shape
      CIRCLE: 1.0,     // ○ shape
      X_MARKER: 2.0,   // × shape
      PLUS: 3.0,       // + shape (thicker)
      SQUARE: 4.0,     // □ shape
      DIAMOND: 5.0     // ◊ shape
    };
    
    this.POINT_STATES = {
      NORMAL: 0.0,
      HOVERED: 1.0,
      SELECTED: 2.0,
      DRAGGING: 3.0
    };
  }
  
  /**
   * GPU shader for rendering multiple point styles efficiently
   */
  getVertexShader() {
    return `
      attribute vec3 instancePosition;
      attribute vec3 instanceColor;
      attribute float instanceScale;
      attribute float instanceStyle;
      attribute float instanceState;
      
      varying vec3 vColor;
      varying float vStyle;
      varying float vState;
      varying vec2 vUv;
      
      uniform float globalScale;
      uniform float screenHeight;
      
      void main() {
        vColor = instanceColor;
        vStyle = instanceStyle;
        vState = instanceState;
        vUv = uv;
        
        // Calculate screen-space size for adaptive sizing
        vec4 worldPosition = modelMatrix * vec4(instancePosition, 1.0);
        vec4 viewPosition = viewMatrix * worldPosition;
        
        // Screen-space scaling: maintain consistent pixel size
        float distance = length(viewPosition.xyz);
        float screenScale = instanceScale * globalScale / (distance * 0.1 + 1.0);
        
        // Clamp scale to reasonable limits
        screenScale = clamp(screenScale, 0.5, 4.0);
        
        // State-based size adjustments
        if (vState == 1.0) screenScale *= 1.2; // Hovered
        if (vState == 2.0) screenScale *= 1.3; // Selected
        if (vState == 3.0) screenScale *= 1.4; // Dragging
        
        // Apply position and scale
        vec3 scaledPosition = position * screenScale;
        gl_Position = projectionMatrix * (viewPosition + vec4(scaledPosition, 0.0));
      }
    `;
  }
  
  /**
   * Fragment shader for rendering different point styles
   */
  getFragmentShader() {
    return `
      varying vec3 vColor;
      varying float vStyle;
      varying float vState;
      varying vec2 vUv;
      
      // SDF functions for different point styles
      float sdCross(vec2 p, float size) {
        p = abs(p);
        float h = min(step(size * 0.7, p.x) + step(size * 0.2, p.y), 1.0) *
                  min(step(size * 0.2, p.x) + step(size * 0.7, p.y), 1.0);
        return 1.0 - h;
      }
      
      float sdCircle(vec2 p, float radius) {
        float d = length(p) - radius;
        float ring = smoothstep(radius - 0.1, radius - 0.05, length(p)) * 
                     smoothstep(radius + 0.05, radius + 0.1, length(p));
        return ring;
      }
      
      float sdX(vec2 p, float size) {
        mat2 rot = mat2(cos(0.785398), sin(0.785398), -sin(0.785398), cos(0.785398));
        p = rot * p;
        return sdCross(p, size);
      }
      
      float sdSquare(vec2 p, float size) {
        vec2 d = abs(p) - size;
        float outside = length(max(d, 0.0));
        float inside = min(max(d.x, d.y), 0.0);
        float ring = smoothstep(size - 0.05, size, max(abs(p.x), abs(p.y))) *
                     smoothstep(size + 0.05, size, max(abs(p.x), abs(p.y)));
        return ring;
      }
      
      float sdDiamond(vec2 p, float size) {
        p = abs(p);
        float d = (p.x + p.y - size);
        return 1.0 - smoothstep(-0.02, 0.02, d);
      }
      
      void main() {
        vec2 centeredUv = (vUv - 0.5) * 2.0;
        float alpha = 0.0;
        
        // Select point style
        if (vStyle < 0.5) {
          // CROSS
          alpha = sdCross(centeredUv, 0.6);
        } else if (vStyle < 1.5) {
          // CIRCLE
          alpha = sdCircle(centeredUv, 0.5);
        } else if (vStyle < 2.5) {
          // X_MARKER
          alpha = sdX(centeredUv, 0.6);
        } else if (vStyle < 3.5) {
          // PLUS (thicker cross)
          alpha = sdCross(centeredUv, 0.7);
        } else if (vStyle < 4.5) {
          // SQUARE
          alpha = sdSquare(centeredUv, 0.5);
        } else {
          // DIAMOND
          alpha = sdDiamond(centeredUv, 0.6);
        }
        
        if (alpha < 0.1) discard;
        
        // State-based color modifications
        vec3 finalColor = vColor;
        if (vState == 1.0) {
          // Hovered: brighter
          finalColor = mix(vColor, vec3(1.0, 1.0, 1.0), 0.3);
        } else if (vState == 2.0) {
          // Selected: add yellow tint
          finalColor = mix(vColor, vec3(1.0, 1.0, 0.0), 0.4);
        } else if (vState == 3.0) {
          // Dragging: red tint
          finalColor = mix(vColor, vec3(1.0, 0.0, 0.0), 0.5);
        }
        
        gl_FragColor = vec4(finalColor, alpha * 0.9);
      }
    `;
  }
  
  /**
   * Update point data efficiently
   */
  updatePoints(points) {
    this.activePoints = Math.min(points.length, this.maxPoints);
    
    for (let i = 0; i < this.activePoints; i++) {
      const point = points[i];
      
      // Position
      this.positionAttribute.setXYZ(i, point.position.x, point.position.y, point.position.z);
      
      // Color
      const color = point.color || '#ff6b35';
      const threeColor = new THREE.Color(color);
      this.colorAttribute.setXYZ(i, threeColor.r, threeColor.g, threeColor.b);
      
      // Scale
      this.scaleAttribute.setX(i, point.scale || 1.0);
      
      // Style
      this.styleAttribute.setX(i, this.POINT_STYLES[point.style] || this.POINT_STYLES.CROSS);
      
      // State
      this.stateAttribute.setX(i, this.POINT_STATES[point.state] || this.POINT_STATES.NORMAL);
    }
    
    // Update instance count
    this.instancedMesh.count = this.activePoints;
    
    // Mark attributes for GPU update
    this.positionAttribute.needsUpdate = true;
    this.colorAttribute.needsUpdate = true;
    this.scaleAttribute.needsUpdate = true;
    this.styleAttribute.needsUpdate = true;
    this.stateAttribute.needsUpdate = true;
  }
  
  /**
   * Update global rendering parameters
   */
  updateGlobalParams(camera, renderer) {
    this.material.uniforms.globalScale.value = 1.0;
    this.material.uniforms.screenHeight.value = renderer.getSize(new THREE.Vector2()).y;
  }
  
  /**
   * Get raycaster intersections with visible points
   */
  getIntersections(raycaster) {
    if (!this.instancedMesh || this.activePoints === 0) {
      return [];
    }
    
    const intersections = [];
    const boundingSphere = new THREE.Sphere();
    
    for (let i = 0; i < this.activePoints; i++) {
      // Get instance position from the buffer attribute
      const x = this.positionAttribute.getX(i);
      const y = this.positionAttribute.getY(i);
      const z = this.positionAttribute.getZ(i);
      const position = new THREE.Vector3(x, y, z);
      
      // Create bounding sphere for point
      boundingSphere.center.copy(position);
      boundingSphere.radius = 2.0; // Reasonable interaction radius
      
      // Check if ray intersects with point's bounding sphere
      if (raycaster.ray.intersectsSphere(boundingSphere)) {
        const distance = raycaster.ray.distanceToPoint(position);
        
        intersections.push({
          distance,
          point: position.clone(),
          index: i,
          instanceId: i,
          userData: this.pointUserData ? this.pointUserData[i] : {}
        });
      }
    }
    
    // Sort by distance (closest first)
    intersections.sort((a, b) => a.distance - b.distance);
    
    return intersections;
  }
  
  /**
   * Store user data for points (for interactive functionality)
   */
  setPointUserData(index, userData) {
    if (!this.pointUserData) {
      this.pointUserData = {};
    }
    this.pointUserData[index] = userData;
  }
  
  /**
   * Clear all stored user data
   */
  clearUserData() {
    this.pointUserData = {};
  }

  /**
   * Clear all points from the renderer
   */
  clearPoints() {
    this.activePoints = 0;
    if (this.instancedMesh) {
      this.instancedMesh.count = 0;
    }
    this.clearUserData();
  }

  /**
   * Cleanup resources
   */
  dispose() {
    if (this.instancedMesh && this.scene) {
      this.scene.remove(this.instancedMesh);
    }
    
    if (this.geometry) {
      this.geometry.dispose();
    }
    
    if (this.material) {
      this.material.dispose();
    }
    
    // BufferAttribute objects don't need explicit disposal
    // They are automatically cleaned up by Three.js
    this.positionAttribute = null;
    this.colorAttribute = null;
    this.scaleAttribute = null;
    this.styleAttribute = null;
    this.stateAttribute = null;
    this.instancedMesh = null;
    this.clearUserData();
  }
}

/**
 * React component wrapper for the PointRenderingEngine
 */
export const AutoCADPointRenderer = ({ 
  points = [], 
  maxPoints = 10000,
  style = 'CROSS',
  onPointClick,
  onPointHover 
}) => {
  const { scene, camera, gl } = useThree();
  const engineRef = useRef(null);
  
  // Initialize rendering engine
  useEffect(() => {
    engineRef.current = new PointRenderingEngine(scene, maxPoints);
    
    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
      }
    };
  }, [scene, maxPoints]);
  
  // Update points when data changes
  useEffect(() => {
    if (engineRef.current) {
      const processedPoints = points.map(point => ({
        ...point,
        style: point.style || style
      }));
      engineRef.current.updatePoints(processedPoints);
    }
  }, [points, style]);
  
  // Update global parameters each frame
  useFrame(() => {
    if (engineRef.current) {
      engineRef.current.updateGlobalParams(camera, gl);
    }
  });
  
  return null; // The rendering is handled by the engine directly
};

export default AutoCADPointRenderer;