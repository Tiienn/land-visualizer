import React, { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Performance optimization constants
const TARGET_FPS = 60;
const FRAME_TIME_MS = 1000 / TARGET_FPS;
const ADAPTIVE_QUALITY_THRESHOLD = 30; // FPS threshold for quality adjustment

export const OptimizedRenderer = ({ 
  enableAdaptiveQuality = true,
  enableSelectiveRendering = true,
  onPerformanceChange 
}) => {
  const { gl, scene, camera, size } = useThree();
  const renderState = useRef({
    needsUpdate: false,
    lastRenderTime: 0,
    frameCount: 0,
    fps: 60,
    adaptiveQuality: 1.0,
    isInteracting: false,
    lastInteractionTime: 0,
    renderQueue: new Set(),
  });

  // Performance monitoring
  const performanceMonitor = useRef({
    frameTimes: [],
    lastFrameTime: performance.now(),
    averageFPS: 60,
  });

  // Adaptive quality management
  const updateAdaptiveQuality = useCallback(() => {
    if (!enableAdaptiveQuality) return;

    const { fps } = renderState.current;
    const monitor = performanceMonitor.current;
    
    if (fps < ADAPTIVE_QUALITY_THRESHOLD) {
      // Reduce quality for better performance
      renderState.current.adaptiveQuality = Math.max(0.5, renderState.current.adaptiveQuality - 0.1);
      
      // Adjust renderer settings
      gl.setPixelRatio(Math.min(window.devicePixelRatio * renderState.current.adaptiveQuality, 2));
      
      // Reduce shadow quality if needed
      if (renderState.current.adaptiveQuality < 0.8) {
        scene.traverse((child) => {
          if (child.isLight && child.shadow) {
            child.shadow.mapSize.setScalar(512 * renderState.current.adaptiveQuality);
          }
        });
      }
    } else if (fps > TARGET_FPS - 5 && renderState.current.adaptiveQuality < 1.0) {
      // Restore quality when performance allows
      renderState.current.adaptiveQuality = Math.min(1.0, renderState.current.adaptiveQuality + 0.05);
      gl.setPixelRatio(Math.min(window.devicePixelRatio * renderState.current.adaptiveQuality, 2));
    }

    onPerformanceChange?.({
      fps: monitor.averageFPS,
      quality: renderState.current.adaptiveQuality,
      isInteracting: renderState.current.isInteracting
    });
  }, [enableAdaptiveQuality, gl, scene, onPerformanceChange]);

  // Selective rendering based on scene changes
  const shouldRender = useCallback(() => {
    if (!enableSelectiveRendering) return true;
    
    const currentTime = performance.now();
    const { needsUpdate, isInteracting, lastInteractionTime } = renderState.current;
    
    // Always render during interactions
    if (isInteracting) return true;
    
    // Render for a short time after interaction ends
    if (currentTime - lastInteractionTime < 100) return true;
    
    // Render if explicitly marked as needing update
    if (needsUpdate) {
      renderState.current.needsUpdate = false;
      return true;
    }
    
    // Check if any objects in render queue need updates
    if (renderState.current.renderQueue.size > 0) {
      renderState.current.renderQueue.clear();
      return true;
    }
    
    return false;
  }, [enableSelectiveRendering]);

  // Optimized render function
  const optimizedRender = useCallback(() => {
    const currentTime = performance.now();
    const deltaTime = currentTime - renderState.current.lastRenderTime;
    
    // Skip render if frame rate is too high (save battery)
    if (deltaTime < FRAME_TIME_MS * 0.8) return;
    
    if (shouldRender()) {
      // Update performance metrics
      const monitor = performanceMonitor.current;
      const frameDelta = currentTime - monitor.lastFrameTime;
      monitor.frameTimes.push(frameDelta);
      
      // Keep only last 60 frame times for rolling average
      if (monitor.frameTimes.length > 60) {
        monitor.frameTimes.shift();
      }
      
      // Calculate average FPS
      const averageFrameTime = monitor.frameTimes.reduce((a, b) => a + b, 0) / monitor.frameTimes.length;
      monitor.averageFPS = 1000 / averageFrameTime;
      renderState.current.fps = monitor.averageFPS;
      
      monitor.lastFrameTime = currentTime;
      
      // Perform the actual render
      gl.render(scene, camera);
      
      // Update adaptive quality periodically
      if (renderState.current.frameCount % 60 === 0) {
        updateAdaptiveQuality();
      }
    }
    
    renderState.current.lastRenderTime = currentTime;
    renderState.current.frameCount++;
  }, [gl, scene, camera, shouldRender, updateAdaptiveQuality]);

  // Mark scene as needing update
  const markNeedsUpdate = useCallback(() => {
    renderState.current.needsUpdate = true;
  }, []);

  // Mark object for selective rendering
  const markObjectForRender = useCallback((object) => {
    renderState.current.renderQueue.add(object);
    markNeedsUpdate();
  }, [markNeedsUpdate]);

  // Interaction state management
  const setInteracting = useCallback((isInteracting) => {
    renderState.current.isInteracting = isInteracting;
    if (!isInteracting) {
      renderState.current.lastInteractionTime = performance.now();
    }
    markNeedsUpdate();
  }, [markNeedsUpdate]);

  // Optimized resize handler
  const handleResize = useCallback(() => {
    const { width, height } = size;
    
    // Update camera aspect ratio
    if (camera.isPerspectiveCamera) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    } else if (camera.isOrthographicCamera) {
      const aspect = width / height;
      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
    }
    
    // Update renderer size
    gl.setSize(width, height);
    
    markNeedsUpdate();
  }, [size, camera, gl, markNeedsUpdate]);

  // Scene change detection
  useEffect(() => {
    const handleSceneChange = () => markNeedsUpdate();
    
    // Listen for scene graph changes
    scene.addEventListener('childadded', handleSceneChange);
    scene.addEventListener('childremoved', handleSceneChange);
    
    return () => {
      scene.removeEventListener('childadded', handleSceneChange);
      scene.removeEventListener('childremoved', handleSceneChange);
    };
  }, [scene, markNeedsUpdate]);

  // Camera change detection
  useEffect(() => {
    const handleCameraChange = () => markNeedsUpdate();
    
    // Listen for camera matrix changes
    camera.addEventListener('change', handleCameraChange);
    
    return () => {
      camera.removeEventListener('change', handleCameraChange);
    };
  }, [camera, markNeedsUpdate]);

  // Resize handling
  useEffect(() => {
    handleResize();
  }, [handleResize]);

  // Main render loop
  useFrame(() => {
    optimizedRender();
  });

  // Expose control methods
  useEffect(() => {
    // Attach methods to the renderer for external control
    gl.markNeedsUpdate = markNeedsUpdate;
    gl.markObjectForRender = markObjectForRender;
    gl.setInteracting = setInteracting;
    gl.getPerformanceStats = () => ({
      fps: renderState.current.fps,
      quality: renderState.current.adaptiveQuality,
      frameCount: renderState.current.frameCount,
      isInteracting: renderState.current.isInteracting
    });
    
    return () => {
      delete gl.markNeedsUpdate;
      delete gl.markObjectForRender;
      delete gl.setInteracting;
      delete gl.getPerformanceStats;
    };
  }, [gl, markNeedsUpdate, markObjectForRender, setInteracting]);

  // Initial renderer optimization
  useEffect(() => {
    // Optimize renderer settings
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.0;
    
    // Enable optimizations
    gl.sortObjects = true;
    gl.autoClear = true;
    
    // Set initial pixel ratio
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Enable shadow optimizations if shadows are used
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.shadowMap.autoUpdate = false; // Manual shadow updates for performance
    
    markNeedsUpdate();
  }, [gl, markNeedsUpdate]);

  return null;
};

export default OptimizedRenderer;

