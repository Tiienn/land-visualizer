# Components Directory

This directory contains all React components for the Land Visualizer application, organized by functionality and accessibility features.

## Entry Points & Core Components

### **Main UI Structure**
- **`Ribbon.js`** - Main toolbar with organized tool sections: Area Configuration, Drawing Tools, Measurement Tools, Corner Controls, View Controls, and Export
- **`AccessibleRibbon.js`** - Enhanced accessible version with keyboard navigation and ARIA support
- **`LeftSidebar.js`** - Left panel containing area inputs, unit converters, and configuration controls
- **`PropertiesPanel.js`** - Right panel for editing selected objects and subdivision properties
- **`LayerPanel.js`** - Layer management interface with visibility controls

### **3D Visualization Core**
- **`EnhancedSubdivision.js`** - Main subdivision rendering component with labels and borders
- **`InteractiveCorners.js`** - Corner editing system allowing drag-and-drop corner manipulation
- **`EnhancedCameraController.js`** - Advanced 3D camera controls with smooth movement
- **`OptimizedRenderer.js`** - Performance-optimized Three.js rendering system
- **`EnhancedEventHandler.js`** - Enhanced pointer event handling for 3D interactions

## Component Categories

### **Accessibility Components**
- **`AccessibilityUtils.js`** - Core accessibility utilities, hooks, and reusable components
  - Entry Points: `ScreenReaderOnly`, `LiveRegion`, `AccessibleButton`, `AccessibleInput`
- **`AccessibleThreeJSControls.js`** - Keyboard navigation for 3D scene (WASD controls)
  - Entry Points: `AccessibleCameraControls`, `SubdivisionFocusIndicator`, `useAudioFeedback`
- **`ScreenReaderSupport.js`** - Screen reader announcements and support
  - Entry Points: `MeasurementScreenReader`, `DrawingScreenReader`, `ScreenReaderCoordinator`
- **`FocusManagement.js`** - Focus management system with visual indicators
  - Entry Points: `FocusProvider`, `FocusTrap`, `RovingFocusManager`, `SkipNavigation`
- **`ErrorBoundary.js`** - Error boundaries with WebGL compatibility checks
  - Entry Points: `ErrorBoundary`, `ThreeJSErrorBoundary`, `WebGLCheck`

### **Drawing & Measurement Tools**
- **`MeasuringTape.js`** - Distance measurement tool with click-to-measure functionality
- **`MeasuringLine3D.js`** - 3D line measurement with elevation support
- **`IrregularPolygon3D.js`** - Irregular polygon drawing with area calculation
- **`DimensionLines.js`** - Dimension annotation system for subdivisions
- **`AreaCalculator.js`** - Area calculation utilities and display components

### **Surveying & Navigation**
- **`CompassBearing.js`** - Bearing calculation and display component
- **`BearingLine3D.js`** - 3D bearing line visualization in the scene
- **`SimpleCompass.js`** - Compass widget for navigation reference
- **`TerrainElevation.js`** - Terrain elevation features and visualization

### **Export & Sharing**
- **`ExcelExport.js`** - Excel spreadsheet export with multiple sheets
  - Entry Points: `ExcelExporter`, `generateWorkbook()`
- **`QRCodeShare.js`** - QR code generation for mobile sharing
  - Entry Points: `QRCodeGenerator`, `ShareModal`
- **`KeyboardShortcuts.js`** - Keyboard shortcut management and help system

### **Utility Components**
- **`AreaPresetSelector.js`** - Predefined area selection interface
- **`UnitConverter.js`** - Unit conversion utilities and controls
- **`AllConversions.js`** - Comprehensive unit conversion display
- **`ExpandableVisualComparisons.js`** - Size comparison visualizations
- **`InsertAreaDropdown.js`** - Area insertion modal interface
- **`Toast.js`** - Notification system for user feedback
  - Entry Points: `ToastContainer`, `useToast`, `showToast()`

## Usage Patterns

### **Standard Component Import**
```jsx
import ComponentName from './components/ComponentName';
```

### **Accessibility-First Development**
Always prefer accessible versions when available:
```jsx
// Use this
import AccessibleRibbon from './components/AccessibleRibbon';

// Instead of this
import Ribbon from './components/Ribbon';
```

### **Error Boundary Wrapping**
Wrap Three.js components with error boundaries:
```jsx
import { ThreeJSErrorBoundary } from './components/ErrorBoundary';

<ThreeJSErrorBoundary componentName="3D Visualization">
  <Canvas>
    {/* 3D content */}
  </Canvas>
</ThreeJSErrorBoundary>
```

### **Focus Management Integration**
```jsx
import { FocusProvider } from './components/FocusManagement';

<FocusProvider>
  <App />
</FocusProvider>
```

## Component Dependencies

### **Required External Libraries**
- `@react-three/fiber` - For 3D components
- `@react-three/drei` - For enhanced 3D utilities
- `lucide-react` - For UI icons
- `three` - Core Three.js functionality
- `jspdf` - PDF export functionality
- `xlsx` - Excel export functionality

### **Internal Dependencies**
- `../hooks/` - Custom hooks for state management
- `../services/` - Business logic services
- `../styles/variables.css` - Design system variables

## Performance Considerations

### **Optimized Components**
- **`OptimizedRenderer.js`** - Use for performance-critical 3D scenes
- **`EnhancedCameraController.js`** - Optimized camera movement
- **`EnhancedEventHandler.js`** - Efficient event handling

### **Memory Management**
- All Three.js components implement proper cleanup in `useEffect`
- Error boundaries prevent memory leaks from crashed components
- Event listeners are properly removed on unmount

### **Rendering Optimization**
- Use `React.memo()` for expensive components
- Implement proper key props for dynamic lists
- Minimize re-renders through careful state management

## Accessibility Standards

### **WCAG 2.1 AA Compliance**
- All interactive components have proper ARIA labels
- Keyboard navigation is implemented for all functionality
- Screen reader support is comprehensive
- Focus management follows best practices

### **Keyboard Navigation**
- Tab through all interactive elements
- Arrow keys for component-specific navigation
- Escape key for modal dismissal
- Enter/Space for activation

### **Screen Reader Support**
- Live regions for dynamic content announcements
- Semantic HTML structure
- Descriptive labels and instructions
- Context-aware information delivery

## Testing Guidelines

### **Component Testing**
- Test keyboard navigation paths
- Verify screen reader announcements
- Check error boundary functionality
- Validate accessibility compliance

### **Integration Testing**
- Test component interactions
- Verify 3D scene integration
- Check export functionality
- Validate state management

### **Visual Testing**
- Use Playwright MCP tools for visual regression testing
- Test responsive behavior across viewports
- Verify high contrast mode compatibility
- Check reduced motion preferences