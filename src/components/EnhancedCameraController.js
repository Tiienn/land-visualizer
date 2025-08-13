import React, { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Performance constants optimized for smooth interactions
const ZOOM_SPEED_FACTOR = 0.1;
const ROTATE_SPEED_FACTOR = 0.5;
const PAN_SPEED_FACTOR = 0.002;
const DAMPING_FACTOR = 0.05;
const MIN_DISTANCE = 3;
const MAX_DISTANCE = 2000;
const MIN_POLAR_ANGLE = 0;
const MAX_POLAR_ANGLE = Math.PI / 2;

// Touch gesture constants
const TOUCH_ROTATE_THRESHOLD = 3;
const TOUCH_PAN_THRESHOLD = 2;
const TOUCH_ZOOM_THRESHOLD = 10;

export const EnhancedCameraController = ({ 
  target = [0, 0, 0], 
  enableDamping = true,
  onStart,
  onEnd,
  onUpdate 
}) => {
  const { camera, gl, size } = useThree();
  const controlsRef = useRef();
  
  // State for smooth interactions
  const state = useRef({
    isInteracting: false,
    lastPointerPosition: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    targetPosition: new THREE.Vector3(...target),
    currentTarget: new THREE.Vector3(...target),
    spherical: new THREE.Spherical(),
    sphericalDelta: new THREE.Spherical(),
    scale: 1,
    panOffset: new THREE.Vector3(),
    zoomChanged: false,
    rotateStart: new THREE.Vector2(),
    rotateEnd: new THREE.Vector2(),
    rotateDelta: new THREE.Vector2(),
    panStart: new THREE.Vector2(),
    panEnd: new THREE.Vector2(),
    panDelta: new THREE.Vector2(),
    dollyStart: new THREE.Vector2(),
    dollyEnd: new THREE.Vector2(),
    dollyDelta: new THREE.Vector2(),
    
    // Touch handling
    touches: new Map(),
    lastTouchDistance: 0,
    lastTouchCenter: new THREE.Vector2(),
  });

  // Initialize spherical coordinates from camera position
  useEffect(() => {
    const offset = new THREE.Vector3();
    offset.copy(camera.position).sub(state.current.targetPosition);
    state.current.spherical.setFromVector3(offset);
  }, [camera.position]);

  // Smooth update function with damping
  const updateCamera = useCallback(() => {
    const { spherical, sphericalDelta, targetPosition, currentTarget, panOffset, scale } = state.current;
    
    // Apply spherical delta with damping
    spherical.theta -= sphericalDelta.theta * DAMPING_FACTOR;
    spherical.phi -= sphericalDelta.phi * DAMPING_FACTOR;
    
    // Constrain angles
    spherical.phi = Math.max(MIN_POLAR_ANGLE, Math.min(MAX_POLAR_ANGLE, spherical.phi));
    
    // Apply scale
    spherical.radius *= scale;
    spherical.radius = Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, spherical.radius));
    
    // Smooth target interpolation
    currentTarget.lerp(targetPosition, DAMPING_FACTOR);
    
    // Calculate new camera position
    const offset = new THREE.Vector3();
    offset.setFromSpherical(spherical);
    camera.position.copy(currentTarget).add(offset);
    
    // Apply pan offset
    camera.position.add(panOffset);
    currentTarget.add(panOffset);
    
    // Look at target
    camera.lookAt(currentTarget);
    
    // Reset deltas with damping
    sphericalDelta.theta *= (1 - DAMPING_FACTOR);
    sphericalDelta.phi *= (1 - DAMPING_FACTOR);
    panOffset.multiplyScalar(1 - DAMPING_FACTOR);
    state.current.scale = 1 + (scale - 1) * (1 - DAMPING_FACTOR);
    
    // Update velocity for momentum
    state.current.velocity.x *= (1 - DAMPING_FACTOR);
    state.current.velocity.y *= (1 - DAMPING_FACTOR);
    
    onUpdate?.();
  }, [camera, onUpdate]);

  // Enhanced pointer event handlers
  const handlePointerDown = useCallback((event) => {
    event.preventDefault();
    state.current.isInteracting = true;
    state.current.lastPointerPosition = { x: event.clientX, y: event.clientY };
    
    if (event.pointerType === 'touch') {
      state.current.touches.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
        pointerId: event.pointerId
      });
    }
    
    gl.domElement.style.cursor = 'grabbing';
    onStart?.(event);
  }, [gl.domElement, onStart]);

  const handlePointerMove = useCallback((event) => {
    if (!state.current.isInteracting) return;
    
    event.preventDefault();
    
    const deltaX = event.clientX - state.current.lastPointerPosition.x;
    const deltaY = event.clientY - state.current.lastPointerPosition.y;
    
    if (event.pointerType === 'touch') {
      handleTouchMove(event, deltaX, deltaY);
    } else {
      handleMouseMove(event, deltaX, deltaY);
    }
    
    state.current.lastPointerPosition = { x: event.clientX, y: event.clientY };
    state.current.velocity = { x: deltaX, y: deltaY };
  }, []);

  const handleMouseMove = useCallback((event, deltaX, deltaY) => {
    if (event.buttons === 1) { // Left mouse button - rotate
      state.current.sphericalDelta.theta -= 2 * Math.PI * deltaX / size.width * ROTATE_SPEED_FACTOR;
      state.current.sphericalDelta.phi -= 2 * Math.PI * deltaY / size.height * ROTATE_SPEED_FACTOR;
    } else if (event.buttons === 2 || event.buttons === 4) { // Right or middle mouse button - pan
      const panVector = new THREE.Vector3();
      panVector.setFromMatrixColumn(camera.matrix, 0); // Get camera right vector
      panVector.multiplyScalar(-deltaX * PAN_SPEED_FACTOR);
      
      const upVector = new THREE.Vector3();
      upVector.setFromMatrixColumn(camera.matrix, 1); // Get camera up vector
      upVector.multiplyScalar(deltaY * PAN_SPEED_FACTOR);
      
      state.current.panOffset.add(panVector).add(upVector);
    }
  }, [camera, size]);

  const handleTouchMove = useCallback((event, deltaX, deltaY) => {
    state.current.touches.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId
    });
    
    const touchCount = state.current.touches.size;
    
    if (touchCount === 1) {
      // Single touch - rotate
      state.current.sphericalDelta.theta -= 2 * Math.PI * deltaX / size.width * ROTATE_SPEED_FACTOR;
      state.current.sphericalDelta.phi -= 2 * Math.PI * deltaY / size.height * ROTATE_SPEED_FACTOR;
    } else if (touchCount === 2) {
      // Two finger gesture - pan or zoom
      const touches = Array.from(state.current.touches.values());
      const touch1 = touches[0];
      const touch2 = touches[1];
      
      const currentDistance = Math.sqrt(
        Math.pow(touch2.x - touch1.x, 2) + Math.pow(touch2.y - touch1.y, 2)
      );
      
      const currentCenter = new THREE.Vector2(
        (touch1.x + touch2.x) / 2,
        (touch1.y + touch2.y) / 2
      );
      
      if (state.current.lastTouchDistance > 0) {
        const distanceDelta = currentDistance - state.current.lastTouchDistance;
        const centerDelta = currentCenter.clone().sub(state.current.lastTouchCenter);
        
        if (Math.abs(distanceDelta) > TOUCH_ZOOM_THRESHOLD) {
          // Zoom gesture
          state.current.scale *= (1 - distanceDelta * 0.01 * ZOOM_SPEED_FACTOR);
        } else if (centerDelta.length() > TOUCH_PAN_THRESHOLD) {
          // Pan gesture
          const panVector = new THREE.Vector3();
          panVector.setFromMatrixColumn(camera.matrix, 0);
          panVector.multiplyScalar(-centerDelta.x * PAN_SPEED_FACTOR);
          
          const upVector = new THREE.Vector3();
          upVector.setFromMatrixColumn(camera.matrix, 1);
          upVector.multiplyScalar(centerDelta.y * PAN_SPEED_FACTOR);
          
          state.current.panOffset.add(panVector).add(upVector);
        }
      }
      
      state.current.lastTouchDistance = currentDistance;
      state.current.lastTouchCenter.copy(currentCenter);
    }
  }, [camera, size]);

  const handlePointerUp = useCallback((event) => {
    state.current.isInteracting = false;
    state.current.touches.delete(event.pointerId);
    
    if (state.current.touches.size === 0) {
      state.current.lastTouchDistance = 0;
      gl.domElement.style.cursor = 'grab';
      onEnd?.(event);
    }
  }, [gl.domElement, onEnd]);

  const handleWheel = useCallback((event) => {
    event.preventDefault();
    const scaleFactor = event.deltaY > 0 ? 1.1 : 0.9;
    state.current.scale *= scaleFactor;
  }, []);

  // Prevent context menu on right click
  const handleContextMenu = useCallback((event) => {
    event.preventDefault();
  }, []);

  // Set up event listeners
  useEffect(() => {
    const element = gl.domElement;
    
    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointercancel', handlePointerUp);
    element.addEventListener('wheel', handleWheel, { passive: false });
    element.addEventListener('contextmenu', handleContextMenu);
    
    // Set initial cursor
    element.style.cursor = 'grab';
    
    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerUp);
      element.removeEventListener('wheel', handleWheel);
      element.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [gl.domElement, handlePointerDown, handlePointerMove, handlePointerUp, handleWheel, handleContextMenu]);

  // Animation loop for smooth updates
  useFrame(() => {
    if (enableDamping) {
      updateCamera();
    }
  });

  return null;
};

export default EnhancedCameraController;

