# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` - Starts the development server on http://localhost:3000
- `npm run build` - Builds the app for production to the build folder
- `npm test` - Runs the test suite in interactive watch mode

## Visual Development

### 3D Scene Development
- Use **React Three Fiber** with `<Canvas>` for 3D scene setup
- Components should use Three.js primitives through React Three Fiber (e.g., `<mesh>`, `<geometry>`, `<material>`)
- Leverage `@react-three/drei` components: `OrbitControls`, `Grid`, `Plane`, `Box`, `Text`, `Line`
- Use `useThree()` hook for accessing camera, scene, and renderer
- Use `useFrame()` hook for animations and per-frame updates

### Interactive Elements
- Implement pointer events using Three.js raycasting
- Use invisible planes for interaction surfaces
- Handle `onPointerDown`, `onPointerMove`, `onPointerUp` events
- Implement real-time visual feedback during interactions
- Use `useState` and `useCallback` for performance optimization

### Visual Styling Guidelines
- Use CSS variables from `src/styles/variables.css` for consistent theming
- Maintain consistent color scheme: blue for land areas, varied colors for subdivisions
- Apply transparency appropriately: land areas ~0.3 opacity, UI overlays ~0.9
- Use proper z-indexing for layered UI elements
- Implement smooth transitions with CSS transitions or React Spring

### Component Structure
- Keep 3D components separate from UI components
- Use composition over inheritance for component reusability
- Implement proper cleanup in `useEffect` for Three.js objects
- Use React.memo() for expensive rendering components
- Maintain separation between state management and rendering logic

### Design Principles

Comprehensive design checklist in '/context/design-principles.md'

Brand style guide in '/context/style-guide.md'

When making visual (front-end, UI/UX) changes, always refer to these files for guidance

### Quick Visual Check

IMMEDIATELY after implementing any front-end changes:

1. **Identify what changed** - Review the modified components/pages
2. **Navigate to affected pages** - Use 'mcp_playwright_browser_navigate' to visit each changed view
3. **Verify design compliance** - Compare against '/context/design-principles.md' and '/context/style-guide.md'
4. **Validate feature implementation** - Ensure the change fulfils the user's specific request
5. **Check acceptance criteria** - Review any provided context files or requirements
6. **Capture evidence** - Take full page screenshot at desktop viewport (1440px) of each changed view
7. **Check for errors** - Run 'mcp_playwright_browser_console_messages'

### Comprehensive Design Review

Invoke the 'design-review' agent for thorough design validation when:
- Completing significant UI/UX features
- Before finalizing PRs with visual changes
- Needing comprehensive accessibility and responsiveness testing

## Major Entry Points & File Structure

### **Main Application Entry Points**
- **`src/index.js`** - React application root and DOM mounting point
- **`src/App.js`** - Main application component with routing, state management, and 3D scene setup
- **`src/App.css`** - Global application styles and CSS imports

### **Directory Structure & Documentation**
Each major directory contains its own CLAUDE.md file with detailed documentation:

- **`src/components/`** - React components ([see CLAUDE.md](src/components/CLAUDE.md))
  - Entry Points: AccessibleRibbon, ErrorBoundary, AccessibilityUtils, ScreenReaderSupport, FocusManagement
- **`src/services/`** - Business logic and utilities ([see CLAUDE.md](src/services/CLAUDE.md))
  - Entry Points: professionalImportExport, landCalculations, areaPresets
- **`src/hooks/`** - Custom React hooks ([see CLAUDE.md](src/hooks/CLAUDE.md))
  - Entry Points: useLandCalculations, useSubdivisions, useThreeOptimizations, useToastNotifications
- **`src/context/`** - Design documentation ([see CLAUDE.md](src/context/CLAUDE.md))
  - Entry Points: design-principles.md, style-guide.md
- **`src/styles/`** - CSS design system ([see CLAUDE.md](src/styles/CLAUDE.md))
  - Entry Points: variables.css (complete design token system)

### **Configuration & Build Files**
- **`package.json`** - Project dependencies, scripts, and metadata
- **`public/index.html`** - HTML template with SEO meta tags
- **`public/manifest.json`** - PWA configuration
- **`.claude/`** - Claude Code configuration
  - **`agents/design-review.md`** - Design review agent configuration
  - **`commands/`** - Custom commands (lyra, analyze-codebase, update-claudemd, ultrathink)

