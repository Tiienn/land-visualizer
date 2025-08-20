import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getAvailableUnits } from '../services/unitConversions';

// Linear unit conversion factors to meters
const linearUnits = {
  'm': 1,
  'ft': 0.3048,
  'yd': 0.9144
};

// Shape types supported
const SHAPES = {
  RECTANGLE: 'rectangle',
  SQUARE: 'square',
  CIRCLE: 'circle'
};

/**
 * Modal component for entering precise dimensions to create subdivisions
 */
export function EnterDimensionsModal({
  isOpen,
  onClose,
  onCreateSubdivision,
  onPreview,
  darkMode = false
}) {
  const [shape, setShape] = useState(SHAPES.RECTANGLE);
  const [dimensions, setDimensions] = useState({
    width: '',
    height: '',
    radius: '',
    area: 0
  });
  const [units, setUnits] = useState({
    linear: 'm',
    area: 'm²'
  });
  const [name, setName] = useState('');
  const [validation, setValidation] = useState({
    isValid: false,
    errors: []
  });
  const [placementMode, setPlacementMode] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const availableAreaUnits = getAvailableUnits();
  const availableLinearUnits = Object.keys(linearUnits);

  // Calculate area when dimensions change
  useEffect(() => {
    calculateArea();
  }, [dimensions.width, dimensions.height, dimensions.radius, shape, units.linear]);

  // Validate inputs
  useEffect(() => {
    validateInputs();
  }, [dimensions, shape]);

  // Generate default name
  useEffect(() => {
    if (!name && isOpen) {
      setName('Subdivision 1');
    }
  }, [isOpen, name]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const calculateArea = () => {
    let area = 0;
    const linearFactor = linearUnits[units.linear];

    try {
      if (shape === SHAPES.RECTANGLE) {
        const width = parseFloat(dimensions.width);
        const height = parseFloat(dimensions.height);
        if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
          // Convert to meters first, then calculate area
          const widthInMeters = width * linearFactor;
          const heightInMeters = height * linearFactor;
          area = widthInMeters * heightInMeters;
        }
      } else if (shape === SHAPES.SQUARE) {
        const width = parseFloat(dimensions.width);
        if (!isNaN(width) && width > 0) {
          const widthInMeters = width * linearFactor;
          area = widthInMeters * widthInMeters;
        }
      } else if (shape === SHAPES.CIRCLE) {
        const radius = parseFloat(dimensions.radius);
        if (!isNaN(radius) && radius > 0) {
          const radiusInMeters = radius * linearFactor;
          area = Math.PI * radiusInMeters * radiusInMeters;
        }
      }
    } catch (error) {
      area = 0;
    }

    setDimensions(prev => ({ ...prev, area }));
  };

  const validateInputs = () => {
    const errors = [];
    let isValid = true;

    if (shape === SHAPES.RECTANGLE) {
      const width = parseFloat(dimensions.width);
      const height = parseFloat(dimensions.height);
      
      if (isNaN(width) || width <= 0) {
        errors.push('Width must be a positive number');
        isValid = false;
      }
      if (isNaN(height) || height <= 0) {
        errors.push('Height must be a positive number');
        isValid = false;
      }
      if (width > 10000 || height > 10000) {
        errors.push('Dimensions cannot exceed 10,000 units');
        isValid = false;
      }
    } else if (shape === SHAPES.SQUARE) {
      const width = parseFloat(dimensions.width);
      
      if (isNaN(width) || width <= 0) {
        errors.push('Side length must be a positive number');
        isValid = false;
      }
      if (width > 10000) {
        errors.push('Side length cannot exceed 10,000 units');
        isValid = false;
      }
    } else if (shape === SHAPES.CIRCLE) {
      const radius = parseFloat(dimensions.radius);
      
      if (isNaN(radius) || radius <= 0) {
        errors.push('Radius must be a positive number');
        isValid = false;
      }
      if (radius > 10000) {
        errors.push('Radius cannot exceed 10,000 units');
        isValid = false;
      }
    }

    if (!name || !name.trim()) {
      errors.push('Name is required');
      isValid = false;
    }

    setValidation({ isValid, errors });
  };

  const handleShapeChange = (newShape) => {
    setShape(newShape);
    // Reset dimensions when shape changes
    setDimensions({
      width: '',
      height: '',
      radius: '',
      area: 0
    });
  };

  const handleDimensionChange = (field, value) => {
    setDimensions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Drag handling for movable modal in preview mode
  const handleMouseDown = (e) => {
    if (!placementMode) return;
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !placementMode) return;
    setModalPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handlePreview = () => {
    if (!validation.isValid || !onPreview) return;
    
    // Create subdivision data for preview
    const subdivisionData = {
      shape,
      dimensions: {
        width: dimensions.width,
        height: dimensions.height,
        radius: dimensions.radius,
        area: dimensions.area,
        linearUnit: units.linear,
        areaUnit: units.area
      },
      name: name || `Preview ${shape}`,
      area: dimensions.area,
      type: shape,
      // Add preview-specific properties
      isPreview: true,
      color: '#fbbf24', // Yellow preview color
      label: 'Preview'
    };

    // Convert dimensions to world units (meters) for 3D scene
    const conversionFactor = linearUnits[units.linear];
    let worldDimensions = {};
    
    if (shape === SHAPES.RECTANGLE || shape === SHAPES.SQUARE) {
      worldDimensions.width = parseFloat(dimensions.width || dimensions.height) * conversionFactor;
      worldDimensions.height = parseFloat(dimensions.height || dimensions.width) * conversionFactor;
    } else if (shape === SHAPES.CIRCLE) {
      worldDimensions.radius = parseFloat(dimensions.radius) * conversionFactor;
      worldDimensions.width = worldDimensions.radius * 2;
      worldDimensions.height = worldDimensions.radius * 2;
    }

    const previewData = {
      ...subdivisionData,
      ...worldDimensions,
      position: { x: 0, z: 0 }, // Will be positioned by user click
      editable: false
    };

    onPreview(previewData);
    setPlacementMode(true);
    
    // Position modal to the right side of the screen for better 3D scene visibility
    setModalPosition({
      x: window.innerWidth - 420, // 420px is approximate modal width + margin
      y: 100 // Top margin from top of screen
    });
  };

  const handleCreate = () => {
    if (!validation.isValid) return;
    
    const subdivisionData = {
      shape,
      dimensions: {
        ...dimensions,
        linearUnit: units.linear,
        areaUnit: units.area
      },
      name,
      area: dimensions.area
    };

    // Clear preview before creating
    if (onPreview && placementMode) {
      onPreview(null);
    }

    onCreateSubdivision(subdivisionData);
    handleClose();
  };

  const handleClose = () => {
    setShape(SHAPES.RECTANGLE);
    setDimensions({
      width: '',
      height: '',
      radius: '',
      area: 0
    });
    setUnits({
      linear: 'm',
      area: 'm²'
    });
    setName('');
    setPlacementMode(false);
    
    // Reset modal position
    setModalPosition({ x: 0, y: 0 });
    setIsDragging(false);
    
    // Clear preview if one exists
    if (onPreview) {
      onPreview(null);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Background overlay - only show when not in placement mode */}
      {!placementMode && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />}
      
      {/* Modal container */}
      <div 
        className={`fixed z-50 rounded-lg shadow-xl ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        } ${
          placementMode 
            ? 'w-96 border-2 border-yellow-400' // Compact draggable modal
            : 'max-w-lg w-full mx-4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' // Centered modal
        }`}
        style={placementMode ? {
          left: modalPosition.x + 'px',
          top: modalPosition.y + 'px',
          cursor: isDragging ? 'grabbing' : 'auto'
        } : {}}
      >
        {/* Header */}
        <div 
          className={`flex justify-between items-center p-4 ${
            placementMode 
              ? 'cursor-grab border-b bg-yellow-50 dark:bg-yellow-900/20' 
              : 'pb-2 mb-6 p-6'
          }`}
          onMouseDown={handleMouseDown}
        >
          <h2 className={`font-semibold ${placementMode ? 'text-lg' : 'text-xl'}`}>
            {placementMode ? '🎯 Preview Mode' : 'Enter Dimensions'}
          </h2>
          <button
            onClick={handleClose}
            className={`p-1 rounded-md transition-colors ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className={`${placementMode ? 'p-4 space-y-4' : 'p-6 space-y-6'}`}>
            
            {/* Compact Preview Mode Layout */}
            {placementMode && (
              <div className="space-y-3">
                {/* Quick Summary */}
                <div className={`p-3 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Shape:</span>
                    <span className="capitalize">{shape}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="font-medium">Size:</span>
                    <span>
                      {shape === 'circle' 
                        ? `${dimensions.radius}${units.linear} radius`
                        : `${dimensions.width} × ${dimensions.height}${units.linear}`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="font-medium">Area:</span>
                    <span className="font-semibold">{dimensions.area.toFixed(2)} m²</span>
                  </div>
                </div>

                {/* Preview Instructions */}
                <div className={`p-3 rounded-lg border-l-4 border-yellow-500 ${
                  darkMode ? 'bg-yellow-900 bg-opacity-20' : 'bg-yellow-50'
                }`}>
                  <p className={`text-sm ${
                    darkMode ? 'text-yellow-200' : 'text-yellow-800'
                  }`}>
                    <strong>🎯 Preview Active:</strong> The {shape} is visible in the 3D scene. 
                    You can drag this window to see better. Click Confirm & Create when ready!
                  </p>
                </div>
              </div>
            )}

            {/* Full Form Mode Layout */}
            {!placementMode && (
              <div className="space-y-6">
            {/* Shape Selection */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Shape Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(SHAPES).map(([key, value]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleShapeChange(value)}
                    className={`p-3 rounded-md border-2 transition-all ${
                      shape === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : darkMode
                          ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {key.charAt(0) + key.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions Input */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Dimensions
              </label>
              
              <div className="space-y-4">
                {/* Linear Unit Selection */}
                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Linear Unit
                  </label>
                  <select
                    value={units.linear}
                    onChange={(e) => setUnits(prev => ({ ...prev, linear: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {availableLinearUnits.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                {/* Shape-specific inputs */}
                {shape === SHAPES.RECTANGLE && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label 
                        htmlFor="width-input"
                        className={`block text-sm font-medium mb-2 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Width ({units.linear})
                      </label>
                      <input
                        id="width-input"
                        type="number"
                        step="0.01"
                        min="0"
                        value={dimensions.width}
                        onChange={(e) => handleDimensionChange('width', e.target.value)}
                        placeholder="0.00"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label 
                        htmlFor="height-input"
                        className={`block text-sm font-medium mb-2 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Height ({units.linear})
                      </label>
                      <input
                        id="height-input"
                        type="number"
                        step="0.01"
                        min="0"
                        value={dimensions.height}
                        onChange={(e) => handleDimensionChange('height', e.target.value)}
                        placeholder="0.00"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {shape === SHAPES.SQUARE && (
                  <div>
                    <label 
                      htmlFor="side-length-input"
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Side Length ({units.linear})
                    </label>
                    <input
                      id="side-length-input"
                      type="number"
                      step="0.01"
                      min="0"
                      value={dimensions.width}
                      onChange={(e) => handleDimensionChange('width', e.target.value)}
                      placeholder="0.00"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                )}

                {shape === SHAPES.CIRCLE && (
                  <div>
                    <label 
                      htmlFor="radius-input"
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Radius ({units.linear})
                    </label>
                    <input
                      id="radius-input"
                      type="number"
                      step="0.01"
                      min="0"
                      value={dimensions.radius}
                      onChange={(e) => handleDimensionChange('radius', e.target.value)}
                      placeholder="0.00"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                )}

                {/* Calculated Area Display */}
                <div className={`p-3 rounded-md ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Calculated Area:</span>
                    <span className="text-lg font-semibold">
                      {dimensions.area > 0 ? `${dimensions.area.toFixed(2)} m²` : '0 m²'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label 
                htmlFor="name-input"
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Name
              </label>
              <input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Subdivision name"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Placement Instructions */}
            <div className={`p-4 rounded-md border-l-4 ${
              placementMode 
                ? `border-yellow-500 ${darkMode ? 'bg-yellow-900 bg-opacity-20' : 'bg-yellow-50'}`
                : `border-blue-500 ${darkMode ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50'}`
            }`}>
              <p className={`text-sm ${
                placementMode
                  ? (darkMode ? 'text-yellow-200' : 'text-yellow-800')
                  : (darkMode ? 'text-blue-200' : 'text-blue-800')
              }`}>
                {placementMode ? (
                  <>
                    <strong>Preview Active:</strong> A preview shape is now visible in the 3D scene. 
                    Click anywhere on the terrain to place it, or click Create to confirm placement at center, or Cancel to exit preview mode.
                  </>
                ) : (
                  <>
                    <strong>Placement:</strong> Click Preview to see the shape in 3D, or Create to place at center of terrain.
                  </>
                )}
              </p>
            </div>

            {/* Validation Errors */}
            {validation.errors.length > 0 && (
              <div className={`p-3 rounded-md ${
                darkMode ? 'bg-red-900 bg-opacity-20 border border-red-800' : 'bg-red-50 border border-red-200'
              }`}>
                <ul className={`text-sm space-y-1 ${
                  darkMode ? 'text-red-200' : 'text-red-800'
                }`}>
                  {validation.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={`flex justify-end space-x-3 ${placementMode ? 'mt-4 px-4 pb-4' : 'mt-6'}`}>
            <button
              type="button"
              onClick={handleClose}
              className={`${placementMode ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} rounded-md font-medium transition-colors ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            {!placementMode && (
              <button
                type="button"
                onClick={handlePreview}
                disabled={!validation.isValid}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  validation.isValid
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                Preview
              </button>
            )}
            <button
              type="button"
              onClick={handleCreate}
              disabled={!validation.isValid}
              className={`${placementMode ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} rounded-md font-medium transition-colors ${
                validation.isValid
                  ? `${placementMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${placementMode ? 'focus:ring-yellow-500' : 'focus:ring-green-500'}`
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              {placementMode ? 'Confirm & Create' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default EnterDimensionsModal;