import { useState, useEffect, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * Elegant Performance Monitoring System
 * Continuously tracks FPS, frame consistency, memory usage, and GPU capabilities
 * Provides intelligent quality level recommendations
 */

// GPU classification database
const GPU_CLASSIFICATIONS = {
  // High-end (Score: 0)
  'RTX 40': 'high-end',
  'RTX 30': 'high-end', 
  'RTX 20': 'high-end',
  'GTX 16': 'high-end',
  'RX 7': 'high-end',
  'RX 6': 'high-end',
  
  // Mid-range (Score: -5)
  'GTX 10': 'mid-range',
  'GTX 9': 'mid-range',
  'RX 5': 'mid-range',
  'RX Vega': 'mid-range',
  
  // Legacy (Score: -15)
  'GTX 7': 'legacy',
  'GTX 6': 'legacy',
  'GT 6': 'legacy',  // Your GT 630
  'GT 7': 'legacy',
  'RX 4': 'legacy',
  'HD 7': 'legacy',
  
  // Integrated (Score: -25)
  'Intel': 'integrated',
  'UHD': 'integrated',
  'Iris': 'integrated',
  'AMD Radeon Graphics': 'integrated'
};

// Quality level definitions
export const QUALITY_LEVELS = {
  FULL: {
    name: 'Full Visual',
    terrain: { enabled: true, complexity: 'high', resolution: 64 },
    lighting: { shadows: true, complexity: 'high' },
    grid: { resolution: 'high', size: 200 },
    effects: { enabled: true },
    dpr: [1, 2],
    antialias: true
  },
  BALANCED: {
    name: 'Balanced',
    terrain: { enabled: true, complexity: 'medium', resolution: 32 },
    lighting: { shadows: false, complexity: 'medium' },
    grid: { resolution: 'medium', size: 150 },
    effects: { enabled: false },
    dpr: [0.75, 1.5],
    antialias: false
  },
  PERFORMANCE: {
    name: 'Performance',
    terrain: { enabled: false, complexity: 'low', resolution: 16 },
    lighting: { shadows: false, complexity: 'low' },
    grid: { resolution: 'low', size: 100 },
    effects: { enabled: false },
    dpr: [0.5, 1],
    antialias: false
  },
  EMERGENCY: {
    name: 'Emergency Fallback',
    terrain: { enabled: false, complexity: 'minimal', resolution: 8 },
    lighting: { shadows: false, complexity: 'minimal' },
    grid: { resolution: 'minimal', size: 50 },
    effects: { enabled: false },
    dpr: [0.25, 0.5],
    antialias: false
  }
};

class PerformanceAnalyzer {
  constructor() {
    this.fpsHistory = [];
    this.frameTimeHistory = [];
    this.memoryHistory = [];
    this.startTime = performance.now();
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    
    // Rolling averages
    this.fps60Buffer = [];  // Last 60 frames
    this.fps300Buffer = []; // Last 300 frames (5 seconds at 60fps)
    
    this.gpuInfo = this.detectGPU();
  }
  
  detectGPU() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        console.log('🔍 GPU Detection: WebGL not available');
        return { tier: 'legacy', score: -25, vendor: 'Unknown', renderer: 'Unknown' };
      }
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown';
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';
      
      console.log('🔍 GPU Detection:', { vendor, renderer });
      
      // Classify GPU with better fallback logic
      let tier = 'legacy'; // Default to legacy instead of unknown
      let score = -15;      // Default legacy score
      
      // Check for your specific GPU first
      if (renderer.includes('GeForce GT 630') || renderer.includes('GT 630')) {
        console.log('✅ Detected GeForce GT 630 - Legacy tier');
        return { tier: 'legacy', score: -15, vendor, renderer };
      }
      
      // General classification
      for (const [pattern, classification] of Object.entries(GPU_CLASSIFICATIONS)) {
        if (renderer.includes(pattern)) {
          tier = classification;
          switch (classification) {
            case 'high-end': score = 0; break;
            case 'mid-range': score = -5; break;
            case 'legacy': score = -15; break;
            case 'integrated': score = -25; break;
          }
          console.log(`✅ GPU classified as ${classification} using pattern "${pattern}"`);
          break;
        }
      }
      
      // If no pattern matched but we have renderer info, be conservative
      if (tier === 'legacy' && renderer !== 'Unknown') {
        console.log('⚠️ GPU pattern not recognized, defaulting to legacy for safety');
      }
      
      return { tier, score, vendor, renderer };
    } catch (error) {
      console.warn('🚨 GPU detection failed:', error);
      // Conservative fallback for failed detection
      return { tier: 'legacy', score: -25, vendor: 'Unknown', renderer: 'Unknown' };
    }
  }
  
  recordFrame(delta) {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    const fps = 1000 / (delta * 1000);
    
    this.frameCount++;
    this.lastFrameTime = now;
    
    // Update rolling buffers
    this.fps60Buffer.push(fps);
    this.fps300Buffer.push(fps);
    this.frameTimeHistory.push(frameTime);
    
    // Keep buffers at fixed size
    if (this.fps60Buffer.length > 60) this.fps60Buffer.shift();
    if (this.fps300Buffer.length > 300) this.fps300Buffer.shift();
    if (this.frameTimeHistory.length > 300) this.frameTimeHistory.shift();
    
    // Update memory every 60 frames
    if (this.frameCount % 60 === 0) {
      this.recordMemory();
    }
  }
  
  recordMemory() {
    if (performance.memory) {
      const memoryMB = performance.memory.usedJSHeapSize / 1024 / 1024;
      this.memoryHistory.push({
        timestamp: performance.now(),
        usage: memoryMB
      });
      
      // Keep last 10 minutes of data
      const tenMinutesAgo = performance.now() - 600000;
      this.memoryHistory = this.memoryHistory.filter(entry => entry.timestamp > tenMinutesAgo);
    }
  }
  
  getMetrics() {
    const fps60 = this.fps60Buffer.length > 0 
      ? this.fps60Buffer.reduce((a, b) => a + b, 0) / this.fps60Buffer.length 
      : 60;
      
    const fps300 = this.fps300Buffer.length > 0 
      ? this.fps300Buffer.reduce((a, b) => a + b, 0) / this.fps300Buffer.length 
      : 60;
    
    const frameTimeAvg = this.frameTimeHistory.length > 0
      ? this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length
      : 16.7;
    
    // Calculate frame consistency (lower variance = better)
    const frameTimeVariance = this.calculateVariance(this.frameTimeHistory);
    const consistency = Math.max(0, 1 - (frameTimeVariance / 100));
    
    // Memory analysis
    const memoryGrowth = this.calculateMemoryGrowth();
    const memoryPressure = this.assessMemoryPressure();
    
    return {
      fps: {
        current: this.fps60Buffer[this.fps60Buffer.length - 1] || 60,
        rolling60: fps60,
        rolling300: fps300,
        trend: this.calculateTrend()
      },
      frameTime: {
        average: frameTimeAvg,
        p95: this.calculatePercentile(this.frameTimeHistory, 95),
        consistency: consistency
      },
      memory: {
        used: performance.memory ? performance.memory.usedJSHeapSize : 0,
        growth: memoryGrowth,
        pressure: memoryPressure
      },
      gpu: this.gpuInfo,
      uptime: performance.now() - this.startTime
    };
  }
  
  calculateVariance(array) {
    if (array.length === 0) return 0;
    const mean = array.reduce((a, b) => a + b, 0) / array.length;
    const variance = array.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / array.length;
    return variance;
  }
  
  calculatePercentile(array, percentile) {
    if (array.length === 0) return 0;
    const sorted = [...array].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * (percentile / 100)) - 1;
    return sorted[index] || 0;
  }
  
  calculateTrend() {
    if (this.fps300Buffer.length < 60) return 'unknown';
    
    const recent = this.fps300Buffer.slice(-60);
    const older = this.fps300Buffer.slice(-120, -60);
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    
    if (diff > 2) return 'improving';
    if (diff < -2) return 'degrading';
    return 'stable';
  }
  
  calculateMemoryGrowth() {
    if (this.memoryHistory.length < 2) return 0;
    
    const recent = this.memoryHistory[this.memoryHistory.length - 1];
    const older = this.memoryHistory[0];
    const timeSpan = (recent.timestamp - older.timestamp) / 60000; // minutes
    
    if (timeSpan === 0) return 0;
    
    return (recent.usage - older.usage) / timeSpan; // MB per minute
  }
  
  assessMemoryPressure() {
    if (!performance.memory) return 'unknown';
    
    const usedMB = performance.memory.usedJSHeapSize / 1024 / 1024;
    const limitMB = performance.memory.jsHeapSizeLimit / 1024 / 1024;
    const usage = usedMB / limitMB;
    
    if (usage > 0.8) return 'high';
    if (usage > 0.6) return 'medium';
    return 'low';
  }
  
  calculatePerformanceScore() {
    const metrics = this.getMetrics();
    let score = 100;
    
    // GPU Tier Impact (apply first for stronger influence)
    score += metrics.gpu.score;
    
    // If GPU is undefined or detection failed, force low score
    if (metrics.gpu.tier === 'unknown' || !metrics.gpu.tier) {
      console.log('⚠️ GPU tier unknown, forcing low performance score');
      score = Math.min(score, 35); // Force PERFORMANCE mode
    }
    
    // FPS Impact
    const avgFps = metrics.fps.rolling60;
    score -= Math.max(0, (60 - avgFps) * 2);
    if (avgFps < 30) score -= 20;
    
    // Consistency Impact
    if (metrics.frameTime.consistency < 0.7) score -= 15;
    
    // Memory Impact
    if (metrics.memory.growth > 2) score -= 10;
    if (metrics.memory.pressure === 'high') score -= 15;
    if (metrics.memory.pressure === 'medium') score -= 5;
    
    // Trend Impact
    if (metrics.fps.trend === 'degrading') score -= 10;
    if (metrics.fps.trend === 'improving') score += 5;
    
    return Math.max(0, Math.min(100, score));
  }
  
  getRecommendedQualityLevel() {
    const score = this.calculatePerformanceScore();
    const gpuTier = this.gpuInfo.tier;
    
    // More conservative thresholds for legacy and integrated GPUs
    if (gpuTier === 'legacy' || gpuTier === 'integrated') {
      if (score >= 95) return 'BALANCED';  // Very high score needed for legacy GPU
      if (score >= 70) return 'PERFORMANCE';
      return 'EMERGENCY';
    }
    
    // Standard thresholds for modern GPUs
    if (score >= 85) return 'FULL';
    if (score >= 65) return 'BALANCED'; 
    if (score >= 45) return 'PERFORMANCE';
    return 'EMERGENCY';
  }
}