### **Documentation Files**
- **`CLAUDE.md`** - This file - Main development guidance
- **`README.md`** - Project overview and setup instructions
- **`IMPLEMENTATION_GUIDE.md`** - Accessibility implementation guide
- **`PAYPAL_SETUP.md`** - PayPal integration documentation
- **`SEO_FIXES_SUMMARY.md`** - SEO optimization summary

## Architecture Overview

This is a 3D land visualization application built with React and Three.js that allows users to:

1. **Input land areas** in various units (m², ft², hectares, acres, traditional units)
2. **Visualize land in 3D** with interactive controls and environmental context
3. **Draw subdivisions** directly on the 3D land surface using drawing tools
4. **Measure distances and bearings** with professional surveying tools
5. **Create irregular polygons** with precise area calculations
6. **Add terrain elevation** and environmental features
7. **Export data** to Excel, PDF, DXF, and generate QR codes for sharing
8. **Compare land sizes** with familiar objects (soccer fields, houses, parking spaces)
9. **Share configurations** via encoded URLs and PayPal integration for premium features
10. **Professional accessibility** support with keyboard navigation and screen readers

### Key Components

#### Core Application
- **App.js**: Main application entry point with routing and core state management
- **LandVisualizer**: Primary component managing state and UI (referenced in App.js)

#### UI Components
- **Ribbon.js**: Top toolbar with organized tool sections (Area Configuration, Drawing Tools, Measurement Tools, Corner Controls, View Controls, Export)
- **AccessibleRibbon.js**: Enhanced accessible version with keyboard navigation and ARIA labels
- **LeftSidebar.js**: Left panel with area inputs and controls
- **PropertiesPanel.js**: Right panel for editing selected objects
- **LayerPanel.js**: Layer management and visibility controls
- **Toast.js**: Notification system for user feedback

#### Accessibility Components (NEW)
- **AccessibilityUtils.js**: Core accessibility utilities, components, and hooks
- **AccessibleThreeJSControls.js**: Keyboard navigation for 3D scene with WASD controls
- **ScreenReaderSupport.js**: Comprehensive screen reader announcements and support
- **FocusManagement.js**: Focus trap, roving focus, and visual indicators system
- **ErrorBoundary.js**: Error boundaries with WebGL compatibility checks

#### 3D Visualization Components
- **EnhancedSubdivision.js**: Advanced subdivision rendering with editable labels
- **InteractiveCorners.js**: Corner editing system for subdivisions
- **EnhancedCameraController.js**: Advanced 3D camera controls
- **OptimizedRenderer.js**: Performance-optimized rendering system
- **EnhancedEventHandler.js**: Enhanced pointer and interaction handling

#### Measurement & Drawing Tools
- **MeasuringTape.js**: Distance measurement tool
- **MeasuringLine3D.js**: 3D line measurement component
- **IrregularPolygon3D.js**: Irregular shape drawing and area calculation
- **DimensionLines.js**: Dimension annotation system
- **AreaCalculator.js**: Area calculation utilities

#### Surveying & Navigation
- **CompassBearing.js**: Bearing calculation and display
- **BearingLine3D.js**: 3D bearing line visualization
- **SimpleCompass.js**: Compass widget for navigation
- **TerrainElevation.js**: Elevation and terrain features

#### Professional Services (NEW)
- **professionalImportExport.js**: Professional surveying data import/export service
  - DXF export with AutoCAD compatibility
  - CSV/GeoJSON import with coordinate system support
  - Legal description generation (metes and bounds)
  - Enhanced Excel export with multiple sheets
  - Coordinate system transformation support

#### Export & Sharing
- **ExcelExport.js**: Excel spreadsheet export functionality
- **QRCodeShare.js**: QR code generation for sharing
- **KeyboardShortcuts.js**: Keyboard shortcut management

#### Utility Components
- **AreaPresetSelector.js**: Predefined area selection
- **UnitConverter.js**: Unit conversion utilities
- **AllConversions.js**: Comprehensive unit conversion display
- **ExpandableVisualComparisons.js**: Size comparison visualizations
- **InsertAreaDropdown.js**: Area insertion interface

### Technology Stack

#### Core Framework
- **React 19** with hooks for state management
- **React Router DOM** for routing and navigation
- **Three.js** for 3D graphics and math
- **@react-three/fiber** for React-Three.js integration
- **@react-three/drei** for pre-built 3D components (OrbitControls, Grid, Plane, etc.)

