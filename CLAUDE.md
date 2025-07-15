# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` - Starts the development server on http://localhost:3000
- `npm run build` - Builds the app for production to the build folder
- `npm test` - Runs the test suite in interactive watch mode

## Architecture Overview

This is a 3D land visualization application built with React and Three.js that allows users to:

1. **Input land areas** in various units (m², ft², hectares, acres, traditional units)
2. **Visualize land in 3D** with interactive controls and environmental context
3. **Draw subdivisions** directly on the 3D land surface using drawing tools
4. **Compare land sizes** with familiar objects (soccer fields, houses, parking spaces)
5. **Share configurations** via encoded URLs

### Key Components

- **App.js**: Main application with all functionality consolidated in a single file
- **LandVisualizer**: Primary component managing state and UI
- **Scene**: 3D rendering component using @react-three/fiber
- **DrawingPlane**: Handles interactive subdivision drawing with pointer events
- **Subdivision**: Renders individual land subdivisions with editable labels
- **OrbitControls.js**: Custom implementation of 3D camera controls

### Technology Stack

- **React 19** with hooks for state management
- **Three.js** for 3D graphics and math
- **@react-three/fiber** for React-Three.js integration
- **@react-three/drei** for pre-built 3D components (OrbitControls, Grid, Plane, etc.)
- **Lucide React** for UI icons
- **Tailwind CSS** for styling (configured via classes)

### State Management

The application uses React's built-in state management:
- `units`: Array of area values with their respective units
- `subdivisions`: Array of drawn land subdivisions with position, size, and metadata
- `selectedComparison`: Currently selected comparison object for visualization
- `drawingMode`: Controls interaction mode ('rectangle', 'select', or null)

### URL Sharing System

Configuration is encoded in URL parameters using Base64 encoding:
- Includes units, comparison selection, and subdivision data
- Automatically loads configuration from URL on mount
- Generates shareable URLs for current state

### 3D Rendering Architecture

The 3D scene structure:
- **Ground plane**: Large grass-colored base
- **Grid**: Reference grid with 5m cells and 25m sections
- **Main area**: Blue transparent plane representing the total land area
- **Subdivisions**: Colored planes with borders and labels
- **Comparison objects**: Overlaid reference objects for size comparison
- **Drawing plane**: Invisible interaction surface for subdivision creation

### Drawing System

Interactive drawing uses Three.js raycasting:
- Pointer events on invisible plane above the land
- Real-time preview during drawing
- Minimum area threshold to prevent tiny subdivisions
- Automatic subdivision labeling and color assignment

### Unit Conversion System

Centralized conversion factors to square meters:
- Standard units: m², ft², hectares, acres
- Traditional units: arpent, perche, toise
- All calculations normalized to square meters internally

### Performance Considerations

- Subdivision rendering limited to prevent performance issues
- Comparison object rendering capped at 50 items
- Efficient React re-rendering with proper key usage
- Three.js object pooling through @react-three/fiber

This application is designed as a professional land measurement and visualization tool with both metric and traditional unit support.