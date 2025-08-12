import React, { useState } from 'react';
import { FileSpreadsheet, Download, CheckCircle, AlertCircle, Calculator, MapPin, Compass } from 'lucide-react';

// Utility functions for conversions and calculations
const convertArea = (areaInSqM, targetUnit) => {
  const conversions = {
    'm²': 1,
    'ft²': 10.764,
    'hectares': 0.0001,
    'acres': 0.000247105,
    'arpent': 0.000293,
    'perche': 0.0302,
    'toise': 0.278
  };
  
  return areaInSqM * conversions[targetUnit];
};

const formatBearing = (bearing, format = 'azimuth') => {
  switch (format) {
    case 'azimuth':
      return `${bearing.toFixed(6)}°`;
    
    case 'quadrant':
      let quad = '';
      let angle = 0;
      
      if (bearing <= 90) {
        quad = 'N';
        angle = bearing;
        if (angle > 0) quad += ` ${angle.toFixed(6)}° E`;
      } else if (bearing <= 180) {
        quad = 'S';
        angle = 180 - bearing;
        if (angle > 0) quad += ` ${angle.toFixed(6)}° E`;
      } else if (bearing <= 270) {
        quad = 'S';
        angle = bearing - 180;
        if (angle > 0) quad += ` ${angle.toFixed(6)}° W`;
      } else {
        quad = 'N';
        angle = 360 - bearing;
        if (angle > 0) quad += ` ${angle.toFixed(6)}° W`;
      }
      
      return quad;
    
    case 'dms':
      const degrees = Math.floor(bearing);
      const minutes = Math.floor((bearing - degrees) * 60);
      const seconds = ((bearing - degrees) * 60 - minutes) * 60;
      return `${degrees}° ${minutes}' ${seconds.toFixed(2)}"`;
    
    default:
      return `${bearing.toFixed(6)}°`;
  }
};

const calculatePolygonPerimeter = (points) => {
  if (points.length < 2) return 0;
  
  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    const distance = Math.sqrt(
      Math.pow(next.x - current.x, 2) + Math.pow(next.z - current.z, 2)
    );
    perimeter += distance;
  }
  
  return perimeter;
};

