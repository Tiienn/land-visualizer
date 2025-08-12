import { useMemo } from 'react';
import * as THREE from 'three';

export const useThreeOptimizations = () => {
  // Pre-create materials to avoid recreation
  const materials = useMemo(() => ({
    landBase: new THREE.MeshLambertMaterial({ 
      color: '#22c55e', 
      transparent: true, 
      opacity: 0.3 
    }),
    landBorder: new THREE.LineBasicMaterial({ 
      color: '#16a34a', 
      linewidth: 2 
    }),
    subdivisionBase: new THREE.MeshLambertMaterial({ 
      transparent: true, 
      opacity: 0.6 
    }),
    gridLine: new THREE.LineBasicMaterial({ 
      color: '#64748b', 
      transparent: true, 
      opacity: 0.3 
    }),
    measurement: new THREE.LineBasicMaterial({ 
      color: '#ef4444', 
      linewidth: 3 
    })
  }), []);

  // Pre-create geometries to avoid recreation
  const geometries = useMemo(() => ({
    cornerPoint: new THREE.BoxGeometry(0.8, 0.8, 0.8),
    measurementPoint: new THREE.SphereGeometry(0.3, 8, 6),
    subdivisionBorder: new THREE.RingGeometry(0.1, 0.2, 8)
  }), []);

  // Color palette for subdivisions
  const subdivisionColors = useMemo(() => [
    '#8b5cf6', // purple
    '#ef4444', // red  
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#ec4899', // pink
  ], []);

  // Get optimized material for subdivision
  const getSubdivisionMaterial = useMemo(() => (colorIndex, isSelected = false) => {
    const color = subdivisionColors[colorIndex % subdivisionColors.length];
    return new THREE.MeshLambertMaterial({ 
      color, 
      transparent: true, 
      opacity: isSelected ? 0.8 : 0.6 
    });
  }, [subdivisionColors]);

  return {
    materials,
    geometries,
    subdivisionColors,
    getSubdivisionMaterial
  };
};