// Professional Import/Export Service for Land Visualizer
// Supports industry-standard formats for surveying and CAD workflows

// Coordinate System Support
export const COORDINATE_SYSTEMS = {
  WGS84: 'EPSG:4326',
  UTM_NORTH: 'EPSG:32633', // Example UTM Zone 33N
  STATE_PLANE: 'EPSG:2154', // Example State Plane
  LOCAL: 'LOCAL'
};

// Supported Professional Formats
export const SUPPORTED_FORMATS = {
  IMPORT: {
    DXF: { extension: '.dxf', description: 'AutoCAD Drawing Exchange Format' },
    DWG: { extension: '.dwg', description: 'AutoCAD Drawing Database' },
    SHP: { extension: '.shp', description: 'ESRI Shapefile' },
    KML: { extension: '.kml', description: 'Keyhole Markup Language' },
    CSV: { extension: '.csv', description: 'Comma-Separated Values with coordinates' },
    GPX: { extension: '.gpx', description: 'GPS Exchange Format' },
    GEOJSON: { extension: '.geojson', description: 'GeoJSON Format' }
  },
  EXPORT: {
    DXF: { extension: '.dxf', description: 'AutoCAD Drawing Exchange Format' },
    PDF: { extension: '.pdf', description: 'Portable Document Format' },
    EXCEL: { extension: '.xlsx', description: 'Microsoft Excel Workbook' },
    CSV: { extension: '.csv', description: 'Comma-Separated Values' },
    GEOJSON: { extension: '.geojson', description: 'GeoJSON Format' },
    KML: { extension: '.kml', description: 'Google Earth KML' },
    LEGAL_DESC: { extension: '.txt', description: 'Legal Description (Metes and Bounds)' }
  }
};

// Survey Data Import Service
export class SurveyDataImporter {
  constructor(coordinateSystem = COORDINATE_SYSTEMS.WGS84) {
    this.coordinateSystem = coordinateSystem;
    this.tolerance = 0.001; // Default tolerance in meters
  }

  // Import from CSV with coordinates
  async importFromCSV(file) {
    try {
      const text = await this.readFileAsText(file);
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Find coordinate columns
      const xIndex = this.findColumnIndex(headers, ['x', 'longitude', 'lon', 'easting']);
      const yIndex = this.findColumnIndex(headers, ['y', 'latitude', 'lat', 'northing']);
      const elevIndex = this.findColumnIndex(headers, ['z', 'elevation', 'elev', 'height']);
      const nameIndex = this.findColumnIndex(headers, ['name', 'label', 'point_id', 'id']);
      
      if (xIndex === -1 || yIndex === -1) {
        throw new Error('Could not find X/Y coordinate columns in CSV');
      }

      const points = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length < Math.max(xIndex, yIndex) + 1) continue;
        
        const point = {
          x: parseFloat(values[xIndex]),
          y: parseFloat(values[yIndex]),
          elevation: elevIndex !== -1 ? parseFloat(values[elevIndex]) || 0 : 0,
          name: nameIndex !== -1 ? values[nameIndex].trim() : `Point ${i}`,
          coordinateSystem: this.coordinateSystem
        };
        
        if (!isNaN(point.x) && !isNaN(point.y)) {
          points.push(point);
        }
      }
      
      return this.createSubdivisionsFromPoints(points);
    } catch (error) {
      throw new Error(`CSV Import Error: ${error.message}`);
    }
  }

  // Import from GeoJSON
  async importFromGeoJSON(file) {
    try {
      const text = await this.readFileAsText(file);
      const geoJson = JSON.parse(text);
      
      if (geoJson.type !== 'FeatureCollection' && geoJson.type !== 'Feature') {
        throw new Error('Invalid GeoJSON format');
      }
      
      const features = geoJson.type === 'FeatureCollection' ? geoJson.features : [geoJson];
      const subdivisions = [];
      
      features.forEach((feature, index) => {
        if (feature.geometry.type === 'Polygon') {
          const coordinates = feature.geometry.coordinates[0]; // Exterior ring
          const properties = feature.properties || {};
          
          const subdivision = {
            id: `import-${index}`,
            name: properties.name || properties.label || `Imported Area ${index + 1}`,
            points: coordinates.slice(0, -1).map(coord => ({ // Remove duplicate last point
              x: coord[0],
              y: coord[1],
              z: coord[2] || 0
            })),
            area: properties.area || this.calculatePolygonArea(coordinates),
            properties: properties
          };
          
          subdivisions.push(subdivision);
        }
      });
      
      return subdivisions;
    } catch (error) {
      throw new Error(`GeoJSON Import Error: ${error.message}`);
    }
  }

  // Helper methods
  findColumnIndex(headers, possibleNames) {
    for (const name of possibleNames) {
      const index = headers.findIndex(h => h.includes(name));
      if (index !== -1) return index;
    }
    return -1;
  }

  async readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = e => reject(new Error('File reading failed'));
      reader.readAsText(file);
    });
  }

  createSubdivisionsFromPoints(points) {
    // Create a simple polygon from points (you might want more sophisticated logic)
    if (points.length < 3) {
      throw new Error('Need at least 3 points to create a subdivision');
    }
    
    return [{
      id: 'imported-boundary',
      name: 'Imported Boundary',
      points: points,
      area: this.calculatePolygonArea(points.map(p => [p.x, p.y])),
      coordinateSystem: this.coordinateSystem
    }];
  }

  calculatePolygonArea(coordinates) {
    // Shoelace formula for polygon area
    let area = 0;
    const n = coordinates.length;
    
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += coordinates[i][0] * coordinates[j][1];
      area -= coordinates[j][0] * coordinates[i][1];
    }
    
    return Math.abs(area) / 2;
  }
}

