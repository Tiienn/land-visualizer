import React, { useEffect, useState, useRef } from 'react';
import { LiveRegion, ScreenReaderOnly } from './AccessibilityUtils';

// Enhanced screen reader support for land measurements and subdivisions
export const MeasurementScreenReader = ({ 
  subdivisions = [], 
  selectedSubdivision = null,
  measurements = [],
  totalArea = 0,
  currentDrawingArea = 0,
  drawingMode = null,
  units = 'square meters'
}) => {
  const [announcement, setAnnouncement] = useState('');
  const [detailedInfo, setDetailedInfo] = useState('');
  const previousSubdivisionRef = useRef(null);
  const previousMeasurementsRef = useRef([]);

  // Announce when subdivisions change
  useEffect(() => {
    if (subdivisions.length !== (previousSubdivisionRef.current?.length || 0)) {
      const count = subdivisions.length;
      const totalAreaValue = subdivisions.reduce((sum, sub) => sum + (sub.area || 0), 0);
      
      setAnnouncement(
        `${count} subdivision${count !== 1 ? 's' : ''} on land. ` +
        `Total area: ${totalAreaValue.toFixed(2)} ${units}`
      );
      
      previousSubdivisionRef.current = subdivisions;
    }
  }, [subdivisions, units]);

  // Announce when selected subdivision changes
  useEffect(() => {
    if (selectedSubdivision) {
      const area = selectedSubdivision.area || 0;
      const name = selectedSubdivision.name || 'Unnamed subdivision';
      const corners = selectedSubdivision.corners?.length || selectedSubdivision.points?.length || 0;
      
      let description = `Selected ${name}. Area: ${area.toFixed(2)} ${units}`;
      
      if (corners > 0) {
        description += `. ${corners} corner${corners !== 1 ? 's' : ''}`;
      }
      
      if (selectedSubdivision.perimeter) {
        description += `. Perimeter: ${selectedSubdivision.perimeter.toFixed(2)} meters`;
      }
      
      setAnnouncement(description);
      
      // Set detailed info for screen reader exploration
      setDetailedInfo(generateDetailedSubdivisionInfo(selectedSubdivision));
    }
  }, [selectedSubdivision, units]);

  // Announce when measurements change
  useEffect(() => {
    const newMeasurements = measurements.filter(m => 
      !previousMeasurementsRef.current.some(pm => pm.id === m.id)
    );
    
    if (newMeasurements.length > 0) {
      newMeasurements.forEach(measurement => {
        const distance = measurement.distance || 0;
        const bearing = measurement.bearing || 'unknown bearing';
        
        setAnnouncement(
          `New measurement: ${distance.toFixed(2)} meters at ${bearing}`
        );
      });
    }
    
    previousMeasurementsRef.current = measurements;
  }, [measurements]);

  // Announce drawing progress
  useEffect(() => {
    if (currentDrawingArea > 0 && drawingMode) {
      setAnnouncement(
        `Drawing ${drawingMode}. Current area: ${currentDrawingArea.toFixed(2)} ${units}`
      );
    }
  }, [currentDrawingArea, drawingMode, units]);

  // Generate detailed subdivision information
  const generateDetailedSubdivisionInfo = (subdivision) => {
    if (!subdivision) return '';
    
    let info = `Detailed information for ${subdivision.name || 'subdivision'}:\n`;
    info += `Area: ${(subdivision.area || 0).toFixed(2)} ${units}\n`;
    
    if (subdivision.perimeter) {
      info += `Perimeter: ${subdivision.perimeter.toFixed(2)} meters\n`;
    }
    
    if (subdivision.corners || subdivision.points) {
      const points = subdivision.corners || subdivision.points;
      info += `Coordinates:\n`;
      points.forEach((point, index) => {
        info += `  Corner ${index + 1}: X: ${point.x?.toFixed(2) || 'N/A'}, Y: ${point.y?.toFixed(2) || 'N/A'}`;
        if (point.z) info += `, Z: ${point.z.toFixed(2)}`;
        info += '\n';
      });
    }
    
    if (subdivision.properties) {
      Object.entries(subdivision.properties).forEach(([key, value]) => {
        info += `${key}: ${value}\n`;
      });
    }
    
    return info;
  };

  return (
    <>
      <LiveRegion priority="polite">
        {announcement}
      </LiveRegion>
      
      <ScreenReaderOnly>
        <div tabIndex={0} role="region" aria-label="Detailed subdivision information">
          <h3>Current Selection Details</h3>
          <pre>{detailedInfo}</pre>
        </div>
      </ScreenReaderOnly>
    </>
  );
};

