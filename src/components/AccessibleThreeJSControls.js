import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LiveRegion } from './AccessibilityUtils';

// Accessible 3D Camera Controls with keyboard navigation
export const AccessibleCameraControls = ({ 
  enabled = true,
  onFocusChange,
  subdivisions = [],
  selectedSubdivision = null,
  onSubdivisionSelect
}) => {
  const { camera, gl } = useThree();
  const [announcement, setAnnouncement] = useState('');
  const [keyboardMode, setKeyboardMode] = useState('camera'); // 'camera' or 'subdivision'
  const [focusedSubdivisionIndex, setFocusedSubdivisionIndex] = useState(0);
  const controlsRef = useRef();
  
  // Camera movement speeds
  const moveSpeed = 0.5;
  const rotateSpeed = 0.02;
  const zoomSpeed = 0.1;
  
  // Keyboard state tracking
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    rotateLeft: false,
    rotateRight: false,
    rotateUp: false,
    rotateDown: false
  });

  const announce = (message) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 2000);
  };

  // Get camera position description for screen readers
  const getCameraDescription = () => {
    const position = camera.position;
    const distance = Math.sqrt(position.x * position.x + position.z * position.z);
    const height = position.y;
    
    return `Camera at distance ${distance.toFixed(1)} meters, height ${height.toFixed(1)} meters`;
  };

  // Get subdivision navigation description
  const getSubdivisionDescription = (index) => {
    const subdivision = subdivisions[index];
    if (!subdivision) return '';
    
    const area = subdivision.area || 0;
    return `${subdivision.name || `Subdivision ${index + 1}`}, area: ${area.toFixed(2)} square meters`;
  };

  // Keyboard event handlers
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      // Skip if user is typing in an input
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      const { key, ctrlKey, shiftKey, altKey } = event;

      // Toggle between camera and subdivision navigation modes
      if (key === 'Tab' && ctrlKey) {
        event.preventDefault();
        const newMode = keyboardMode === 'camera' ? 'subdivision' : 'camera';
        setKeyboardMode(newMode);
        announce(`Switched to ${newMode} navigation mode`);
        return;
      }

      // Camera navigation (WASD + Arrow keys)
      if (keyboardMode === 'camera') {
        switch (key.toLowerCase()) {
          case 'w':
          case 'arrowup':
            event.preventDefault();
            keys.current.forward = true;
            break;
          case 's':
          case 'arrowdown':
            event.preventDefault();
            keys.current.backward = true;
            break;
          case 'a':
          case 'arrowleft':
            if (shiftKey) {
              event.preventDefault();
              keys.current.rotateLeft = true;
            } else {
              event.preventDefault();
              keys.current.left = true;
            }
            break;
          case 'd':
          case 'arrowright':
            if (shiftKey) {
              event.preventDefault();
              keys.current.rotateRight = true;
            } else {
              event.preventDefault();
              keys.current.right = true;
            }
            break;
          case 'q':
            event.preventDefault();
            keys.current.up = true;
            break;
          case 'e':
            event.preventDefault();
            keys.current.down = true;
            break;
          case 'r':
            if (shiftKey) {
              event.preventDefault();
              keys.current.rotateUp = true;
            }
            break;
          case 'f':
            if (shiftKey) {
              event.preventDefault();
              keys.current.rotateDown = true;
            }
            break;
          case ' ':
            event.preventDefault();
            announce(getCameraDescription());
            break;
          case 'home':
            event.preventDefault();
            // Reset camera to default position
            camera.position.set(0, 10, 10);
            camera.lookAt(0, 0, 0);
            announce('Camera reset to default position');
            break;
        }
      }

      // Subdivision navigation
      else if (keyboardMode === 'subdivision' && subdivisions.length > 0) {
        switch (key) {
          case 'ArrowUp':
          case 'ArrowLeft':
            event.preventDefault();
            const prevIndex = (focusedSubdivisionIndex - 1 + subdivisions.length) % subdivisions.length;
            setFocusedSubdivisionIndex(prevIndex);
            announce(`Previous: ${getSubdivisionDescription(prevIndex)}`);
            break;
          case 'ArrowDown':
          case 'ArrowRight':
            event.preventDefault();
            const nextIndex = (focusedSubdivisionIndex + 1) % subdivisions.length;
            setFocusedSubdivisionIndex(nextIndex);
            announce(`Next: ${getSubdivisionDescription(nextIndex)}`);
            break;
          case 'Enter':
          case ' ':
            event.preventDefault();
            const selectedSub = subdivisions[focusedSubdivisionIndex];
            if (selectedSub && onSubdivisionSelect) {
              onSubdivisionSelect(selectedSub);
              announce(`Selected: ${getSubdivisionDescription(focusedSubdivisionIndex)}`);
              
              // Focus camera on selected subdivision
              if (selectedSub.position) {
                camera.position.set(
                  selectedSub.position.x,
                  camera.position.y,
                  selectedSub.position.z + 5
                );
                camera.lookAt(selectedSub.position.x, 0, selectedSub.position.z);
              }
            }
            break;
          case 'Escape':
            event.preventDefault();
            setKeyboardMode('camera');
            announce('Switched to camera navigation mode');
            break;
        }
      }

      // Global shortcuts
      switch (key) {
        case 'h':
          if (ctrlKey) {
            event.preventDefault();
            announceHelp();
          }
          break;
        case '?':
          event.preventDefault();
          announceHelp();
          break;
      }
    };

    const handleKeyUp = (event) => {
      const { key, shiftKey } = event;
      
      if (keyboardMode === 'camera') {
        switch (key.toLowerCase()) {
          case 'w':
          case 'arrowup':
            keys.current.forward = false;
            break;
          case 's':
          case 'arrowdown':
            keys.current.backward = false;
            break;
          case 'a':
          case 'arrowleft':
            keys.current.left = false;
            keys.current.rotateLeft = false;
            break;
          case 'd':
          case 'arrowright':
            keys.current.right = false;
            keys.current.rotateRight = false;
            break;
          case 'q':
            keys.current.up = false;
            break;
          case 'e':
            keys.current.down = false;
            break;
          case 'r':
            keys.current.rotateUp = false;
            break;
          case 'f':
            keys.current.rotateDown = false;
            break;
        }
      }
    };

    const announceHelp = () => {
      const helpText = keyboardMode === 'camera' 
        ? 'Camera controls: WASD or arrow keys to move, Q/E for up/down, Shift+A/D to rotate, Space for position, Home to reset, Ctrl+Tab to switch to subdivision mode'
        : 'Subdivision navigation: Arrow keys to navigate, Enter to select, Escape to return to camera mode, Ctrl+Tab to switch modes';
      announce(helpText);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    enabled, keyboardMode, focusedSubdivisionIndex, subdivisions, 
    camera, onSubdivisionSelect
  ]);

  // Camera movement frame loop
  useFrame((state, delta) => {
    if (!enabled || keyboardMode !== 'camera') return;

    const camera = state.camera;
    const speed = moveSpeed * delta * 60; // Normalize for 60fps
    const rotSpeed = rotateSpeed * delta * 60;

    // Get camera direction vectors
    const forward = new THREE.Vector3(0, 0, -1);
    const right = new THREE.Vector3(1, 0, 0);
    const up = new THREE.Vector3(0, 1, 0);
    
    forward.applyQuaternion(camera.quaternion);
    right.applyQuaternion(camera.quaternion);

    // Movement
    if (keys.current.forward) {
      camera.position.addScaledVector(forward, speed);
    }
    if (keys.current.backward) {
      camera.position.addScaledVector(forward, -speed);
    }
    if (keys.current.left) {
      camera.position.addScaledVector(right, -speed);
    }
    if (keys.current.right) {
      camera.position.addScaledVector(right, speed);
    }
    if (keys.current.up) {
      camera.position.addScaledVector(up, speed);
    }
    if (keys.current.down) {
      camera.position.addScaledVector(up, -speed);
    }

    // Rotation
    if (keys.current.rotateLeft) {
      camera.rotateY(rotSpeed);
    }
    if (keys.current.rotateRight) {
      camera.rotateY(-rotSpeed);
    }
    if (keys.current.rotateUp) {
      camera.rotateX(rotSpeed);
    }
    if (keys.current.rotateDown) {
      camera.rotateX(-rotSpeed);
    }
  });

  // Announce mode changes
  useEffect(() => {
    if (onFocusChange) {
      onFocusChange(keyboardMode === 'subdivision' ? focusedSubdivisionIndex : null);
    }
  }, [keyboardMode, focusedSubdivisionIndex, onFocusChange]);

  return (
    <>
      <LiveRegion priority="polite">
        {announcement}
      </LiveRegion>
      
      {/* Visual indicator for keyboard navigation mode */}
      {enabled && (
        <div 
          className="fixed top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-md text-sm z-50"
          role="status"
          aria-live="polite"
        >
          {keyboardMode === 'camera' 
            ? '🎥 Camera Mode (Ctrl+Tab: Switch)' 
            : `📍 Subdivision Mode (${focusedSubdivisionIndex + 1}/${subdivisions.length})`
          }
        </div>
      )}
    </>
  );
};

