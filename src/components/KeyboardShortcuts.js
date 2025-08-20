import React, { useState, useEffect, useCallback } from 'react';
import { Keyboard, HelpCircle, X } from 'lucide-react';

// Keyboard shortcut definitions
const SHORTCUTS = {
  // Tool activation shortcuts
  'KeyM': { key: 'M', description: 'Toggle Measuring Tape', category: 'Tools' },
  'KeyA': { key: 'A', description: 'Toggle Area Calculator', category: 'Tools' },
  'KeyC': { key: 'C', description: 'Toggle Compass Bearing', category: 'Tools' },
  'KeyT': { key: 'T', description: 'Toggle Terrain Elevation', category: 'Tools' },
  
  // Drawing tools
  'KeyS': { key: 'S', description: 'Select Mode', category: 'Drawing' },
  'KeyR': { key: 'R', description: 'Rectangle Mode', category: 'Drawing' },
  'KeyP': { key: 'P', description: 'Polyline Mode', category: 'Drawing' },
  
  // View controls
  'KeyD': { key: 'D', description: 'Toggle Dark Mode', category: 'View' },
  'KeyF': { key: 'F', description: 'Toggle Fullscreen', category: 'View' },
  'Equal': { key: '=', description: 'Zoom In (3D)', category: 'View' },
  'Minus': { key: '-', description: 'Zoom Out (3D)', category: 'View' },
  
  // Export functions
  'KeyE': { key: 'Ctrl+E', description: 'Export to Excel', category: 'Export', ctrl: true },
  
  // Data management
  'KeyZ': { key: 'Ctrl+Z', description: 'Undo', category: 'Edit', ctrl: true },
  'KeyY': { key: 'Ctrl+Y', description: 'Redo', category: 'Edit', ctrl: true },
  'Delete': { key: 'Delete', description: 'Delete Selected', category: 'Edit' },
  'Escape': { key: 'Escape', description: 'Cancel/Deselect', category: 'Edit' },
  
  // Navigation
  'ArrowUp': { key: '↑', description: 'Navigate Up', category: 'Navigation' },
  'ArrowDown': { key: '↓', description: 'Navigate Down', category: 'Navigation' },
  'ArrowLeft': { key: '←', description: 'Navigate Left', category: 'Navigation' },
  'ArrowRight': { key: '→', description: 'Navigate Right', category: 'Navigation' },
  'Tab': { key: 'Tab', description: 'Next Element', category: 'Navigation' },
  'ShiftTab': { key: 'Shift+Tab', description: 'Previous Element', category: 'Navigation', shift: true },
  
  // Quick actions
  'Enter': { key: 'Enter', description: 'Confirm/Execute', category: 'Quick Actions' },
  'Space': { key: 'Space', description: 'Toggle/Activate', category: 'Quick Actions' },
  'KeyH': { key: '?', description: 'Show Help/Shortcuts', category: 'Help' },
  
  // Number keys for quick area input
  'Digit1': { key: '1', description: 'Quick Area: 1000 m²', category: 'Quick Input' },
  'Digit2': { key: '2', description: 'Quick Area: 5000 m²', category: 'Quick Input' },
  'Digit3': { key: '3', description: 'Quick Area: 10000 m²', category: 'Quick Input' },
  'Digit4': { key: '4', description: 'Quick Area: 1 acre', category: 'Quick Input' },
  'Digit5': { key: '5', description: 'Quick Area: 5 acres', category: 'Quick Input' }
};