// Screen reader support for drawing operations
export const DrawingScreenReader = ({
  drawingMode,
  currentPoints = [],
  previewArea = 0,
  snapEnabled = false,
  gridSize = 1
}) => {
  const [announcement, setAnnouncement] = useState('');
  const previousPointsRef = useRef([]);

  useEffect(() => {
    if (drawingMode) {
      setAnnouncement(`${drawingMode} drawing mode activated. Click to start drawing.`);
    } else {
      setAnnouncement('Drawing mode deactivated.');
    }
  }, [drawingMode]);

  useEffect(() => {
    if (currentPoints.length > previousPointsRef.current.length) {
      const pointCount = currentPoints.length;
      let message = `Point ${pointCount} added`;
      
      if (previewArea > 0 && pointCount >= 3) {
        message += `. Preview area: ${previewArea.toFixed(2)} square meters`;
      }
      
      if (snapEnabled) {
        message += `. Snapped to ${gridSize}m grid`;
      }
      
      setAnnouncement(message);
    }
    
    previousPointsRef.current = currentPoints;
  }, [currentPoints, previewArea, snapEnabled, gridSize]);

  return (
    <LiveRegion priority="assertive">
      {announcement}
    </LiveRegion>
  );
};

// Screen reader support for measurement tools
export const MeasurementToolScreenReader = ({
  activeTool = null,
  currentMeasurement = null,
  measurements = [],
  bearingInfo = null
}) => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (activeTool === 'measuring-tape') {
      setAnnouncement('Measuring tape tool activated. Click two points to measure distance.');
    } else if (activeTool === 'bearing') {
      setAnnouncement('Bearing tool activated. Click two points to measure bearing and distance.');
    } else if (activeTool === null) {
      setAnnouncement('Measurement tool deactivated.');
    }
  }, [activeTool]);

  useEffect(() => {
    if (currentMeasurement) {
      const { distance, bearing, elevation } = currentMeasurement;
      let message = `Distance: ${distance?.toFixed(2) || 'calculating'} meters`;
      
      if (bearing) {
        message += `. Bearing: ${bearing}`;
      }
      
      if (elevation) {
        message += `. Elevation change: ${elevation.toFixed(2)} meters`;
      }
      
      setAnnouncement(message);
    }
  }, [currentMeasurement]);

  useEffect(() => {
    if (bearingInfo) {
      const { direction, degrees, minutes, seconds } = bearingInfo;
      setAnnouncement(
        `Bearing: ${direction} ${degrees} degrees ${minutes} minutes ${seconds} seconds`
      );
    }
  }, [bearingInfo]);

  return (
    <>
      <LiveRegion priority="polite">
        {announcement}
      </LiveRegion>
      
      {measurements.length > 0 && (
        <ScreenReaderOnly>
          <div tabIndex={0} role="region" aria-label="Measurement results">
            <h3>Measurements ({measurements.length})</h3>
            <ul>
              {measurements.map((measurement, index) => (
                <li key={measurement.id || index}>
                  Measurement {index + 1}: {measurement.distance?.toFixed(2)} meters
                  {measurement.bearing && `, bearing: ${measurement.bearing}`}
                  {measurement.elevation && `, elevation: ${measurement.elevation.toFixed(2)}m`}
                </li>
              ))}
            </ul>
          </div>
        </ScreenReaderOnly>
      )}
    </>
  );
};