// Accessible Subdivision Focus Indicator
export const SubdivisionFocusIndicator = ({ 
  subdivisions, 
  focusedIndex, 
  enabled 
}) => {
  if (!enabled || focusedIndex === null || !subdivisions[focusedIndex]) {
    return null;
  }

  const subdivision = subdivisions[focusedIndex];
  
  return (
    <mesh
      position={[subdivision.position?.x || 0, 0.01, subdivision.position?.z || 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[subdivision.size * 1.1, subdivision.size * 1.2, 32]} />
      <meshBasicMaterial 
        color="#ffff00" 
        transparent 
        opacity={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Audio feedback for 3D interactions
export const useAudioFeedback = () => {
  const audioContext = useRef(null);
  
  useEffect(() => {
    // Initialize Web Audio API
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  const playTone = (frequency, duration = 200, volume = 0.1) => {
    if (!audioContext.current) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.current.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + duration / 1000);
    
    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + duration / 1000);
  };

  return {
    playSelectSound: () => playTone(800, 150),
    playNavigateSound: () => playTone(600, 100),
    playErrorSound: () => playTone(300, 300),
    playConfirmSound: () => playTone(1000, 200)
  };
};

// Screen reader area announcements
export const AreaAnnouncer = ({ 
  subdivisions, 
  selectedSubdivision, 
  currentArea 
}) => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (selectedSubdivision) {
      const area = selectedSubdivision.area || 0;
      const name = selectedSubdivision.name || 'Unnamed subdivision';
      setAnnouncement(`Selected ${name}, area: ${area.toFixed(2)} square meters`);
    }
  }, [selectedSubdivision]);

  useEffect(() => {
    if (currentArea) {
      setAnnouncement(`Drawing area: ${currentArea.toFixed(2)} square meters`);
    }
  }, [currentArea]);

  return (
    <LiveRegion priority="assertive">
      {announcement}
    </LiveRegion>
  );
};

export default AccessibleCameraControls;