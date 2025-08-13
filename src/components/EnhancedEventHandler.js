import React, { useRef, useEffect, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Debounce utility for performance optimization
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle utility for smooth event handling
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const EnhancedEventHandler = ({
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
  onDoubleClick,
  onContextMenu,
  drawingMode,
  isDrawing,
  children
}) => {
  const { gl, raycaster, camera, scene } = useThree();
  const eventState = useRef({
    isPointerDown: false,
    lastPointerEvent: null,
    pointerStartTime: 0,
    pointerMoveCount: 0,
    lastUpdateTime: 0,
    touchEvents: new Map(),
    gestureState: 'none', // 'none', 'pan', 'rotate', 'zoom'
  });

  // Enhanced raycasting with performance optimization
  const performRaycast = useCallback((event) => {
    const rect = gl.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // Get all intersectable objects from the scene
    const intersectableObjects = [];
    scene.traverse((child) => {
      if (child.isMesh && child.visible) {
        intersectableObjects.push(child);
      }
    });
    
    const intersects = raycaster.intersectObjects(intersectableObjects, false);
    return intersects.length > 0 ? intersects[0] : null;
  }, [gl.domElement, raycaster, camera, scene]);

  // Optimized pointer down handler
  const handlePointerDown = useCallback((event) => {
    event.preventDefault();
    
    const currentTime = Date.now();
    eventState.current.isPointerDown = true;
    eventState.current.lastPointerEvent = event;
    eventState.current.pointerStartTime = currentTime;
    eventState.current.pointerMoveCount = 0;
    
    // Handle touch events
    if (event.pointerType === 'touch') {
      eventState.current.touchEvents.set(event.pointerId, {
        startX: event.clientX,
        startY: event.clientY,
        currentX: event.clientX,
        currentY: event.clientY,
        startTime: currentTime
      });
    }
    
    // Perform raycast for drawing operations
    if (drawingMode && drawingMode !== 'select') {
      const intersection = performRaycast(event);
      if (intersection) {
        onPointerDown?.(event, intersection);
      }
    } else {
      onPointerDown?.(event);
    }
  }, [drawingMode, onPointerDown, performRaycast]);

  // Throttled pointer move handler for smooth performance
  const handlePointerMove = useCallback(throttle((event) => {
    if (!eventState.current.isPointerDown) return;
    
    event.preventDefault();
    eventState.current.pointerMoveCount++;
    
    const currentTime = Date.now();
    const timeDelta = currentTime - eventState.current.lastUpdateTime;
    
    // Skip update if too frequent (maintain 60fps max)
    if (timeDelta < 16) return;
    
    eventState.current.lastUpdateTime = currentTime;
    
    // Handle touch gesture recognition
    if (event.pointerType === 'touch') {
      handleTouchGesture(event);
    }
    
    // Perform raycast for drawing operations
    if (drawingMode && isDrawing) {
      const intersection = performRaycast(event);
      if (intersection) {
        onPointerMove?.(event, intersection);
      }
    } else {
      onPointerMove?.(event);
    }
  }, 16), [drawingMode, isDrawing, onPointerMove, performRaycast]);

  // Touch gesture recognition
  const handleTouchGesture = useCallback((event) => {
    const touchData = eventState.current.touchEvents.get(event.pointerId);
    if (!touchData) return;
    
    // Update touch position
    touchData.currentX = event.clientX;
    touchData.currentY = event.clientY;
    
    const touchCount = eventState.current.touchEvents.size;
    
    if (touchCount === 1) {
      // Single touch - potential drawing or selection
      const deltaX = Math.abs(event.clientX - touchData.startX);
      const deltaY = Math.abs(event.clientY - touchData.startY);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance > 5) { // Minimum movement threshold
        eventState.current.gestureState = 'draw';
      }
    } else if (touchCount === 2) {
      // Two finger gesture - pan or zoom
      const touches = Array.from(eventState.current.touchEvents.values());
      const touch1 = touches[0];
      const touch2 = touches[1];
      
      const currentDistance = Math.sqrt(
        Math.pow(touch2.currentX - touch1.currentX, 2) + 
        Math.pow(touch2.currentY - touch1.currentY, 2)
      );
      
      const startDistance = Math.sqrt(
        Math.pow(touch2.startX - touch1.startX, 2) + 
        Math.pow(touch2.startY - touch1.startY, 2)
      );
      
      const distanceChange = Math.abs(currentDistance - startDistance);
      
      if (distanceChange > 10) {
        eventState.current.gestureState = 'zoom';
      } else {
        eventState.current.gestureState = 'pan';
      }
    }
  }, []);

  // Optimized pointer up handler
  const handlePointerUp = useCallback((event) => {
    event.preventDefault();
    
    const currentTime = Date.now();
    const holdDuration = currentTime - eventState.current.pointerStartTime;
    const moveCount = eventState.current.pointerMoveCount;
    
    // Clean up touch events
    eventState.current.touchEvents.delete(event.pointerId);
    
    // Reset state when all pointers are up
    if (eventState.current.touchEvents.size === 0) {
      eventState.current.isPointerDown = false;
      eventState.current.gestureState = 'none';
    }
    
    // Determine if this was a click vs drag
    const wasClick = holdDuration < 300 && moveCount < 3;
    
    if (wasClick && drawingMode) {
      const intersection = performRaycast(event);
      if (intersection) {
        onPointerUp?.(event, intersection, 'click');
      }
    } else {
      onPointerUp?.(event, null, 'drag');
    }
  }, [drawingMode, onPointerUp, performRaycast]);

  // Enhanced wheel handler with momentum
  const handleWheel = useCallback(throttle((event) => {
    event.preventDefault();
    
    // Normalize wheel delta across different browsers/devices
    let delta = event.deltaY;
    if (event.deltaMode === 1) { // Line mode
      delta *= 16;
    } else if (event.deltaMode === 2) { // Page mode
      delta *= 100;
    }
    
    // Apply momentum and smoothing
    const normalizedDelta = Math.sign(delta) * Math.min(Math.abs(delta), 100);
    
    onWheel?.(event, normalizedDelta);
  }, 16), [onWheel]);

  // Double click handler with timing validation
  const handleDoubleClick = useCallback((event) => {
    event.preventDefault();
    
    if (drawingMode) {
      const intersection = performRaycast(event);
      if (intersection) {
        onDoubleClick?.(event, intersection);
      }
    } else {
      onDoubleClick?.(event);
    }
  }, [drawingMode, onDoubleClick, performRaycast]);

  // Context menu handler
  const handleContextMenu = useCallback((event) => {
    event.preventDefault();
    onContextMenu?.(event);
  }, [onContextMenu]);

  // Debounced resize handler for performance
  const handleResize = useCallback(debounce(() => {
    // Update any size-dependent calculations
    const rect = gl.domElement.getBoundingClientRect();
    // Store updated dimensions if needed
  }, 100), [gl.domElement]);

  // Set up event listeners with proper cleanup
  useEffect(() => {
    const element = gl.domElement;
    
    // Pointer events for unified mouse/touch handling
    element.addEventListener('pointerdown', handlePointerDown, { passive: false });
    element.addEventListener('pointermove', handlePointerMove, { passive: false });
    element.addEventListener('pointerup', handlePointerUp, { passive: false });
    element.addEventListener('pointercancel', handlePointerUp, { passive: false });
    
    // Wheel events for zoom
    element.addEventListener('wheel', handleWheel, { passive: false });
    
    // Double click events
    element.addEventListener('dblclick', handleDoubleClick, { passive: false });
    
    // Context menu prevention
    element.addEventListener('contextmenu', handleContextMenu, { passive: false });
    
    // Window resize for responsive handling
    window.addEventListener('resize', handleResize);
    
    // Touch-specific events for better mobile support
    element.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    element.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    element.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
    
    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerUp);
      element.removeEventListener('wheel', handleWheel);
      element.removeEventListener('dblclick', handleDoubleClick);
      element.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', handleResize);
      element.removeEventListener('touchstart', (e) => e.preventDefault());
      element.removeEventListener('touchmove', (e) => e.preventDefault());
      element.removeEventListener('touchend', (e) => e.preventDefault());
    };
  }, [
    gl.domElement,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
    handleDoubleClick,
    handleContextMenu,
    handleResize
  ]);

  return children || null;
};

export default EnhancedEventHandler;