#### UI & Styling
- **Lucide React** for UI icons
- **Tailwind CSS** for styling (configured via classes)
- **CSS Variables** design system in `src/styles/variables.css`

#### Export & Integration
- **jsPDF** for PDF generation and export
- **XLSX** for Excel spreadsheet export
- **QRCode** for QR code generation
- **@paypal/react-paypal-js** for PayPal payment integration

#### Development & Build
- **React Scripts** for build tooling
- **Web Vitals** for performance monitoring

### Accessibility Features (NEW)

#### Keyboard Navigation
- **WASD Controls**: Navigate 3D camera with keyboard
- **Tool Shortcuts**: S (Select), R (Rectangle), P (Polyline), M (Measure), etc.
- **Focus Management**: Tab navigation through all interactive elements
- **Mode Switching**: Ctrl+Tab to switch between camera and subdivision navigation

#### Screen Reader Support
- **Live Announcements**: Real-time feedback for measurements and selections
- **ARIA Labels**: Comprehensive labeling for all interactive elements
- **Semantic HTML**: Proper landmarks and structure
- **Context Information**: Alt+I (app info), Alt+S (subdivisions), Alt+M (measurements)

#### Visual Accessibility
- **High Contrast Support**: Respects user's high contrast preferences
- **Focus Indicators**: Clear visual focus states for keyboard users
- **Reduced Motion**: Respects user's motion preferences
- **Error Boundaries**: Graceful fallbacks for WebGL and Three.js errors

### State Management

The application uses React's built-in state management with modular component state:
- `units`: Array of area values with their respective units
- `subdivisions`: Array of drawn land subdivisions with position, size, and metadata
- `selectedComparison`: Currently selected comparison object for visualization
- `drawingMode`: Controls interaction mode ('rectangle', 'polygon', 'select', 'measure', or null)
- `selectedObject`: Currently selected subdivision or object for editing
- `layers`: Layer visibility and management state
- `cameraState`: 3D camera position and orientation
- `measurementData`: Distance and bearing measurements
- `elevationData`: Terrain elevation information

### URL Sharing System

Configuration is encoded in URL parameters using Base64 encoding:
- Includes units, comparison selection, subdivision data, and measurements
- Automatically loads configuration from URL on mount
- Generates shareable URLs for current state
- QR code generation for easy mobile sharing
- PayPal integration for premium sharing features

### 3D Rendering Architecture

The 3D scene structure:
- **Ground plane**: Large grass-colored base
- **Grid**: Reference grid with 5m cells and 25m sections
- **Main area**: Blue transparent plane representing the total land area
- **Subdivisions**: Colored planes with borders and labels
- **Comparison objects**: Overlaid reference objects for size comparison
- **Drawing plane**: Invisible interaction surface for subdivision creation

### Drawing & Measurement System

#### Interactive Drawing
Interactive drawing uses Three.js raycasting:
- Pointer events on invisible plane above the land
- Real-time preview during drawing
- Support for rectangles and irregular polygons
- Minimum area threshold to prevent tiny subdivisions
- Automatic subdivision labeling and color assignment
- Corner editing system for precise adjustments

#### Measurement Tools
Professional surveying capabilities:
- Distance measurement with measuring tape tool
- Bearing calculation and compass navigation
- 3D line measurements with elevation
- Dimension annotations and labels
- Area calculations for irregular shapes
- Terrain elevation mapping

### Unit Conversion System

Centralized conversion factors to square meters:
- Standard units: m², ft², hectares, acres
- Traditional units: arpent, perche, toise
- All calculations normalized to square meters internally

### Professional Import/Export Features (NEW)

#### Supported Import Formats
- **CSV**: Coordinate data with automatic column detection
- **GeoJSON**: Standard geospatial data format
- **DXF**: AutoCAD Drawing Exchange Format (planned)
- **Shapefile**: ESRI format support (planned)

#### Export Capabilities
- **Excel**: Multi-sheet exports with coordinates, calculations, and legal descriptions
- **PDF**: Professional reports with visualizations
- **DXF**: AutoCAD-compatible drawings with polylines and labels
- **Legal Descriptions**: Metes and bounds format for legal documentation
- **QR Codes**: Mobile-friendly sharing

#### Coordinate System Support
- **WGS84**: Global standard (EPSG:4326)
- **UTM**: Universal Transverse Mercator zones
- **State Plane**: US regional coordinate systems
- **Local**: Custom coordinate systems

