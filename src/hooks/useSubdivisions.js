import { useState, useCallback, useMemo } from 'react';

export const useSubdivisions = () => {
  const [subdivisions, setSubdivisions] = useState([]);
  const [selectedSubdivision, setSelectedSubdivision] = useState(null);
  const [isDraggingSubdivisionCorner, setIsDraggingSubdivisionCorner] = useState(false);

  const subdivisionsTotal = useMemo(() => {
    return subdivisions.reduce((sum, sub) => sum + sub.area, 0);
  }, [subdivisions]);

  const addSubdivision = useCallback((subdivision) => {
    const newSubdivision = {
      ...subdivision,
      id: `subdivision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: `Area ${subdivisions.length + 1}`,
    };
    setSubdivisions(prev => [...prev, newSubdivision]);
  }, [subdivisions.length]);

  const deleteSubdivision = useCallback((id) => {
    setSubdivisions(prev => prev.filter(sub => sub.id !== id));
    if (selectedSubdivision === id) {
      setSelectedSubdivision(null);
    }
  }, [selectedSubdivision]);

  const updateSubdivision = useCallback((id, updates) => {
    setSubdivisions(prev => prev.map(sub => 
      sub.id === id ? { ...sub, ...updates } : sub
    ));
  }, []);

  const clearSubdivisions = useCallback(() => {
    setSubdivisions([]);
    setSelectedSubdivision(null);
  }, []);

  const selectSubdivision = useCallback((id) => {
    setSelectedSubdivision(id);
  }, []);

  const moveSubdivision = useCallback((id, newCenter) => {
    updateSubdivision(id, { center: newCenter });
  }, [updateSubdivision]);

  return {
    subdivisions,
    setSubdivisions,
    selectedSubdivision,
    setSelectedSubdivision,
    isDraggingSubdivisionCorner,
    setIsDraggingSubdivisionCorner,
    subdivisionsTotal,
    addSubdivision,
    deleteSubdivision,
    updateSubdivision,
    clearSubdivisions,
    selectSubdivision,
    moveSubdivision
  };
};