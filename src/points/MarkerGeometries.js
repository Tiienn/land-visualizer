import * as THREE from 'three';

/**
 * AutoCAD-style point marker geometries
 * Provides both geometry-based and utility functions for point markers
 */
export class MarkerGeometries {
  
  /**
   * Create a cross (+) marker geometry
   */
  static createCrossGeometry(size = 1.0, thickness = 0.1) {
    const geometry = new THREE.BufferGeometry();
    const halfSize = size / 2;
    const halfThickness = thickness / 2;
    
    // Create cross shape with two intersecting rectangles
    const vertices = new Float32Array([
      // Horizontal bar (6 vertices for 2 triangles)
      -halfSize, -halfThickness, 0,   halfSize, -halfThickness, 0,   halfSize, halfThickness, 0,
      halfSize, halfThickness, 0,    -halfSize, halfThickness, 0,   -halfSize, -halfThickness, 0,
      
      // Vertical bar (6 vertices for 2 triangles)  
      -halfThickness, -halfSize, 0,   halfThickness, -halfSize, 0,   halfThickness, halfSize, 0,
      halfThickness, halfSize, 0,    -halfThickness, halfSize, 0,   -halfThickness, -halfSize, 0
    ]);
    
    const normals = new Float32Array([
      // Horizontal bar normals
      0, 0, 1,  0, 0, 1,  0, 0, 1,
      0, 0, 1,  0, 0, 1,  0, 0, 1,
      
      // Vertical bar normals
      0, 0, 1,  0, 0, 1,  0, 0, 1,
      0, 0, 1,  0, 0, 1,  0, 0, 1
    ]);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.computeBoundingSphere();
    
    return geometry;
  }
  
  /**
   * Create a circle (○) marker geometry
   */
  static createCircleGeometry(radius = 0.5, thickness = 0.05, segments = 32) {
    const geometry = new THREE.RingGeometry(
      radius - thickness / 2, 
      radius + thickness / 2, 
      segments
    );
    
    // Ensure the ring faces the camera
    geometry.rotateX(0);
    return geometry;
  }
  