### Performance Considerations

- **Modular Architecture**: Components split for better code organization and maintenance
- **Enhanced Rendering**: OptimizedRenderer component for improved 3D performance
- **Event Handling**: Enhanced event system for better user interactions
- **Camera Controls**: Advanced camera controller for smooth navigation
- **Error Boundaries**: Graceful fallbacks for WebGL compatibility issues
- **Accessibility Performance**: Optimized screen reader announcements and keyboard handling
- Subdivision rendering optimized to prevent performance issues
- Comparison object rendering capped at 50 items
- Efficient React re-rendering with proper key usage
- Three.js object pooling through @react-three/fiber

### Professional Features

This application is designed as a professional land measurement and visualization tool featuring:
- **Surveying Tools**: Professional-grade measurement and bearing calculation
- **CAD-like Interface**: Precision drawing with corner editing and dimension lines
- **Multi-format Export**: Excel, PDF, DXF, and QR code sharing capabilities
- **Legal Documentation**: Metes and bounds descriptions for legal compliance
- **Coordinate Systems**: Support for professional surveying coordinate systems
- **Layer Management**: Organized layer system for complex projects
- **Keyboard Shortcuts**: Efficient workflow with customizable shortcuts
- **Toast Notifications**: User-friendly feedback system
- **Full Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **Responsive Design**: Works across desktop and mobile devices
- **Traditional Units**: Support for both metric and traditional land measurement units
- **Professional Documentation**: Comprehensive context files and implementation guides

## Recent Updates (Updated: 2025-08-17)

### Major Accessibility Implementation
- **Complete Accessibility Overhaul**: Added comprehensive WCAG 2.1 AA compliance
- **Keyboard Navigation**: Full 3D scene navigation with WASD controls and tool shortcuts
- **Screen Reader Support**: Real-time announcements and semantic HTML structure
- **Focus Management**: Visual indicators and focus trapping for modal dialogs
- **Error Boundaries**: Graceful WebGL error handling with user-friendly fallbacks

### Professional Surveying Features
- **Import/Export Services**: Professional DXF export and CSV/GeoJSON import
- **Legal Documentation**: Automatic metes and bounds description generation
- **Coordinate Systems**: Support for WGS84, UTM, and State Plane coordinate systems
- **Enhanced Excel Export**: Multi-sheet exports with comprehensive data

### Design System Implementation
- **CSS Variables**: Complete design system with brand colors and spacing
- **Context Documentation**: Design principles and style guide in `/context/` folder
- **Visual Consistency**: Standardized color palette and typography system

### UI/UX Improvements
- **Ribbon Reorganization**: Moved corner editing tools (Add Corner, Delete Corner) from Drawing Tools to dedicated Corner Controls section
- **Tool Organization**: Improved logical grouping of related functionality in the ribbon interface
- **Icon Consistency**: Used proper corner control icons (CornerDownRight, CornerUpLeft) for corner editing tools

### Development Infrastructure
- **Command System**: Added `/lyra`, `/analyze-codebase`, `/update-claudemd`, `/ultrathink` commands
- **Agent System**: Design review agent and QA testing specialist for comprehensive validation
- **Implementation Guide**: Detailed integration instructions for new accessibility features

### File Structure Updates
- **New Directories**: 
  - `src/context/` - Design principles and style guide documentation
  - `src/styles/` - CSS variables and design system
  - `src/services/professionalImportExport.js` - Professional surveying services
  - `.claude/agents/` - Specialized review agents
  - `.claude/commands/` - Development workflow commands

## Important Notes for Developers

### Accessibility Requirements
- Always use the accessibility components from `src/components/AccessibilityUtils.js`
- Test keyboard navigation on every new feature
- Ensure screen reader announcements for dynamic content
- Use semantic HTML and proper ARIA labels

### Design System Usage
- Reference CSS variables from `src/styles/variables.css`
- Follow design principles in `src/context/design-principles.md`
- Validate against style guide in `src/context/style-guide.md`

### Professional Features
- Use `professionalImportExport.js` for any data import/export functionality
- Maintain coordinate system precision in all calculations
- Generate legal descriptions for property boundary data

### Testing Workflow
- Use `/ultrathink` command for complex feature planning
- Run design review agent before finalizing UI changes
- Test with Playwright MCP tools for visual validation
- Validate accessibility with screen readers (NVDA, JAWS, VoiceOver)