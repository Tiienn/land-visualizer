import React, { useState, useRef, useEffect } from 'react';
import { 
  Square, 
  MousePointer, 
  Edit3, 
  Ruler,
  Mountain,
  FileDown,
  Plus,
  ChevronDown,
  Grid3x3,
  Edit,
  CornerDownRight,
  CornerUpLeft,
  Undo,
  Redo,
  ChevronLeft,
  ChevronRight,
  Move3D,
  Trash2,
} from 'lucide-react';
import { AccessibleButton, ScreenReaderOnly, LiveRegion, useKeyboardNavigation } from './AccessibilityUtils';

const AccessibleRibbon = ({
  darkMode,
  drawingMode,
  setDrawingMode,
  showMeasuringTape,
  toggleMeasuringTape,
  showDimensions,
  toggleDimensions,
  showAreaCalculator,
  toggleAreaCalculator,
  terrainEnabled,
  toggleTerrain,
  exportToExcel,
  selectedSubdivision,
  showAreaConfiguration,
  toggleAreaConfiguration,
  addUnit,
  onShowInsertArea,
  showInsertAreaDropdown,
  toggleInsertAreaDropdown,
  showPresetSelector,
  togglePresetSelector,
  onRemoveCorner,
  activePropertiesTool,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onShowEnterDimensions,
  onAddCorner,
  onDeleteCorner,
  selectedCorner,
  selectedEdge,
  activeSection = null,
  setActiveSection = () => {},
  isLeftSidebarExpanded = false,
  isPropertiesPanelExpanded = false,
  onToggleLeftSidebar = () => {},
  onToggleRightSidebar = () => {}
}) => {
  const [hoveredTool, setHoveredTool] = useState(null);
  const [focusedSectionIndex, setFocusedSectionIndex] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const ribbonRef = useRef(null);
  
  // Check corner count for delete button
  const cornerCount = selectedSubdivision?.corners?.length || 0;
  const hasMinimumCorners = cornerCount <= 3;
  const shouldDisableDelete = !selectedCorner || drawingMode !== 'select' || hasMinimumCorners;

  // Enhanced ribbon section configuration with accessibility data
  const ribbonSections = [
    {
      id: 'area-config',
      label: 'Area Configuration',
      ariaLabel: 'Area Configuration Tools',
      tools: [
        {
          id: 'insert-area',
          label: 'Insert Area',
          icon: Plus,
          active: false,
          action: () => {
            onShowInsertArea();
            announceAction('Insert Area dialog opened');
          },
          description: 'Insert area with specified dimensions',
          ariaLabel: 'Insert new area with custom dimensions',
          shortcut: 'Ctrl+I'
        },
        {
          id: 'add-area',
          label: 'Add Area',
          icon: Plus,
          active: false,
          action: () => {
            addUnit();
            announceAction('New area input added');
          },
          description: 'Add new area input',
          ariaLabel: 'Add new area input field',
          shortcut: 'Ctrl+N'
        },
        {
          id: 'presets',
          label: 'Presets',
          icon: Grid3x3,
          active: showPresetSelector,
          action: () => {
            togglePresetSelector();
            announceAction(`Presets ${showPresetSelector ? 'hidden' : 'shown'}`);
          },
          description: 'Select from predefined area presets',
          ariaLabel: 'Toggle area presets selector',
          shortcut: 'Ctrl+P'
        }
      ]
    },
    {
      id: 'drawing',
      label: 'Drawing Tools',
      ariaLabel: 'Drawing and Selection Tools',
      tools: [
        {
          id: 'select',
          label: 'Select',
          icon: MousePointer,
          active: drawingMode === 'select',
          action: () => {
            const newMode = drawingMode === 'select' ? null : 'select';
            setDrawingMode(newMode);
            announceAction(`${newMode ? 'Selection' : 'Drawing'} mode activated`);
          },
          description: 'Select and move subdivisions',
          ariaLabel: 'Select and move subdivisions',
          shortcut: 'S'
        },
        {
          id: 'rectangle',
          label: 'Rectangle',
          icon: Square,
          active: drawingMode === 'rectangle',
          action: () => {
            const newMode = drawingMode === 'rectangle' ? null : 'rectangle';
            setDrawingMode(newMode);
            announceAction(`${newMode ? 'Rectangle drawing' : 'Drawing'} mode ${newMode ? 'activated' : 'deactivated'}`);
          },
          description: 'Draw rectangular subdivisions',
          ariaLabel: 'Draw rectangular subdivisions',
          shortcut: 'R'
        },
        {
          id: 'polyline',
          label: 'Polyline',
          icon: Edit3,
          active: drawingMode === 'polyline',
          action: () => {
            const newMode = drawingMode === 'polyline' ? null : 'polyline';
            setDrawingMode(newMode);
            announceAction(`${newMode ? 'Irregular polygon drawing' : 'Drawing'} mode ${newMode ? 'activated' : 'deactivated'}`);
          },
          description: 'Draw irregular boundaries',
          ariaLabel: 'Draw irregular polygon boundaries',
          shortcut: 'P'
        }
      ]
    },
    {
      id: 'tools',
      label: 'Measurement Tools',
      ariaLabel: 'Measurement and Analysis Tools',
      tools: [
        {
          id: 'measuring-tape',
          label: 'Measuring Tape',
          icon: Ruler,
          active: showMeasuringTape,
          action: () => {
            toggleMeasuringTape();
            announceAction(`Measuring tape ${showMeasuringTape ? 'hidden' : 'shown'}`);
          },
          description: 'Measure distances between points',
          ariaLabel: 'Toggle measuring tape tool',
          shortcut: 'M'
        },
        {
          id: 'dimensions',
          label: 'Dimensions',
          icon: Ruler,
          active: showDimensions,
          action: () => {
            toggleDimensions();
            announceAction(`Dimension lines ${showDimensions ? 'hidden' : 'shown'}`);
          },
          description: 'Show/hide dimension lines on subdivisions',
          ariaLabel: 'Toggle dimension line display',
          shortcut: 'D'
        },
        {
          id: 'enter-dimensions',
          label: 'Enter Dimensions',
          icon: Edit,
          active: activePropertiesTool === 'dimensions',
          action: () => {
            onShowEnterDimensions();
            announceAction('Dimension entry dialog opened');
          },
          description: 'Enter custom dimensions for land areas',
          ariaLabel: 'Open dimension entry dialog',
          shortcut: 'Ctrl+D'
        },
        {
          id: 'undo',
          label: 'Undo',
          icon: Undo,
          active: false,
          action: () => {
            onUndo();
            announceAction('Last action undone');
          },
          description: 'Undo last action',
          ariaLabel: 'Undo last action',
          disabled: !canUndo,
          shortcut: 'Ctrl+Z'
        },
        {
          id: 'redo',
          label: 'Redo',
          icon: Redo,
          active: false,
          action: () => {
            onRedo();
            announceAction('Last undone action redone');
          },
          description: 'Redo last undone action',
          ariaLabel: 'Redo last undone action',
          disabled: !canRedo,
          shortcut: 'Ctrl+Y'
        }
      ]
    },
    {
      id: 'view',
      label: 'View Controls',
      ariaLabel: 'View and Display Controls',
      tools: [
        {
          id: 'terrain',
          label: 'Terrain',
          icon: Mountain,
          active: terrainEnabled,
          action: () => {
            toggleTerrain();
            announceAction(`Terrain ${terrainEnabled ? 'disabled' : 'enabled'}`);
          },
          description: 'Toggle terrain elevation display',
          ariaLabel: 'Toggle terrain elevation display',
          shortcut: 'T'
        },
        {
          id: 'left-sidebar',
          label: 'Left Panel',
          icon: ChevronLeft,
          active: isLeftSidebarExpanded,
          action: () => {
            onToggleLeftSidebar();
            announceAction(`Left panel ${isLeftSidebarExpanded ? 'collapsed' : 'expanded'}`);
          },
          description: 'Toggle left sidebar',
          ariaLabel: 'Toggle left sidebar panel',
          shortcut: 'F9'
        },
        {
          id: 'right-sidebar',
          label: 'Right Panel',
          icon: ChevronRight,
          active: isPropertiesPanelExpanded,
          action: () => {
            onToggleRightSidebar();
            announceAction(`Right panel ${isPropertiesPanelExpanded ? 'collapsed' : 'expanded'}`);
          },
          description: 'Toggle properties panel',
          ariaLabel: 'Toggle properties panel',
          shortcut: 'F10'
        }
      ]
    },
    {
      id: 'corner-controls',
      label: 'Corner Controls',
      ariaLabel: 'Corner Editing Controls',
      tools: [
        {
          id: 'add-corner',
          label: 'Add Corner',
          icon: CornerDownRight,
          active: false,
          action: () => {
            onAddCorner();
            announceAction('Corner added to subdivision');
          },
          disabled: !selectedCorner || drawingMode !== 'select',
          description: 'Add corner after selected corner',
          ariaLabel: 'Add corner to selected subdivision',
          shortcut: 'Ctrl++'
        },
        {
          id: 'delete-corner',
          label: 'Delete Corner',
          icon: CornerUpLeft,
          active: false,
          action: () => {
            onDeleteCorner();
            announceAction('Corner removed from subdivision');
          },
          disabled: shouldDisableDelete,
          description: hasMinimumCorners
            ? 'Cannot delete corner (minimum 3 required)' 
            : 'Remove selected corner',
          ariaLabel: hasMinimumCorners
            ? 'Cannot delete corner, minimum 3 corners required'
            : 'Delete selected corner',
          shortcut: 'Delete'
        }
      ]
    },
    {
      id: 'export',
      label: 'Export Tools',
      ariaLabel: 'Data Export Tools',
      tools: [
        {
          id: 'excel-export',
          label: 'Export to Excel',
          icon: FileDown,
          active: false,
          action: () => {
            exportToExcel();
            announceAction('Data exported to Excel file');
          },
          description: 'Export data to Excel spreadsheet',
          ariaLabel: 'Export land data to Excel spreadsheet',
          shortcut: 'Ctrl+E'
        }
      ]
    }
  ];

  // Keyboard navigation setup
  const allTools = ribbonSections.flatMap(section => section.tools);
  const { selectedIndex: selectedToolIndex } = useKeyboardNavigation(allTools, (tool) => {
    if (!tool.disabled) {
      tool.action();
    }
  });

  // Announce actions to screen readers
  const announceAction = (message) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 3000);
  };

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Skip if user is typing in an input
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      const { ctrlKey, key } = event;
      
      // Tool shortcuts
      if (!ctrlKey) {
        switch (key.toLowerCase()) {
          case 's':
            event.preventDefault();
            setDrawingMode(drawingMode === 'select' ? null : 'select');
            announceAction('Selection mode toggled');
            break;
          case 'r':
            event.preventDefault();
            setDrawingMode(drawingMode === 'rectangle' ? null : 'rectangle');
            announceAction('Rectangle drawing mode toggled');
            break;
          case 'p':
            event.preventDefault();
            setDrawingMode(drawingMode === 'polyline' ? null : 'polyline');
            announceAction('Polyline drawing mode toggled');
            break;
          case 'm':
            event.preventDefault();
            toggleMeasuringTape();
            announceAction('Measuring tape toggled');
            break;
          case 'd':
            event.preventDefault();
            toggleDimensions();
            announceAction('Dimensions toggled');
            break;
          case 't':
            event.preventDefault();
            toggleTerrain();
            announceAction('Terrain toggled');
            break;
          case 'delete':
            if (!shouldDisableDelete) {
              event.preventDefault();
              onDeleteCorner();
              announceAction('Corner deleted');
            }
            break;
          case 'f9':
            event.preventDefault();
            onToggleLeftSidebar();
            announceAction('Left panel toggled');
            break;
          case 'f10':
            event.preventDefault();
            onToggleRightSidebar();
            announceAction('Right panel toggled');
            break;
        }
      } else {
        // Ctrl + key shortcuts
        switch (key.toLowerCase()) {
          case 'i':
            event.preventDefault();
            onShowInsertArea();
            announceAction('Insert area dialog opened');
            break;
          case 'n':
            event.preventDefault();
            addUnit();
            announceAction('New area input added');
            break;
          case 'p':
            event.preventDefault();
            togglePresetSelector();
            announceAction('Presets toggled');
            break;
          case 'd':
            event.preventDefault();
            onShowEnterDimensions();
            announceAction('Enter dimensions dialog opened');
            break;
          case 'e':
            event.preventDefault();
            exportToExcel();
            announceAction('Data exported to Excel');
            break;
          case 'z':
            if (canUndo) {
              event.preventDefault();
              onUndo();
              announceAction('Action undone');
            }
            break;
          case 'y':
            if (canRedo) {
              event.preventDefault();
              onRedo();
              announceAction('Action redone');
            }
            break;
          case '=':
          case '+':
            if (!shouldDisableDelete) {
              event.preventDefault();
              onAddCorner();
              announceAction('Corner added');
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    drawingMode, setDrawingMode, toggleMeasuringTape, toggleDimensions,
    toggleTerrain, onShowInsertArea, addUnit,
    togglePresetSelector, onShowEnterDimensions, exportToExcel,
    canUndo, canRedo, onUndo, onRedo, shouldDisableDelete, onDeleteCorner,
    onAddCorner, onToggleLeftSidebar, onToggleRightSidebar
  ]);

  const ToolButton = ({ tool, sectionIndex, toolIndex }) => {
    const isSelected = selectedToolIndex === toolIndex;
    
    return (
      <AccessibleButton
        onClick={tool.action}
        disabled={tool.disabled}
        ariaLabel={tool.ariaLabel || tool.label}
        ariaDescribedBy={`${tool.id}-tooltip`}
        className={`
          relative p-3 m-1 rounded-md transition-all duration-150 group
          ${tool.active 
            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
            : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }
          ${tool.disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer'
          }
          ${isSelected ? 'ring-2 ring-blue-500' : ''}
          focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        `}
        onMouseEnter={() => setHoveredTool(tool.id)}
        onMouseLeave={() => setHoveredTool(null)}
        onFocus={() => announceAction(`${tool.label} tool focused`)}
      >
        <tool.icon 
          className="w-5 h-5" 
          aria-hidden="true"
        />
        
        <ScreenReaderOnly>
          {tool.label}
          {tool.shortcut && ` (${tool.shortcut})`}
          {tool.active && ' - Active'}
          {tool.disabled && ' - Disabled'}
        </ScreenReaderOnly>
        
        {/* Tooltip */}
        {(hoveredTool === tool.id || isSelected) && (
          <div 
            id={`${tool.id}-tooltip`}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap z-50"
            role="tooltip"
          >
            {tool.description}
            {tool.shortcut && (
              <span className="block text-gray-300 text-xs">
                Shortcut: {tool.shortcut}
              </span>
            )}
          </div>
        )}
      </AccessibleButton>
    );
  };

  return (
    <nav 
      ref={ribbonRef}
      className="bg-white border-b border-gray-200 px-4 py-2"
      role="toolbar"
      aria-label="Land Visualizer Tools"
      tabIndex={-1}
    >
      <ScreenReaderOnly>
        <h2>Tool Ribbon - Use Tab to navigate tools, Space or Enter to activate</h2>
      </ScreenReaderOnly>
      
      <div className="flex items-center space-x-6 overflow-x-auto">
        {ribbonSections.map((section, sectionIndex) => (
          <fieldset 
            key={section.id}
            className="flex items-center space-x-1 border-l border-gray-200 pl-4 first:border-l-0 first:pl-0"
            role="group"
            aria-labelledby={`${section.id}-label`}
          >
            <legend 
              id={`${section.id}-label`}
              className="text-xs font-medium text-gray-600 mb-2 px-1"
            >
              {section.label}
            </legend>
            
            <div className="flex items-center space-x-1" role="group">
              {section.tools.map((tool, toolIndex) => (
                <ToolButton 
                  key={tool.id}
                  tool={tool}
                  sectionIndex={sectionIndex}
                  toolIndex={toolIndex}
                />
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      
      {/* Live region for announcements */}
      <LiveRegion priority="polite">
        {announcement}
      </LiveRegion>
      
      {/* Keyboard shortcuts help */}
      <ScreenReaderOnly>
        <div>
          Available keyboard shortcuts: S for Select, R for Rectangle, P for Polyline, 
          M for Measuring Tape, D for Dimensions, T for Terrain, C for Compass, 
          Ctrl+Z for Undo, Ctrl+Y for Redo, F9 for Left Panel, F10 for Right Panel
        </div>
      </ScreenReaderOnly>
    </nav>
  );
};

export default AccessibleRibbon;