  /**
   * Create an X marker geometry
   */
  static createXGeometry(size = 1.0, thickness = 0.1) {
    const geometry = new THREE.BufferGeometry();
    const halfSize = size / 2;
    const halfThickness = thickness / 2;
    
    // Create X shape with two diagonal bars
    const cos45 = Math.cos(Math.PI / 4);
    const sin45 = Math.sin(Math.PI / 4);
    
    const vertices = new Float32Array([
      // First diagonal (top-left to bottom-right)
      -halfSize * cos45 - halfThickness * sin45, -halfSize * sin45 + halfThickness * cos45, 0,
      halfSize * cos45 - halfThickness * sin45, halfSize * sin45 + halfThickness * cos45, 0,
      halfSize * cos45 + halfThickness * sin45, halfSize * sin45 - halfThickness * cos45, 0,
      halfSize * cos45 + halfThickness * sin45, halfSize * sin45 - halfThickness * cos45, 0,
      -halfSize * cos45 + halfThickness * sin45, -halfSize * sin45 - halfThickness * cos45, 0,
      -halfSize * cos45 - halfThickness * sin45, -halfSize * sin45 + halfThickness * cos45, 0,
      
      // Second diagonal (top-right to bottom-left)
      halfSize * cos45 - halfThickness * sin45, -halfSize * sin45 - halfThickness * cos45, 0,
      -halfSize * cos45 - halfThickness * sin45, halfSize * sin45 - halfThickness * cos45, 0,
      -halfSize * cos45 + halfThickness * sin45, halfSize * sin45 + halfThickness * cos45, 0,
      -halfSize * cos45 + halfThickness * sin45, halfSize * sin45 + halfThickness * cos45, 0,
      halfSize * cos45 + halfThickness * sin45, -halfSize * sin45 + halfThickness * cos45, 0,
      halfSize * cos45 - halfThickness * sin45, -halfSize * sin45 - halfThickness * cos45, 0
    ]);
    
    const normals = new Float32Array(vertices.length);
    for (let i = 0; i < normals.length; i += 3) {
      normals[i] = 0;
      normals[i + 1] = 0;
      normals[i + 2] = 1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.computeBoundingSphere();
    
    return geometry;
  }
  
  /**
   * Create a plus (+) marker geometry (thicker than cross)
   */
  static createPlusGeometry(size = 1.0, thickness = 0.2) {
    return this.createCrossGeometry(size, thickness);
  }
  
  /**
   * Create a square (□) marker geometry
   */
  static createSquareGeometry(size = 1.0, thickness = 0.05) {
    const outerSize = size / 2;
    const innerSize = outerSize - thickness;
    
    const geometry = new THREE.RingGeometry(0, outerSize, 4);
    
    // Create square outline by modifying ring geometry
    const positions = geometry.attributes.position.array;
    
    // Convert circular ring to square ring
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const angle = Math.atan2(y, x);
      
      // Map to square coordinates
      const absAngle = Math.abs(angle);
      const isVertical = absAngle > Math.PI / 4 && absAngle < 3 * Math.PI / 4;
      
      if (isVertical) {
        const newX = Math.sign(x) * outerSize * Math.abs(Math.cos(angle)) / Math.abs(Math.sin(angle));
        const newY = Math.sign(y) * outerSize;
        positions[i] = Math.max(-outerSize, Math.min(outerSize, newX));
        positions[i + 1] = newY;
      } else {
        const newX = Math.sign(x) * outerSize;
        const newY = Math.sign(y) * outerSize * Math.abs(Math.sin(angle)) / Math.abs(Math.cos(angle));
        positions[i] = newX;
        positions[i + 1] = Math.max(-outerSize, Math.min(outerSize, newY));
      }
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeBoundingSphere();
    
    return geometry;
  }
  
  /**
   * Create a diamond (◊) marker geometry
   */
  static createDiamondGeometry(size = 1.0, thickness = 0.05) {
    const geometry = new THREE.BufferGeometry();
    const halfSize = size / 2;
    const halfThickness = thickness / 2;
    
    // Diamond is a rotated square
    const vertices = new Float32Array([
      // Outer diamond
      0, halfSize, 0,             // Top
      halfSize, 0, 0,             // Right
      0, -halfSize, 0,            // Bottom
      -halfSize, 0, 0,            // Left
      
      // Inner diamond (for hollow effect)
      0, halfSize - thickness, 0,  // Top inner
      halfSize - thickness, 0, 0,  // Right inner
      0, -(halfSize - thickness), 0, // Bottom inner
      -(halfSize - thickness), 0, 0  // Left inner
    ]);
    
    const indices = new Uint16Array([
      // Outer outline triangles
      0, 1, 4,  1, 5, 4,  // Top-right edge
      1, 2, 5,  2, 6, 5,  // Bottom-right edge
      2, 3, 6,  3, 7, 6,  // Bottom-left edge
      3, 0, 7,  0, 4, 7   // Top-left edge
    ]);
    
    const normals = new Float32Array([
      0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
      0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1
    ]);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();
    
    return geometry;
  }
  
  /**
   * Create a dot (•) marker geometry
   */
  static createDotGeometry(radius = 0.1, segments = 16) {
    return new THREE.CircleGeometry(radius, segments);
  }
  
  /**
   * Get all available marker types
   */
  static getMarkerTypes() {
    return {
      CROSS: 'cross',
      CIRCLE: 'circle', 
      X_MARKER: 'x',
      PLUS: 'plus',
      SQUARE: 'square',
      DIAMOND: 'diamond',
      DOT: 'dot'
    };
  }
  
  /**
   * Factory method to create geometry by type
   */
  static createGeometry(type, size = 1.0, options = {}) {
    const thickness = options.thickness || 0.1;
    const segments = options.segments || 32;
    
    switch (type.toLowerCase()) {
      case 'cross':
        return this.createCrossGeometry(size, thickness);
      case 'circle':
        return this.createCircleGeometry(size * 0.5, thickness, segments);
      case 'x':
      case 'x_marker':
        return this.createXGeometry(size, thickness);
      case 'plus':
        return this.createPlusGeometry(size, thickness * 2);
      case 'square':
        return this.createSquareGeometry(size, thickness);
      case 'diamond':
        return this.createDiamondGeometry(size, thickness);
      case 'dot':
        return this.createDotGeometry(size * 0.2, segments);
      default:
        console.warn(`Unknown marker type: ${type}, using cross instead`);
        return this.createCrossGeometry(size, thickness);
    }
  }
}

/**
 * Material presets for different point states
 */
export class MarkerMaterials {
  