// Professional Export Service
export class ProfessionalExporter {
  constructor() {
    this.precision = 6; // Decimal places for coordinates
    this.units = 'square meters';
  }

  // Export to DXF format (simplified)
  exportToDXF(subdivisions, metadata = {}) {
    const dxfContent = this.generateDXFContent(subdivisions, metadata);
    return this.createDownloadableFile(dxfContent, 'land-survey.dxf', 'text/plain');
  }

  generateDXFContent(subdivisions, metadata) {
    let dxf = `0\nSECTION\n2\nHEADER\n`;
    dxf += `9\n$ACADVER\n1\nAC1015\n`; // AutoCAD 2000 format
    dxf += `0\nENDSEC\n`;
    
    // Tables section
    dxf += `0\nSECTION\n2\nTABLES\n0\nENDSEC\n`;
    
    // Entities section
    dxf += `0\nSECTION\n2\nENTITIES\n`;
    
    subdivisions.forEach((subdivision, index) => {
      if (subdivision.points && subdivision.points.length >= 3) {
        // Create polyline for each subdivision
        dxf += `0\nPOLYLINE\n`;
        dxf += `8\nSubdivisions\n`; // Layer name
        dxf += `66\n1\n`; // Vertices follow flag
        dxf += `10\n0.0\n20\n0.0\n30\n0.0\n`; // Default location
        dxf += `70\n1\n`; // Closed polyline
        
        subdivision.points.forEach(point => {
          dxf += `0\nVERTEX\n`;
          dxf += `8\nSubdivisions\n`;
          dxf += `10\n${point.x.toFixed(this.precision)}\n`;
          dxf += `20\n${point.y.toFixed(this.precision)}\n`;
          dxf += `30\n${(point.z || 0).toFixed(this.precision)}\n`;
        });
        
        dxf += `0\nSEQEND\n`;
        
        // Add text label
        const centerX = subdivision.points.reduce((sum, p) => sum + p.x, 0) / subdivision.points.length;
        const centerY = subdivision.points.reduce((sum, p) => sum + p.y, 0) / subdivision.points.length;
        
        dxf += `0\nTEXT\n`;
        dxf += `8\nLabels\n`;
        dxf += `10\n${centerX.toFixed(this.precision)}\n`;
        dxf += `20\n${centerY.toFixed(this.precision)}\n`;
        dxf += `30\n0.0\n`;
        dxf += `1\n${subdivision.name}\n`;
        dxf += `50\n0.0\n`; // Rotation angle
      }
    });
    
    dxf += `0\nENDSEC\n0\nEOF\n`;
    return dxf;
  }

  // Generate Legal Description (Metes and Bounds)
  generateLegalDescription(subdivision) {
    if (!subdivision.points || subdivision.points.length < 3) {
      throw new Error('Invalid subdivision for legal description');
    }
    
    let description = `LEGAL DESCRIPTION\n\n`;
    description += `Property: ${subdivision.name}\n`;
    description += `Total Area: ${subdivision.area?.toFixed(2) || 'N/A'} ${this.units}\n\n`;
    description += `METES AND BOUNDS:\n\n`;
    
    description += `Beginning at a point located at coordinates `;
    description += `${subdivision.points[0].x.toFixed(this.precision)}, ${subdivision.points[0].y.toFixed(this.precision)};\n\n`;
    
    for (let i = 0; i < subdivision.points.length; i++) {
      const currentPoint = subdivision.points[i];
      const nextPoint = subdivision.points[(i + 1) % subdivision.points.length];
      
      const bearing = this.calculateBearing(currentPoint, nextPoint);
      const distance = this.calculateDistance(currentPoint, nextPoint);
      
      description += `Thence ${bearing.direction} ${bearing.degrees}° ${bearing.minutes}' ${bearing.seconds}" `;
      description += `a distance of ${distance.toFixed(2)} meters to a point;\n\n`;
    }
    
    description += `Thence back to the point of beginning.\n\n`;
    description += `Generated on: ${new Date().toLocaleString()}\n`;
    description += `Coordinate System: ${subdivision.coordinateSystem || 'Not specified'}\n`;
    
    return description;
  }