export const usePerformanceMonitor = (options = {}) => {
  const {
    enableAutoAdjust = true,
    hysteresisDelay = 5000, // 5 seconds before mode change
    debugMode = false
  } = options;
  
  const [performanceState, setPerformanceState] = useState(() => {
    // Initialize with GPU info immediately available
    const analyzer = new PerformanceAnalyzer();
    const initialMetrics = analyzer.getMetrics();
    const initialScore = analyzer.calculatePerformanceScore();
    
    return {
      currentLevel: analyzer.getRecommendedQualityLevel(),
      metrics: initialMetrics,
      score: initialScore,
      isStable: false,
      autoAdjustEnabled: enableAutoAdjust
    };
  });
  
  const analyzerRef = useRef(new PerformanceAnalyzer());
  const lastChangeRef = useRef(0);
  const changeTimeoutRef = useRef(null);
  
  // Frame monitoring hook
  useFrame((state, delta) => {
    analyzerRef.current.recordFrame(delta);
    
    // Update metrics every 60 frames (roughly 1 second)
    if (analyzerRef.current.frameCount % 60 === 0) {
      updateMetrics();
    }
  });
  
  const updateMetrics = useCallback(() => {
    const metrics = analyzerRef.current.getMetrics();
    const score = analyzerRef.current.calculatePerformanceScore();
    const recommendedLevel = analyzerRef.current.getRecommendedQualityLevel();
    
    setPerformanceState(prev => ({
      ...prev,
      metrics,
      score,
      isStable: metrics.uptime > 10000 && metrics.fps.trend !== 'degrading'
    }));
    
    // Auto-adjust with hysteresis
    if (enableAutoAdjust && recommendedLevel !== performanceState.currentLevel) {
      const now = performance.now();
      
      // Clear any pending changes
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
      
      // Only change if enough time has passed since last change
      if (now - lastChangeRef.current > hysteresisDelay) {
        changeTimeoutRef.current = setTimeout(() => {
          setPerformanceState(prev => ({
            ...prev,
            currentLevel: recommendedLevel
          }));
          lastChangeRef.current = performance.now();
          
          if (debugMode) {
            console.log(`🎯 Performance: Auto-switched to ${recommendedLevel} (Score: ${score})`);
          }
        }, 1000); // 1 second confirmation delay
      }
    }
  }, [enableAutoAdjust, performanceState.currentLevel, hysteresisDelay, debugMode]);
  
  const manuallySetLevel = useCallback((level) => {
    setPerformanceState(prev => ({
      ...prev,
      currentLevel: level,
      autoAdjustEnabled: false
    }));
    
    // Clear any pending auto-adjustments
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
    }
  }, []);
  
  const enableAutoAdjustMode = useCallback(() => {
    setPerformanceState(prev => ({
      ...prev,
      autoAdjustEnabled: true
    }));
  }, []);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    // Current state
    currentLevel: performanceState.currentLevel,
    qualitySettings: QUALITY_LEVELS[performanceState.currentLevel],
    metrics: performanceState.metrics,
    score: performanceState.score,
    isStable: performanceState.isStable,
    
    // Controls
    manuallySetLevel,
    enableAutoAdjust: enableAutoAdjustMode,
    autoAdjustEnabled: performanceState.autoAdjustEnabled,
    
    // For debugging
    analyzer: debugMode ? analyzerRef.current : null
  };
};