// Screen reader support for layer management
export const LayerScreenReader = ({
  layers = [],
  activeLayer = null,
  visibleLayers = []
}) => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (activeLayer) {
      const layer = layers.find(l => l.id === activeLayer);
      if (layer) {
        setAnnouncement(`Active layer: ${layer.name}. ${layer.items?.length || 0} items.`);
      }
    }
  }, [activeLayer, layers]);

  useEffect(() => {
    const visibleCount = visibleLayers.length;
    const totalCount = layers.length;
    setAnnouncement(`${visibleCount} of ${totalCount} layers visible.`);
  }, [visibleLayers, layers]);

  return (
    <>
      <LiveRegion priority="polite">
        {announcement}
      </LiveRegion>
      
      <ScreenReaderOnly>
        <div tabIndex={0} role="region" aria-label="Layer information">
          <h3>Layer Status</h3>
          <ul>
            {layers.map(layer => (
              <li key={layer.id}>
                {layer.name}: {visibleLayers.includes(layer.id) ? 'Visible' : 'Hidden'}
                {layer.id === activeLayer && ' (Active)'}
                {layer.items && ` - ${layer.items.length} items`}
              </li>
            ))}
          </ul>
        </div>
      </ScreenReaderOnly>
    </>
  );
};

// Master screen reader coordinator
export const ScreenReaderCoordinator = ({
  children,
  context = {},
  enabled = true
}) => {
  const [globalAnnouncement, setGlobalAnnouncement] = useState('');
  const coordinatorRef = useRef(null);

  // Provide global announcement function to child components
  const announceGlobal = (message, priority = 'polite') => {
    setGlobalAnnouncement(message);
    setTimeout(() => setGlobalAnnouncement(''), 3000);
  };

  // Keyboard shortcuts for screen reader users
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      const { key, ctrlKey, altKey } = event;

      // Screen reader specific shortcuts
      if (altKey) {
        switch (key.toLowerCase()) {
          case 'i':
            event.preventDefault();
            announceApplicationInfo();
            break;
          case 's':
            event.preventDefault();
            announceSubdivisionSummary();
            break;
          case 'm':
            event.preventDefault();
            announceMeasurementSummary();
            break;
          case 'l':
            event.preventDefault();
            announceLayerSummary();
            break;
          case 'h':
            event.preventDefault();
            announceHelp();
            break;
        }
      }
    };

    const announceApplicationInfo = () => {
      const { subdivisions = [], totalArea = 0, units = 'square meters' } = context;
      announceGlobal(
        `Land Visualizer. ${subdivisions.length} subdivisions. ` +
        `Total area: ${totalArea.toFixed(2)} ${units}. ` +
        `Press Alt+H for help.`
      );
    };

    const announceSubdivisionSummary = () => {
      const { subdivisions = [], selectedSubdivision } = context;
      let message = `${subdivisions.length} subdivisions total.`;
      
      if (selectedSubdivision) {
        message += ` Selected: ${selectedSubdivision.name || 'Unnamed'}`;
      } else {
        message += ' No subdivision selected.';
      }
      
      announceGlobal(message);
    };

    const announceMeasurementSummary = () => {
      const { measurements = [] } = context;
      announceGlobal(`${measurements.length} measurement${measurements.length !== 1 ? 's' : ''} recorded.`);
    };

    const announceLayerSummary = () => {
      const { layers = [], visibleLayers = [] } = context;
      announceGlobal(`${visibleLayers.length} of ${layers.length} layers visible.`);
    };

    const announceHelp = () => {
      announceGlobal(
        'Screen reader shortcuts: Alt+I for app info, Alt+S for subdivisions, ' +
        'Alt+M for measurements, Alt+L for layers. ' +
        'Ctrl+Tab to switch between camera and subdivision navigation.'
      );
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, context]);

  if (!enabled) return children;

  return (
    <div ref={coordinatorRef}>
      {children}
      
      <LiveRegion priority="assertive">
        {globalAnnouncement}
      </LiveRegion>
      
      <ScreenReaderOnly>
        <div role="region" aria-label="Application status">
          <h2>Land Visualizer Status</h2>
          <p>
            Use Alt+I for application information, Alt+S for subdivision summary, 
            Alt+M for measurements, Alt+L for layers, Alt+H for help.
          </p>
        </div>
      </ScreenReaderOnly>
    </div>
  );
};

export default {
  MeasurementScreenReader,
  DrawingScreenReader,
  MeasurementToolScreenReader,
  LayerScreenReader,
  ScreenReaderCoordinator
};