// Hook for keyboard shortcuts  
const useKeyboardShortcuts = ({
  // Tool toggles
  toggleAreaCalculator,
  toggleCompassBearing,
  toggleTerrain,
  
  // Drawing modes
  setDrawingMode,
  drawingMode,
  
  // View controls
  toggleDarkMode,
  
  // Export functions
  exportToExcel,
  
  // Edit functions
  undo,
  redo,
  deleteSelected,
  
  // Quick actions
  setUnits,
  
  // State checks
  isInputFocused
}) => {
  const handleKeyPress = useCallback((event) => {
    // Don't trigger shortcuts if user is typing in an input field
    if (isInputFocused || 
        event.target.tagName === 'INPUT' || 
        event.target.tagName === 'TEXTAREA' || 
        event.target.isContentEditable) {
      return;
    }

    const key = event.code;
    const ctrl = event.ctrlKey || event.metaKey;
    const shift = event.shiftKey;
    const alt = event.altKey;

    // Allow standard browser shortcuts (copy, paste, select all, etc.)
    const standardShortcuts = ['KeyC', 'KeyV', 'KeyX', 'KeyA', 'KeyF', 'KeyR'];
    if (ctrl && standardShortcuts.includes(key)) {
      return; // Let browser handle these
    }

    // Prevent default for handled shortcuts
    let handled = true;

    switch (key) {
      // Tool toggles
      case 'KeyA':
        if (!ctrl && !alt) {
          toggleAreaCalculator?.();
        } else {
          handled = false; // Let browser handle Ctrl+A
        }
        break;
      case 'KeyC':
        if (!ctrl && !alt) {
          toggleCompassBearing?.();
        } else {
          handled = false; // Let browser handle Ctrl+C
        }
        break;
      case 'KeyT':
        if (!ctrl && !alt) toggleTerrain?.();
        break;
        
      // Drawing modes
      case 'KeyS':
        if (!ctrl && !alt) setDrawingMode?.(drawingMode === 'select' ? null : 'select');
        break;
      case 'KeyR':
        if (!ctrl && !alt) setDrawingMode?.(drawingMode === 'rectangle' ? null : 'rectangle');
        break;
      case 'KeyP':
        if (!ctrl && !alt) {
          setDrawingMode?.(drawingMode === 'polyline' ? null : 'polyline');
        }
        break;
        
      // View controls
      case 'KeyD':
        if (!ctrl && !alt) toggleDarkMode?.();
        break;
      case 'KeyF':
        if (!ctrl && !alt) {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.();
          } else {
            document.exitFullscreen?.();
          }
        } else {
          handled = false; // Let browser handle Ctrl+F
        }
        break;
      case 'Equal':
      case 'NumpadAdd':
        if (!ctrl && !alt) {
          // Zoom in - dispatch a custom event for the 3D scene
          const zoomEvent = new CustomEvent('keyboardZoom', { detail: { direction: 'in' } });
          document.dispatchEvent(zoomEvent);
        }
        break;
      case 'Minus':
      case 'NumpadSubtract':
        if (!ctrl && !alt) {
          // Zoom out - dispatch a custom event for the 3D scene
          const zoomEvent = new CustomEvent('keyboardZoom', { detail: { direction: 'out' } });
          document.dispatchEvent(zoomEvent);
        }
        break;
        
      // Export functions
      case 'KeyE':
        if (ctrl) exportToExcel?.();
        break;
        
      // Edit functions
      case 'KeyZ':
        if (ctrl && !shift) undo?.();
        break;
      case 'KeyY':
        if (ctrl) redo?.();
        break;
      case 'Delete':
        deleteSelected?.();
        break;
      case 'Escape':
        setDrawingMode?.(null);
        // Additional cleanup actions can be added here
        break;
        
      // Quick area inputs
      case 'Digit1':
        if (!ctrl && !alt) setUnits?.([{ value: 1000, unit: 'm²' }]);
        break;
      case 'Digit2':
        if (!ctrl && !alt) setUnits?.([{ value: 5000, unit: 'm²' }]);
        break;
      case 'Digit3':
        if (!ctrl && !alt) setUnits?.([{ value: 10000, unit: 'm²' }]);
        break;
      case 'Digit4':
        if (!ctrl && !alt) setUnits?.([{ value: 1, unit: 'acres' }]);
        break;
      case 'Digit5':
        if (!ctrl && !alt) setUnits?.([{ value: 5, unit: 'acres' }]);
        break;
        
      default:
        handled = false;
        break;
    }

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, [
    toggleAreaCalculator, toggleCompassBearing, toggleTerrain,
    setDrawingMode, drawingMode, toggleDarkMode, exportToExcel, undo, redo, deleteSelected, setUnits, isInputFocused
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
};

// Enhanced Help Modal with multiple tabs
const KeyboardShortcutsHelp = ({ isOpen, onClose, darkMode }) => {
  const [activeTab, setActiveTab] = useState('shortcuts');
  
  if (!isOpen) return null;

  const categories = [...new Set(Object.values(SHORTCUTS).map(s => s.category))];

  const tabs = [
    { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
    { id: 'getting-started', label: 'Getting Started', icon: HelpCircle },
    { id: 'tips', label: 'Tips & Tricks', icon: HelpCircle },
    { id: 'features', label: 'Features Guide', icon: HelpCircle }
  ];

  const tipsAndTricks = [
    {
      title: "Quick Area Input",
      description: "Use number keys 1-5 for instant area presets",
      tip: "Press '1' for 1000m², '2' for 5000m², '3' for 10000m², '4' for 1 acre, '5' for 5 acres"
    },
    {
      title: "Efficient Drawing",
      description: "Switch between drawing modes quickly",
      tip: "Use 'R' for rectangles, 'P' for polylines, 'S' for select mode, 'Escape' to exit"
    },
    {
      title: "3D Navigation",
      description: "Navigate the 3D scene with ease",
      tip: "Drag to rotate, scroll to zoom, use +/- keys for precise zoom control"
    },
    {
      title: "Dark Mode",
      description: "Toggle between themes instantly",
      tip: "Press 'D' to switch between light and dark modes for better visibility"
    },
    {
      title: "Measurement Tools",
      description: "Access measurement tools quickly",
      tip: "Use 'A' for area calculator, 'C' for compass bearing"
    }
  ];

  const gettingStarted = [
    {
      step: 1,
      title: "Set Your Land Area",
      description: "Enter your land dimensions in the Area Configuration panel. You can input multiple areas and choose from various units (m², acres, hectares, etc.)."
    },
    {
      step: 2,
      title: "Visualize in 3D",
      description: "Your land appears as a blue area in the 3D view. Drag to rotate, scroll to zoom, and explore your property from different angles."
    },
    {
      step: 3,
      title: "Add Subdivisions",
      description: "Click 'Rectangle Mode' (R) to draw subdivisions on your land. Each subdivision can be labeled and will show its calculated area."
    },
    {
      step: 4,
      title: "Use Comparison Objects",
      description: "Add familiar objects like soccer fields, houses, or cars from the Visual Comparisons panel to understand your land's scale."
    },
    {
      step: 5,
      title: "Measure & Analyze",
      description: "Use measuring tools (M), area calculator (A), and compass bearing (C) for precise measurements and planning."
    },
    {
      step: 6,
      title: "Share Your Work",
      description: "Use the Share button to generate URLs or QR codes, or export to Excel/PDF for documentation."
    }
  ];

  const features = [
    {
      category: "Measurement Tools",
      items: [
        "Measuring Tape - Linear measurements with real-time display",
        "Area Calculator - Calculate irregular polygon areas",
        "Compass Bearing - Direction and distance measurements",
        "Terrain Elevation - Add topographic features"
      ]
    },
    {
      category: "Drawing & Design",
      items: [
        "Rectangle Tool - Draw regular subdivisions",
        "Polyline Tool - Create irregular boundaries",
        "Interactive Editing - Drag corners to resize areas",
        "Auto-labeling - Automatic naming of subdivisions"
      ]
    },
    {
      category: "Export & Sharing",
      items: [
        "Excel Export - Detailed area and measurement data",
        "PDF Reports - Professional documentation with 3D views",
        "URL Sharing - Share configurations via link",
        "QR Code Generation - Mobile-friendly sharing"
      ]
    },
    {
      category: "Advanced Features",
      items: [
        "Unit Conversion - Support for metric, imperial, and traditional units",
        "Visual Comparisons - Scale reference with familiar objects",
        "Dark Mode - Eye-friendly interface option",
        "Keyboard Shortcuts - Efficient workflow navigation"
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`max-w-5xl w-full max-h-[90vh] overflow-hidden rounded-xl shadow-2xl ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700 bg-gradient-to-r from-gray-700 to-gray-800' : 'border-gray-200 bg-gradient-to-r from-slate-50 to-slate-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <HelpCircle className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className="text-2xl font-bold">Help & Documentation</h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? 'hover:bg-gray-600 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Comprehensive guide to mastering the Land Visualizer
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={`border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="flex space-x-0 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? darkMode
                      ? 'border-blue-400 text-blue-400'
                      : 'border-blue-600 text-blue-600'
                    : darkMode
                      ? 'border-transparent text-gray-400 hover:text-gray-200'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="p-6">
            {/* Shortcuts Tab */}
            {activeTab === 'shortcuts' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {categories.map(category => (
                  <div key={category} className="space-y-3">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {Object.values(SHORTCUTS)
                        .filter(shortcut => shortcut.category === category)
                        .map((shortcut, index) => (
                          <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg bg-opacity-50 hover:bg-opacity-75 transition-colors" 
                               style={{ backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.5)' }}>
                            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {shortcut.description}
                            </span>
                            <kbd className={`px-2 py-1 text-xs font-mono rounded border ${
                              darkMode
                                ? 'bg-gray-700 border-gray-600 text-gray-300'
                                : 'bg-gray-100 border-gray-300 text-gray-700'
                            }`}>
                              {shortcut.key}
                            </kbd>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Getting Started Tab */}
            {activeTab === 'getting-started' && (
              <div className="space-y-6">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                  <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>Welcome to Land Visualizer!</h3>
                  <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    Follow these steps to get started with visualizing and planning your land area effectively.
                  </p>
                </div>
                
                <div className="space-y-4">
                  {gettingStarted.map((item, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {item.step}
                        </div>
                        <div>
                          <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.title}
                          </h4>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips Tab */}
            {activeTab === 'tips' && (
              <div className="space-y-4">
                {tipsAndTricks.map((tip, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      💡 {tip.title}
                    </h4>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {tip.description}
                    </p>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <p className={`text-sm font-mono ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                        {tip.tip}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Features Tab */}
            {activeTab === 'features' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <h4 className={`font-semibold mb-3 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      {feature.category}
                    </h4>
                    <ul className="space-y-2">
                      {feature.items.map((item, itemIndex) => (
                        <li key={itemIndex} className={`text-sm flex items-start ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <span className={`inline-block w-1 h-1 rounded-full mt-2 mr-3 flex-shrink-0 ${
                            darkMode ? 'bg-purple-400' : 'bg-purple-600'
                          }`}></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main keyboard navigation component
const KeyboardNavigation = ({ 
  darkMode,
  // All the callback functions needed for shortcuts
  toggleAreaCalculator,
  toggleCompassBearing,
  toggleTerrain,
  setDrawingMode,
  drawingMode,
  toggleDarkMode,
  exportToExcel,
  undo,
  redo,
  deleteSelected,
  setUnits
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Track input focus to prevent shortcuts from firing during typing
  useEffect(() => {
    const handleFocusIn = (event) => {
      if (event.target.tagName === 'INPUT' || 
          event.target.tagName === 'TEXTAREA' || 
          event.target.isContentEditable) {
        setIsInputFocused(true);
      }
    };

    const handleFocusOut = (event) => {
      if (event.target.tagName === 'INPUT' || 
          event.target.tagName === 'TEXTAREA' || 
          event.target.isContentEditable) {
        setIsInputFocused(false);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Special handler for help dialog
  useEffect(() => {
    const handleHelpKey = (event) => {
      if ((event.key === '?' || event.key === '/') && !isInputFocused) {
        event.preventDefault();
        setShowHelp(true);
      } else if (event.key === 'Escape' && showHelp) {
        setShowHelp(false);
      }
    };

    document.addEventListener('keydown', handleHelpKey);
    return () => document.removeEventListener('keydown', handleHelpKey);
  }, [isInputFocused, showHelp]);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    toggleAreaCalculator,
    toggleCompassBearing,
    toggleTerrain,
    setDrawingMode,
    drawingMode,
    toggleDarkMode,
    exportToExcel,
    undo,
    redo,
    deleteSelected,
    setUnits,
    isInputFocused
  });

  return (
    <>
      {/* Help button */}
      <button
        onClick={() => setShowHelp(true)}
        className={`fixed bottom-4 right-4 p-3 rounded-full shadow-lg transition-all z-40 ${
          darkMode
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700'
            : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 border border-gray-200'
        }`}
        title="Keyboard Shortcuts (Press ? for help)"
      >
        <Keyboard className="w-5 h-5" />
      </button>

      {/* Keyboard shortcuts help modal */}
      <KeyboardShortcutsHelp
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        darkMode={darkMode}
      />

      {/* Accessibility improvements */}
      <div className="sr-only" aria-live="polite">
        Press ? or / to show keyboard shortcuts
      </div>
    </>
  );
};

export default KeyboardNavigation;
export { KeyboardShortcutsHelp, useKeyboardShortcuts, SHORTCUTS };