  /**
   * Create material for point markers
   */
  static createPointMaterial(color = '#ff6b35', state = 'normal') {
    const baseColor = new THREE.Color(color);
    
    // State-based color modifications
    let finalColor = baseColor;
    let opacity = 0.9;
    
    switch (state) {
      case 'hovered':
        finalColor = baseColor.clone().lerp(new THREE.Color('#ffffff'), 0.3);
        opacity = 1.0;
        break;
      case 'selected':
        finalColor = baseColor.clone().lerp(new THREE.Color('#ffff00'), 0.4);
        opacity = 1.0;
        break;
      case 'dragging':
        finalColor = baseColor.clone().lerp(new THREE.Color('#ff0000'), 0.5);
        opacity = 1.0;
        break;
      case 'disabled':
        finalColor = new THREE.Color('#cccccc');
        opacity = 0.5;
        break;
    }
    
    return new THREE.MeshBasicMaterial({
      color: finalColor,
      transparent: true,
      opacity: opacity,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: false
    });
  }
  
  /**
   * Create professional color scheme based on AutoCAD conventions
   */
  static getCADColors() {
    return {
      DEFAULT: '#ff6b35',      // Professional orange
      HOVERED: '#60a5fa',      // Interactive blue
      SELECTED: '#3b82f6',     // Selected blue
      DRAGGING: '#ef4444',     // Active red
      DISABLED: '#94a3b8',     // Muted gray
      CONTROL_POINT: '#10b981', // Green for control points
      CONSTRUCTION: '#f59e0b',  // Yellow for construction
      LOCKED: '#6b7280'        // Gray for locked points
    };
  }
}

/**
 * Utility functions for marker management
 */
export class MarkerUtils {
  
  /**
   * Calculate appropriate marker size based on camera distance
   */
  static calculateScreenSpaceSize(worldPosition, camera, basePixelSize = 10) {
    const distance = camera.position.distanceTo(worldPosition);
    const fov = camera.fov * Math.PI / 180;
    const screenHeight = 1080; // Default screen height
    
    // Screen-space size calculation
    const screenSpaceSize = (basePixelSize / screenHeight) * 2 * distance * Math.tan(fov / 2);
    
    // Clamp to reasonable limits
    return Math.max(0.5, Math.min(4.0, screenSpaceSize));
  }
  
  /**
   * Check if marker should be visible based on LOD
   */
  static shouldRenderMarker(worldPosition, camera, minScreenSize = 4) {
    const screenSize = this.calculateScreenSpaceSize(worldPosition, camera);
    return screenSize >= minScreenSize / 1080; // Convert to normalized size
  }
  
  /**
   * Create instanced marker mesh for performance
   */
  static createInstancedMarkerMesh(geometry, material, maxInstances = 1000) {
    const instancedMesh = new THREE.InstancedMesh(geometry, material, maxInstances);
    
    // Set default transformation for each instance
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < maxInstances; i++) {
      matrix.identity();
      instancedMesh.setMatrixAt(i, matrix);
    }
    
    instancedMesh.instanceMatrix.needsUpdate = true;
    return instancedMesh;
  }
  
  /**
   * Update instanced marker positions efficiently
   */
  static updateInstancedMarkers(instancedMesh, markers) {
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();
    
    for (let i = 0; i < Math.min(markers.length, instancedMesh.count); i++) {
      const marker = markers[i];
      
      position.set(marker.position.x, marker.position.y, marker.position.z);
      scale.setScalar(marker.scale || 1.0);
      
      matrix.identity();
      matrix.scale(scale);
      matrix.setPosition(position);
      
      instancedMesh.setMatrixAt(i, matrix);
    }
    
    // Update visible instance count
    instancedMesh.count = Math.min(markers.length, instancedMesh.count);
    instancedMesh.instanceMatrix.needsUpdate = true;
  }
}

export default MarkerGeometries;