const ExcelExport = ({
  darkMode,
  // Land data
  units,
  totalAreaInSqM,
  subdivisions,
  landShape,
  // Measurement tools data
  tapeMeasurements,
  irregularPolygons,
  bearings,
  // Terrain data
  terrainEnabled,
  terrainPreset,
  // Comparison data
  selectedComparison,
  comparisonOptions
}) => {
  const [exporting, setExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeCalculations, setIncludeCalculations] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);

  const generateExcelReport = async () => {
    setExporting(true);
    
    try {
      // Dynamic import of XLSX to reduce initial bundle size
      const XLSX = await import('xlsx');
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // 1. Summary Sheet
      const summaryData = [
        ['LAND VISUALIZATION REPORT'],
        ['Generated on:', new Date().toLocaleString()],
        [''],
        ['PROPERTY SUMMARY'],
        ['Total Area (m²):', totalAreaInSqM.toFixed(6)],
        ['Total Area (acres):', convertArea(totalAreaInSqM, 'acres').toFixed(6)],
        ['Total Area (hectares):', convertArea(totalAreaInSqM, 'hectares').toFixed(6)],
        ['Total Area (ft²):', convertArea(totalAreaInSqM, 'ft²').toFixed(2)],
        [''],
        ['MEASUREMENTS SUMMARY'],
        ['Measuring Tape Lines:', tapeMeasurements?.length || 0],
        ['Irregular Polygons:', irregularPolygons?.length || 0],
        ['Compass Bearings:', bearings?.length || 0],
        ['Subdivisions:', subdivisions?.length || 0],
        [''],
        ['TERRAIN INFORMATION'],
        ['Terrain Elevation:', terrainEnabled ? 'Enabled' : 'Disabled'],
        ['Terrain Type:', terrainPreset || 'Flat'],
        ['']
      ];

      // Add comparison information if available
      if (selectedComparison && comparisonOptions) {
        const comparison = comparisonOptions.find(c => c.id === selectedComparison);
        if (comparison) {
          summaryData.push(
            ['COMPARISON OBJECT'],
            ['Type:', comparison.name],
            ['Individual Size:', `${comparison.area} m²`],
            ['Objects that fit:', Math.floor(totalAreaInSqM / comparison.area)],
            ['']
          );
        }
      }

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // 2. Area Calculations Sheet
      if (includeCalculations) {
        const calculationsData = [
          ['DETAILED AREA CALCULATIONS'],
          [''],
          ['Unit', 'Value', 'Conversion Factor', 'Area in m²', 'Notes'],
        ];

        units.forEach((unit, index) => {
          const conversionFactor = 1 / convertArea(1, unit.unit);
          calculationsData.push([
            unit.unit,
            unit.value,
            conversionFactor.toFixed(8),
            (unit.value / conversionFactor).toFixed(6),
            `Input ${index + 1}`
          ]);
        });

        calculationsData.push([''], ['SUBDIVISION CALCULATIONS'], ['']);
        
        if (subdivisions && subdivisions.length > 0) {
          calculationsData.push(['ID', 'Name', 'Width (m)', 'Length (m)', 'Area (m²)', 'Area (acres)', 'Position X', 'Position Z']);
          
          subdivisions.forEach((sub, index) => {
            calculationsData.push([
              sub.id || index + 1,
              sub.name || `Subdivision ${index + 1}`,
              sub.width?.toFixed(3) || 'N/A',
              sub.length?.toFixed(3) || 'N/A',
              ((sub.width || 0) * (sub.length || 0)).toFixed(6),
              convertArea((sub.width || 0) * (sub.length || 0), 'acres').toFixed(6),
              sub.x?.toFixed(3) || 'N/A',
              sub.z?.toFixed(3) || 'N/A'
            ]);
          });
        }

        const calculationsSheet = XLSX.utils.aoa_to_sheet(calculationsData);
        XLSX.utils.book_append_sheet(workbook, calculationsSheet, 'Area Calculations');
      }

      // 3. Measuring Tape Data
      if (tapeMeasurements && tapeMeasurements.length > 0) {
        const measurementData = [
          ['MEASURING TAPE MEASUREMENTS'],
          [''],
          ['ID', 'Name', 'Start X', 'Start Z', 'End X', 'End Z', 'Distance (m)', 'Distance (ft)', 'Bearing (°)', 'Timestamp']
        ];

        tapeMeasurements.forEach((measurement, index) => {
          const bearing = Math.atan2(
            measurement.endPoint.x - measurement.startPoint.x,
            measurement.endPoint.z - measurement.startPoint.z
          ) * (180 / Math.PI);
          const normalizedBearing = bearing < 0 ? bearing + 360 : bearing;

          measurementData.push([
            measurement.id || index + 1,
            measurement.name || `Measurement ${index + 1}`,
            measurement.startPoint.x.toFixed(6),
            measurement.startPoint.z.toFixed(6),
            measurement.endPoint.x.toFixed(6),
            measurement.endPoint.z.toFixed(6),
            measurement.distance.toFixed(6),
            (measurement.distance * 3.28084).toFixed(6),
            normalizedBearing.toFixed(6),
            measurement.timestamp || new Date().toISOString()
          ]);
        });

        const measurementSheet = XLSX.utils.aoa_to_sheet(measurementData);
        XLSX.utils.book_append_sheet(workbook, measurementSheet, 'Measuring Tape');
      }

      // 4. Compass Bearings Data
      if (bearings && bearings.length > 0) {
        const bearingData = [
          ['COMPASS BEARINGS'],
          [''],
          ['ID', 'Name', 'Start X', 'Start Z', 'End X', 'End Z', 'Distance (m)', 'True Bearing (°)', 'Quadrant Bearing', 'DMS Format', 'Magnetic Bearing (°)', 'Timestamp', 'Notes']
        ];

        bearings.forEach((bearing, index) => {
          const magneticBearing = bearing.bearing; // Add magnetic declination if needed
          
          bearingData.push([
            bearing.id || index + 1,
            bearing.name || `Bearing ${index + 1}`,
            bearing.startPoint.x.toFixed(6),
            bearing.startPoint.z.toFixed(6),
            bearing.endPoint.x.toFixed(6),
            bearing.endPoint.z.toFixed(6),
            bearing.distance.toFixed(6),
            bearing.bearing.toFixed(6),
            formatBearing(bearing.bearing, 'quadrant'),
            formatBearing(bearing.bearing, 'dms'),
            magneticBearing.toFixed(6),
            bearing.timestamp || new Date().toISOString(),
            bearing.notes || ''
          ]);
        });

        // Add traverse calculations if there are multiple bearings
        if (bearings.length > 2) {
          bearingData.push([''], ['TRAVERSE ANALYSIS'], ['']);
          
          let totalX = 0, totalZ = 0, totalDistance = 0;
          bearings.forEach(bearing => {
            const radians = (bearing.bearing * Math.PI) / 180;
            totalX += bearing.distance * Math.sin(radians);
            totalZ += bearing.distance * Math.cos(radians);
            totalDistance += bearing.distance;
          });
          
          const linearError = Math.sqrt(totalX * totalX + totalZ * totalZ);
          const relativeError = totalDistance > 0 ? linearError / totalDistance : 0;
          const errorRatio = relativeError > 0 ? `1:${Math.round(1 / relativeError)}` : 'Perfect';
          
          bearingData.push(
            ['Total Distance (m):', totalDistance.toFixed(6)],
            ['Linear Closure Error (m):', linearError.toFixed(6)],
            ['Relative Error:', relativeError.toFixed(8)],
            ['Error Ratio:', errorRatio],
            ['Precision Classification:', linearError < 0.1 ? 'Excellent' : linearError < 0.5 ? 'Good' : linearError < 1.0 ? 'Fair' : 'Poor']
          );
        }

        const bearingSheet = XLSX.utils.aoa_to_sheet(bearingData);
        XLSX.utils.book_append_sheet(workbook, bearingSheet, 'Compass Bearings');
      }

      // 5. Irregular Polygons Data
      if (irregularPolygons && irregularPolygons.length > 0) {
        const polygonData = [
          ['IRREGULAR POLYGONS'],
          [''],
          ['ID', 'Name', 'Area (m²)', 'Area (acres)', 'Perimeter (m)', 'Number of Points', 'Status', 'Timestamp']
        ];

        irregularPolygons.forEach((polygon, index) => {
          const perimeter = calculatePolygonPerimeter(polygon.points || []);
          
          polygonData.push([
            polygon.id || index + 1,
            polygon.name || `Polygon ${index + 1}`,
            polygon.area?.toFixed(6) || 0,
            convertArea(polygon.area || 0, 'acres').toFixed(6),
            perimeter.toFixed(6),
            polygon.points?.length || 0,
            polygon.isComplete ? 'Complete' : 'In Progress',
            polygon.timestamp || new Date().toISOString()
          ]);
        });

        // Add detailed point coordinates if requested
        if (includeDetails) {
          polygonData.push([''], ['POLYGON COORDINATES'], ['']);
          
          irregularPolygons.forEach((polygon, polyIndex) => {
            if (polygon.points && polygon.points.length > 0) {
              polygonData.push([`Polygon ${polyIndex + 1} Points:`]);
              polygonData.push(['Point #', 'X Coordinate', 'Z Coordinate']);
              
              polygon.points.forEach((point, pointIndex) => {
                polygonData.push([
                  pointIndex + 1,
                  point.x.toFixed(6),
                  point.z.toFixed(6)
                ]);
              });
              
              polygonData.push(['']);
            }
          });
        }

        const polygonSheet = XLSX.utils.aoa_to_sheet(polygonData);
        XLSX.utils.book_append_sheet(workbook, polygonSheet, 'Irregular Polygons');
      }

      // 6. Raw Data Sheet (if requested)
      if (includeRawData) {
        const rawData = [
          ['RAW DATA EXPORT'],
          [''],
          ['LAND SHAPE COORDINATES'],
          ['Point #', 'X', 'Z']
        ];

        if (landShape && landShape.length > 0) {
          landShape.forEach((point, index) => {
            rawData.push([
              index + 1,
              point.x.toFixed(6),
              point.z.toFixed(6)
            ]);
          });
        }

        rawData.push([''], ['ALL MEASUREMENT DATA (JSON)'], ['']);
        rawData.push(['Data Type', 'JSON Content']);
        rawData.push(['Measuring Tape', JSON.stringify(tapeMeasurements || [], null, 2)]);
        rawData.push(['Irregular Polygons', JSON.stringify(irregularPolygons || [], null, 2)]);
        rawData.push(['Compass Bearings', JSON.stringify(bearings || [], null, 2)]);
        rawData.push(['Subdivisions', JSON.stringify(subdivisions || [], null, 2)]);

        const rawSheet = XLSX.utils.aoa_to_sheet(rawData);
        XLSX.utils.book_append_sheet(workbook, rawSheet, 'Raw Data');
      }

      // Generate and download the file
      const fileName = `land_analysis_${new Date().toISOString().split('T')[0]}_${Date.now()}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
      
    } catch (error) {
      console.error('Excel export error:', error);
      alert('Error generating Excel report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const hasData = 
    (tapeMeasurements && tapeMeasurements.length > 0) ||
    (irregularPolygons && irregularPolygons.length > 0) ||
    (bearings && bearings.length > 0) ||
    (subdivisions && subdivisions.length > 0) ||
    totalAreaInSqM > 0;

  return (
    <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
      <div className={`p-4 border-b ${darkMode ? 'border-gray-600' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Excel Export
            </h3>
          </div>
          <div className={`px-2 py-1 text-xs rounded ${hasData ? (darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800') : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')}`}>
            {hasData ? 'Data Available' : 'No Data'}
          </div>
        </div>
        
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Export comprehensive land analysis report with detailed calculations, measurements, and survey data.
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Export Options */}
        <div className="space-y-3">
          <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Export Options
          </h4>
          
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeDetails}
                onChange={(e) => setIncludeDetails(e.target.checked)}
                className="rounded"
              />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Include detailed coordinates and measurements
              </span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeCalculations}
                onChange={(e) => setIncludeCalculations(e.target.checked)}
                className="rounded"
              />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Include calculation worksheets and formulas
              </span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeRawData}
                onChange={(e) => setIncludeRawData(e.target.checked)}
                className="rounded"
              />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Include raw data and JSON exports
              </span>
            </label>
          </div>
        </div>

        {/* Data Summary */}
        {hasData && (
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Data Summary
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Calculator className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    Measurements: {tapeMeasurements?.length || 0}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    Polygons: {irregularPolygons?.length || 0}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Compass className={`w-4 h-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    Bearings: {bearings?.length || 0}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    Subdivisions: {subdivisions?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Button */}
        <button
          onClick={generateExcelReport}
          disabled={exporting || !hasData}
          className={`w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
            !hasData
              ? darkMode
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : exporting
                ? darkMode
                  ? 'bg-green-700 text-green-200'
                  : 'bg-green-600 text-green-100'
                : exportComplete
                  ? darkMode
                    ? 'bg-green-600 text-white'
                    : 'bg-green-500 text-white'
                  : darkMode
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {exporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
              Generating Excel Report...
            </>
          ) : exportComplete ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Excel Report Generated!
            </>
          ) : !hasData ? (
            <>
              <AlertCircle className="w-4 h-4 mr-2" />
              No Data to Export
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Generate Excel Report
            </>
          )}
        </button>

        {!hasData && (
          <div className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>Create some measurements, polygons, or bearings to export data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelExport;