import React from 'react';
import * as THREE from 'three';

/**
 * Advanced screen-space optimization system for AutoCAD-style point markers
 * Handles intelligent culling, LOD management, and performance optimization
 */
export class ScreenSpaceOptimizer {
  constructor(options = {}) {
    this.options = {
      minPixelSize: 2,           // Minimum point size in pixels
      maxPixelSize: 20,          // Maximum point size in pixels
      basePixelSize: 10,         // Default point size in pixels
      cullingDistance: 1000,     // Maximum distance to render points
      lodLevels: 4,              // Number of LOD levels
      frustumCulling: true,      // Enable frustum culling
      occlusionCulling: false,   // Enable occlusion culling (expensive)
      dynamicLOD: true,          // Enable dynamic LOD based on performance
      targetFPS: 60,             // Target frame rate for dynamic optimization
      ...options
    };
    
    // Performance tracking
    this.performanceTracker = new PerformanceTracker();
    this.frameTimeHistory = [];
    this.maxHistorySize = 30;
    
    // Culling helpers
    this.frustum = new THREE.Frustum();
    this.cameraMatrix = new THREE.Matrix4();
    this.tempVector = new THREE.Vector3();
    this.tempBox = new THREE.Box3();
    
    // LOD configuration
    this.lodLevels = this.generateLODLevels();
    
    // Spatial partitioning for optimization
    this.spatialGrid = new SpatialGrid(50); // 50-unit grid cells
  }
  
  /**
   * Generate level-of-detail configurations
   */
  generateLODLevels() {
    const levels = [];
    
    for (let i = 0; i < this.options.lodLevels; i++) {
      const distanceThreshold = Math.pow(2, i) * 20; // 20, 40, 80, 160...
      const sizeMultiplier = Math.max(0.3, 1.0 - (i * 0.2)); // 1.0, 0.8, 0.6, 0.4
      const qualityLevel = Math.max(1, this.options.lodLevels - i);
      
      levels.push({
        level: i,
        distanceThreshold,
        sizeMultiplier,
        qualityLevel,
        // Reduce point density at higher LOD levels
        densityReduction: Math.pow(2, i),
        // Use simpler marker styles at distance
        markerStyle: i < 2 ? 'detailed' : 'simple'
      });
    }
    
    return levels;
  }
  
  /**
   * Optimize points for current camera and performance conditions
   */
  optimizePoints(points, camera, renderer) {
    const startTime = performance.now();
    
    // Update performance tracking
    this.performanceTracker.startFrame();
    
    // Update frustum for culling
    if (this.options.frustumCulling) {
      this.cameraMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      this.frustum.setFromProjectionMatrix(this.cameraMatrix);
    }
    
    // Categorize points by LOD level and cull invisible ones
    const optimizedPoints = this.processPointsWithLOD(points, camera, renderer);
    
    // Apply dynamic optimization based on performance
    const finalPoints = this.applyDynamicOptimization(optimizedPoints, camera);
    
    // Update spatial grid for next frame
    this.spatialGrid.updatePoints(finalPoints);
    
    // Track performance
    const endTime = performance.now();
    this.performanceTracker.endFrame(endTime - startTime);
    this.updateFrameTimeHistory(endTime - startTime);
    
    return finalPoints;
  }
  
