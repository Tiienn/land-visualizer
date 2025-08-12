import { useState, useCallback, useMemo } from 'react';

export const useLandCalculations = () => {
  const [units, setUnits] = useState([{ value: 1000, unit: 'm²' }]);

  // Unit conversions to square meters (arranged by popularity, m² first)
  const unitConversions = useMemo(() => ({
    'm²': 1,                   // Square meters (most popular metric)
    'ft²': 0.09290304,         // Square feet (most popular imperial)
    'acres': 4046.86,          // Acres (very popular for land)
    'hectares': 10000,         // Hectares (popular metric for large areas)
    'yd²': 0.83612736,         // Square yards (common in US)
    'km²': 1000000,            // Square kilometers (for very large areas)
    'arpent': 3419,            // Arpent (traditional French/Louisiana)
    'perche': 25.29285264,     // Perche (traditional British)
    'toise': 3.7987            // Toise (historical French - least popular)
  }), []);

  // Calculate total area from units input
  const totalAreaInSqM = useMemo(() => {
    return units.reduce((total, unitItem) => {
      const value = parseFloat(unitItem.value) || 0;
      const conversionFactor = unitConversions[unitItem.unit] || 1;
      return total + (value * conversionFactor);
    }, 0);
  }, [units, unitConversions]);

  const addUnit = useCallback(() => {
    const newUnits = [...units, { value: 0, unit: 'm²' }];
    setUnits(newUnits);
  }, [units]);

  const updateUnit = useCallback((index, field, value) => {
    const newUnits = [...units];
    newUnits[index] = { ...newUnits[index], [field]: value };
    setUnits(newUnits);
  }, [units]);

  const removeUnit = useCallback((index) => {
    if (units.length > 1) {
      const newUnits = units.filter((_, i) => i !== index);
      setUnits(newUnits);
    }
  }, [units]);

  const formatNumber = useCallback((num) => {
    if (num < 1000) return num.toFixed(2);
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    return (num / 1000000).toFixed(1) + 'M';
  }, []);

  return {
    units,
    setUnits,
    unitConversions,
    totalAreaInSqM,
    addUnit,
    updateUnit,
    removeUnit,
    formatNumber
  };
};