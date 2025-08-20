import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import ComparisonObject3D from './ComparisonObject3D';
import { defaultComparisons, arrangeComparisonObjects } from '../services/landCalculations';

/**
 * Manages and renders multiple instances of comparison objects in optimal arrangement
 * Includes performance optimization and object count display
 */
const ComparisonObjectsGroup = ({ 
  selectedComparison,
  totalAreaSquareMeters = 0,
  maxObjects = 50,
  darkMode = false,
  showLabel = true,
  scale = 1.0
}) => {
  // Get selected comparison data
  const comparisonData = useMemo(() => {
    if (!selectedComparison) return null;
    return defaultComparisons.find(c => c.id === selectedComparison);
  }, [selectedComparison]);
  
  // Calculate positions for multiple objects
  const objectPositions = useMemo(() => {
    if (!comparisonData || totalAreaSquareMeters <= 0) return [];
    return arrangeComparisonObjects(
      totalAreaSquareMeters, 
      comparisonData.area, 
      maxObjects
    );
  }, [totalAreaSquareMeters, comparisonData, maxObjects]);
  
  // Calculate appropriate scale based on land size and object density
  const dynamicScale = useMemo(() => {
    const landSize = Math.sqrt(totalAreaSquareMeters);
    const baseScale = scale;
    
    // Adjust scale based on land size
    if (landSize < 50) return baseScale * 0.8;
    if (landSize < 100) return baseScale * 0.9;
    if (landSize > 500) return baseScale * 1.2;
    return baseScale;
  }, [totalAreaSquareMeters, scale]);
  
  // Calculate quantity information for display
  const quantityInfo = useMemo(() => {
    if (!comparisonData || totalAreaSquareMeters <= 0) return null;
    
    const exactQuantity = totalAreaSquareMeters / comparisonData.area;
    const displayedQuantity = objectPositions.length;
    const isLimited = Math.floor(exactQuantity) > maxObjects;
    
    return {
      exact: exactQuantity,
      displayed: displayedQuantity,
      isLimited,
      percentage: displayedQuantity > 0 ? (displayedQuantity / exactQuantity) * 100 : 0
    };
  }, [comparisonData, totalAreaSquareMeters, objectPositions.length, maxObjects]);
  
  // Label text configuration
  const labelConfig = useMemo(() => {
    if (!showLabel || !comparisonData || !quantityInfo) return null;
    
    const { exact, displayed, isLimited } = quantityInfo;
    
    let labelText = '';
    if (displayed === 1) {
      labelText = `${comparisonData.name}`;
    } else if (isLimited) {
      labelText = `${displayed} × ${comparisonData.name} (of ${Math.floor(exact)} total)`;
    } else {
      labelText = `${displayed} × ${comparisonData.name}`;
    }
    
    return {
      text: labelText,
      color: darkMode ? '#ffffff' : '#000000',
      position: [0, 15, 0]
    };
  }, [showLabel, comparisonData, quantityInfo, darkMode]);
  
  // Performance: Only render if we have valid data
  if (!comparisonData || !comparisonData.geometry3D || objectPositions.length === 0) {
    return null;
  }
  
  return (
    <group name="comparison-objects-group">
      {/* Render object instances */}
      {objectPositions.map((pos, index) => (
        <ComparisonObject3D
          key={`${comparisonData.id}-${index}`}
          objectData={comparisonData}
          position={[pos.x, pos.y, pos.z]}
          scale={dynamicScale}
          visible={true}
        />
      ))}
      
      {/* Information label */}
      {labelConfig && (
        <Text
          position={labelConfig.position}
          fontSize={Math.max(2, dynamicScale * 2)}
          color={labelConfig.color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.1}
          outlineColor={darkMode ? '#000000' : '#ffffff'}
        >
          {labelConfig.text}
        </Text>
      )}
      
      {/* Performance and limitation indicators */}
      {quantityInfo?.isLimited && showLabel && (
        <Text
          position={[0, 12, 0]}
          fontSize={Math.max(1.5, dynamicScale * 1.5)}
          color={darkMode ? '#ffaa00' : '#ff6600'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor={darkMode ? '#000000' : '#ffffff'}
        >
          {`Showing ${Math.round(quantityInfo.percentage)}% (performance limit: ${maxObjects})`}
        </Text>
      )}
      
      {/* Area coverage indicator for single objects */}
      {objectPositions.length === 1 && quantityInfo && quantityInfo.exact < 1 && showLabel && (
        <Text
          position={[0, 10, 0]}
          fontSize={Math.max(1.2, dynamicScale * 1.2)}
          color={darkMode ? '#88cc88' : '#006600'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor={darkMode ? '#000000' : '#ffffff'}
        >
          {`Land covers ${(quantityInfo.exact * 100).toFixed(1)}% of ${comparisonData.name.toLowerCase()}`}
        </Text>
      )}
    </group>
  );
};

export default ComparisonObjectsGroup;