  /**
   * Process points with level-of-detail optimization
   */
  processPointsWithLOD(points, camera, renderer) {
    const optimizedPoints = [];
    const cameraPosition = camera.position;
    const canvasSize = renderer.getSize(new THREE.Vector2());
    
    for (const point of points) {
      // Skip if point is undefined or invalid
      if (!point || !point.position) continue;
      
      const worldPosition = new THREE.Vector3(
        point.position.x, 
        point.position.y, 
        point.position.z
      );
      
      // Calculate distance to camera
      const distance = cameraPosition.distanceTo(worldPosition);
      
      // Skip points beyond culling distance
      if (distance > this.options.cullingDistance) continue;
      
      // Frustum culling
      if (this.options.frustumCulling && !this.isPointInFrustum(worldPosition)) {
        continue;
      }
      
      // Determine LOD level
      const lodLevel = this.calculateLODLevel(distance);
      const lodConfig = this.lodLevels[lodLevel];
      
      // Apply density reduction for high LOD levels
      if (this.shouldSkipPointForDensity(point, lodConfig)) {
        continue;
      }
      
      // Calculate screen-space size
      const screenSpaceSize = this.calculateScreenSpaceSize(
        worldPosition, 
        camera, 
        canvasSize,
        lodConfig.sizeMultiplier
      );
      
      // Skip points that are too small to be visible
      if (screenSpaceSize < this.options.minPixelSize / canvasSize.height) {
        continue;
      }
      
      // Create optimized point
      const optimizedPoint = {
        ...point,
        distance,
        lodLevel,
        screenSpaceSize,
        quality: lodConfig.qualityLevel,
        markerStyle: this.selectMarkerStyle(point.style, lodConfig.markerStyle),
        priority: this.calculatePointPriority(point, distance, screenSpaceSize)
      };
      
      optimizedPoints.push(optimizedPoint);
    }
    
    // Sort by priority for better rendering order
    return optimizedPoints.sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * Apply dynamic optimization based on current performance
   */
  applyDynamicOptimization(points, camera) {
    if (!this.options.dynamicLOD) return points;
    
    const avgFrameTime = this.getAverageFrameTime();
    const targetFrameTime = 1000 / this.options.targetFPS;
    
    // If we're running slow, apply aggressive optimization
    if (avgFrameTime > targetFrameTime * 1.2) {
      return this.applyAggressiveOptimization(points, camera);
    }
    
    // If we're running fast, we can afford more detail
    if (avgFrameTime < targetFrameTime * 0.8) {
      return this.enhanceDetailLevel(points, camera);
    }
    
    return points;
  }
  
  /**
   * Apply aggressive optimization when performance is poor
   */
  applyAggressiveOptimization(points, camera) {
    // Reduce point density by removing every other point at distance
    const optimizedPoints = [];
    
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      
      // Always keep high-priority points
      if (point.priority > 0.8) {
        optimizedPoints.push(point);
        continue;
      }
      
      // Apply distance-based skipping
      if (point.distance > 50 && i % 2 === 0) continue; // Skip every other distant point
      if (point.distance > 100 && i % 3 !== 0) continue; // Skip 2/3 of very distant points
      
      optimizedPoints.push(point);
    }
    
    return optimizedPoints;
  }
  
  /**
   * Enhance detail level when performance allows
   */
  enhanceDetailLevel(points, camera) {
    // Upgrade marker quality for close points
    return points.map(point => {
      if (point.distance < 30 && point.quality < this.options.lodLevels) {
        return {
          ...point,
          quality: Math.min(this.options.lodLevels, point.quality + 1),
          markerStyle: 'detailed'
        };
      }
      return point;
    });
  }
  
  /**
   * Check if point is within camera frustum
   */
  isPointInFrustum(worldPosition) {
    return this.frustum.containsPoint(worldPosition);
  }
  
  /**
   * Calculate LOD level based on distance
   */
  calculateLODLevel(distance) {
    for (let i = 0; i < this.lodLevels.length; i++) {
      if (distance <= this.lodLevels[i].distanceThreshold) {
        return i;
      }
    }
    return this.lodLevels.length - 1; // Furthest LOD level
  }
  
  /**
   * Calculate screen-space size for adaptive point sizing
   */
  calculateScreenSpaceSize(worldPosition, camera, canvasSize, sizeMultiplier = 1.0) {
    const distance = camera.position.distanceTo(worldPosition);
    const fov = (camera.fov * Math.PI) / 180;
    
    // Calculate screen-space size
    const screenSpaceSize = 
      (this.options.basePixelSize * sizeMultiplier / canvasSize.height) * 
      2 * distance * Math.tan(fov / 2);
    
    // Clamp to reasonable limits
    const minSize = this.options.minPixelSize / canvasSize.height;
    const maxSize = this.options.maxPixelSize / canvasSize.height;
    
    return Math.max(minSize, Math.min(maxSize, screenSpaceSize));
  }
  
  /**
   * Determine if point should be skipped for density reduction
   */
  shouldSkipPointForDensity(point, lodConfig) {
    if (lodConfig.densityReduction <= 1) return false;
    
    // Use point ID or position hash for consistent skipping
    const hash = this.hashPoint(point);
    return hash % lodConfig.densityReduction !== 0;
  }
  
  /**
   * Select appropriate marker style based on LOD
   */
  selectMarkerStyle(originalStyle, lodStyle) {
    if (lodStyle === 'simple') {
      // Map complex styles to simpler ones at distance
      const styleMap = {
        'diamond': 'circle',
        'square': 'circle',
        'x': 'cross',
        'plus': 'cross'
      };
      return styleMap[originalStyle] || originalStyle;
    }
    return originalStyle;
  }
  
  /**
   * Calculate point rendering priority
   */
  calculatePointPriority(point, distance, screenSpaceSize) {
    let priority = 1.0;
    
    // Prioritize by screen size (larger = more important)
    priority *= Math.min(1.0, screenSpaceSize * 100);
    
    // Prioritize by distance (closer = more important)
    priority *= Math.max(0.1, 1.0 - (distance / this.options.cullingDistance));
    
    // Prioritize by point type
    const typePriority = {
      'selected': 1.0,
      'hovered': 0.9,
      'control': 0.8,
      'corner': 0.7,
      'normal': 0.5
    };
    priority *= typePriority[point.type] || 0.5;
    
    return Math.max(0, Math.min(1, priority));
  }
  