  // Export enhanced Excel report
  async exportToEnhancedExcel(subdivisions, metadata = {}) {
    // This would integrate with the existing Excel export but add professional features
    const workbookData = {
      sheets: [
        {
          name: 'Survey Summary',
          data: this.createSummarySheet(subdivisions, metadata)
        },
        {
          name: 'Coordinates',
          data: this.createCoordinatesSheet(subdivisions)
        },
        {
          name: 'Area Calculations',
          data: this.createAreaCalculationsSheet(subdivisions)
        },
        {
          name: 'Legal Descriptions',
          data: this.createLegalDescriptionsSheet(subdivisions)
        }
      ]
    };
    
    return workbookData;
  }

  // Helper methods for calculations
  calculateBearing(point1, point2) {
    const deltaX = point2.x - point1.x;
    const deltaY = point2.y - point1.y;
    
    let angle = Math.atan2(deltaX, deltaY) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    
    const degrees = Math.floor(angle);
    const minutes = Math.floor((angle - degrees) * 60);
    const seconds = Math.floor(((angle - degrees) * 60 - minutes) * 60);
    
    let direction = '';
    if (angle >= 0 && angle < 90) direction = 'North ' + (90 - angle).toFixed(0) + '° East';
    else if (angle >= 90 && angle < 180) direction = 'South ' + (angle - 90).toFixed(0) + '° East';
    else if (angle >= 180 && angle < 270) direction = 'South ' + (270 - angle).toFixed(0) + '° West';
    else direction = 'North ' + (angle - 270).toFixed(0) + '° West';
    
    return { direction, degrees, minutes, seconds };
  }

  calculateDistance(point1, point2) {
    const deltaX = point2.x - point1.x;
    const deltaY = point2.y - point1.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  createDownloadableFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true, filename };
  }

  // Placeholder methods for Excel sheet creation
  createSummarySheet(subdivisions, metadata) {
    return [
      ['Project Summary'],
      ['Total Subdivisions', subdivisions.length],
      ['Total Area', subdivisions.reduce((sum, sub) => sum + (sub.area || 0), 0).toFixed(2)],
      ['Generated', new Date().toLocaleString()],
      ['Coordinate System', metadata.coordinateSystem || 'Not specified']
    ];
  }

  createCoordinatesSheet(subdivisions) {
    const data = [['Subdivision', 'Point #', 'X', 'Y', 'Z']];
    
    subdivisions.forEach(subdivision => {
      if (subdivision.points) {
        subdivision.points.forEach((point, index) => {
          data.push([
            subdivision.name,
            index + 1,
            point.x.toFixed(this.precision),
            point.y.toFixed(this.precision),
            (point.z || 0).toFixed(this.precision)
          ]);
        });
      }
    });
    
    return data;
  }

  createAreaCalculationsSheet(subdivisions) {
    return [
      ['Subdivision', 'Area (sq m)', 'Area (sq ft)', 'Area (acres)', 'Perimeter (m)'],
      ...subdivisions.map(sub => [
        sub.name,
        (sub.area || 0).toFixed(2),
        ((sub.area || 0) * 10.764).toFixed(2), // Convert to sq ft
        ((sub.area || 0) * 0.000247).toFixed(4), // Convert to acres
        this.calculatePerimeter(sub.points || []).toFixed(2)
      ])
    ];
  }

  createLegalDescriptionsSheet(subdivisions) {
    return [
      ['Subdivision', 'Legal Description'],
      ...subdivisions.map(sub => [
        sub.name,
        this.generateLegalDescription(sub)
      ])
    ];
  }

  calculatePerimeter(points) {
    if (points.length < 2) return 0;
    
    let perimeter = 0;
    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const next = points[(i + 1) % points.length];
      perimeter += this.calculateDistance(current, next);
    }
    return perimeter;
  }
}

// File validation utilities
export const validateImportFile = (file, expectedFormat) => {
  const formatConfig = SUPPORTED_FORMATS.IMPORT[expectedFormat];
  if (!formatConfig) {
    throw new Error(`Unsupported format: ${expectedFormat}`);
  }
  
  if (!file.name.toLowerCase().endsWith(formatConfig.extension)) {
    throw new Error(`File must have ${formatConfig.extension} extension`);
  }
  
  // Add size validation (e.g., max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB');
  }
  
  return true;
};

// Main service factory
export const createProfessionalImportExport = (options = {}) => {
  return {
    importer: new SurveyDataImporter(options.coordinateSystem),
    exporter: new ProfessionalExporter(),
    supportedFormats: SUPPORTED_FORMATS,
    coordinateSystems: COORDINATE_SYSTEMS,
    validateFile: validateImportFile
  };
};