  /**
   * Generate hash for consistent point skipping
   */
  hashPoint(point) {
    const x = Math.floor(point.position.x * 100);
    const z = Math.floor(point.position.z * 100);
    return ((x * 73856093) ^ (z * 19349663)) % 1000000;
  }
  
  /**
   * Get average frame time from recent history
   */
  getAverageFrameTime() {
    if (this.frameTimeHistory.length === 0) return 16.67; // 60 FPS default
    
    const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
    return sum / this.frameTimeHistory.length;
  }
  
  /**
   * Update frame time history for performance tracking
   */
  updateFrameTimeHistory(frameTime) {
    this.frameTimeHistory.push(frameTime);
    if (this.frameTimeHistory.length > this.maxHistorySize) {
      this.frameTimeHistory.shift();
    }
  }
  
  /**
   * Get current performance statistics
   */
  getPerformanceStats() {
    return {
      avgFrameTime: this.getAverageFrameTime(),
      targetFrameTime: 1000 / this.options.targetFPS,
      isPerformanceGood: this.getAverageFrameTime() < (1000 / this.options.targetFPS) * 1.2,
      totalFrames: this.performanceTracker.totalFrames,
      cullDistance: this.options.cullingDistance,
      lodLevels: this.lodLevels.length
    };
  }
}

/**
 * Performance tracking utility
 */
class PerformanceTracker {
  constructor() {
    this.totalFrames = 0;
    this.totalTime = 0;
    this.startTime = 0;
  }
  
  startFrame() {
    this.startTime = performance.now();
  }
  
  endFrame(frameTime) {
    this.totalFrames++;
    this.totalTime += frameTime;
  }
  
  getAverageFrameTime() {
    return this.totalFrames > 0 ? this.totalTime / this.totalFrames : 0;
  }
  
  reset() {
    this.totalFrames = 0;
    this.totalTime = 0;
  }
}

/**
 * Spatial grid for efficient point organization and culling
 */
class SpatialGrid {
  constructor(cellSize = 50) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }
  
  /**
   * Get grid cell key for a position
   */
  getCellKey(x, z) {
    const cellX = Math.floor(x / this.cellSize);
    const cellZ = Math.floor(z / this.cellSize);
    return `${cellX},${cellZ}`;
  }
  
  /**
   * Update points in spatial grid
   */
  updatePoints(points) {
    this.grid.clear();
    
    for (const point of points) {
      const key = this.getCellKey(point.position.x, point.position.z);
      
      if (!this.grid.has(key)) {
        this.grid.set(key, []);
      }
      
      this.grid.get(key).push(point);
    }
  }
  
  /**
   * Get points within a bounding box
   */
  getPointsInBounds(minX, minZ, maxX, maxZ) {
    const points = [];
    
    const startCellX = Math.floor(minX / this.cellSize);
    const startCellZ = Math.floor(minZ / this.cellSize);
    const endCellX = Math.ceil(maxX / this.cellSize);
    const endCellZ = Math.ceil(maxZ / this.cellSize);
    
    for (let x = startCellX; x <= endCellX; x++) {
      for (let z = startCellZ; z <= endCellZ; z++) {
        const key = `${x},${z}`;
        const cellPoints = this.grid.get(key);
        
        if (cellPoints) {
          points.push(...cellPoints);
        }
      }
    }
    
    return points;
  }
  
  /**
   * Get points within radius of a position
   */
  getPointsInRadius(centerX, centerZ, radius) {
    return this.getPointsInBounds(
      centerX - radius,
      centerZ - radius,
      centerX + radius,
      centerZ + radius
    ).filter(point => {
      const dx = point.position.x - centerX;
      const dz = point.position.z - centerZ;
      return Math.sqrt(dx * dx + dz * dz) <= radius;
    });
  }
}

/**
 * React hook for using screen-space optimization
 */
export function useScreenSpaceOptimization(options = {}) {
  const [optimizer] = React.useState(() => new ScreenSpaceOptimizer(options));
  const [performanceStats, setPerformanceStats] = React.useState(null);
  
  React.useEffect(() => {
    const updateStats = () => {
      setPerformanceStats(optimizer.getPerformanceStats());
    };
    
    const interval = setInterval(updateStats, 1000); // Update every second
    return () => clearInterval(interval);
  }, [optimizer]);
  
  const optimizePoints = React.useCallback((points, camera, renderer) => {
    return optimizer.optimizePoints(points, camera, renderer);
  }, [optimizer]);
  
  return {
    optimizePoints,
    performanceStats,
    optimizer
  };
}

export default ScreenSpaceOptimizer;