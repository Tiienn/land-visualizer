import React, { useState } from 'react';
import { 
  Square, 
  MousePointer, 
  Edit3, 
  Ruler,
  Mountain,
  Compass,
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

const Ribbon = ({
  darkMode,
  // Drawing Tools
  drawingMode,
  setDrawingMode,
  
  // Dimensions
  showDimensions,
  toggleDimensions,
  
  // Calculator
  showAreaCalculator,
  toggleAreaCalculator,
  
  // Terrain
  terrainEnabled,
  toggleTerrain,
  
  // Compass
  showCompassBearing,
  toggleCompassBearing,
  
  // Export
  exportToExcel,
  
  // Corner Controls (passed through for future implementation)
  selectedSubdivision,
  
  // Area Configuration
  showAreaConfiguration,
  toggleAreaConfiguration,
  addUnit,
  onShowInsertArea,
  showInsertAreaDropdown,
  toggleInsertAreaDropdown,
  showPresetSelector,
  togglePresetSelector,
  
  // Corner Controls (legacy)
  onRemoveCorner,
  
  // Properties Tool State
  activePropertiesTool,
  
  // Undo/Redo
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  
  // Enter Dimensions
  onShowEnterDimensions,
  
  // Corner Management
  onAddCorner,
  onDeleteCorner,
  selectedCorner,
  selectedEdge,
  
  // Additional state for ribbon sections
  activeSection = null,
  setActiveSection = () => {},
  
  // Sidebar expansion states
  isLeftSidebarExpanded = false,
  isPropertiesPanelExpanded = false,
  onToggleLeftSidebar = () => {},
  onToggleRightSidebar = () => {}
}) => {
  const [hoveredTool, setHoveredTool] = useState(null);
  
  // Check corner count for delete button
  const cornerCount = selectedSubdivision?.corners?.length || 0;
  const hasMinimumCorners = cornerCount <= 3;
  const shouldDisableDelete = !selectedCorner || drawingMode !== 'select' || hasMinimumCorners;

  // Ribbon section configuration
  const ribbonSections = [
    {
      id: 'area-config',
      label: 'Area Configuration',
      tools: [
        {
          id: 'insert-area',
          label: 'Insert Area',
          icon: Plus,
          active: false,
          action: onShowInsertArea,
          description: 'Insert area with specified dimensions'
        },
        {
          id: 'add-area',
          label: 'Add Area',
          icon: Plus,
          active: false,
          action: addUnit,
          description: 'Add new area input'
        },
        {
          id: 'presets',
          label: 'Presets',
          icon: Grid3x3,
          active: showPresetSelector,
          action: togglePresetSelector,
          description: 'Select from predefined area presets'
        }
      ]
    },
    {
      id: 'drawing',
      label: 'Drawing Tools',
      tools: [
        {
          id: 'select',
          label: 'Select',
          icon: MousePointer,
          active: drawingMode === 'select',
          action: () => setDrawingMode(drawingMode === 'select' ? null : 'select'),
          description: 'Select and move subdivisions'
        },
        {
          id: 'rectangle',
          label: 'Rectangle',
          icon: Square,
          active: drawingMode === 'rectangle',
          action: () => setDrawingMode(drawingMode === 'rectangle' ? null : 'rectangle'),
          description: 'Draw rectangular subdivisions'
        },
        {
          id: 'polyline',
          label: 'Polyline',
          icon: Edit3,
          active: drawingMode === 'polyline',
          action: () => setDrawingMode(drawingMode === 'polyline' ? null : 'polyline'),
          description: 'Draw irregular boundaries'
        }
      ]
    },
    {
      id: 'tools',
      label: 'Tools',
      tools: [
        {
          id: 'dimensions',
          label: 'Dimensions',
          icon: Ruler,
          active: showDimensions,
          action: toggleDimensions,
          description: 'Show/hide dimension lines on subdivisions'
        },
        {
          id: 'enter-dimensions',
          label: 'Enter Dimensions',
          icon: Edit,
          active: activePropertiesTool === 'dimensions',
          action: onShowEnterDimensions,
          description: 'Enter custom dimensions for land areas'
        },
        {
          id: 'undo',
          label: 'Undo',
          icon: Undo,
          active: false,
          action: onUndo,
          description: 'Undo last action',
          disabled: !canUndo
        },
        {
          id: 'redo',
          label: 'Redo',
          icon: Redo,
          active: false,
          action: onRedo,
          description: 'Redo last undone action',
          disabled: !canRedo
        }
      ]
    },
    {
      id: 'corner-controls',
      label: 'Corner Controls',
      tools: [
        {
          id: 'add-corner',
          label: 'Add Corner',
          icon: CornerDownRight,
          active: false,
          action: onAddCorner,
          description: 'Add corner after selected corner',
          disabled: !selectedCorner || drawingMode !== 'select'
        },
        {
          id: 'delete-corner',
          label: 'Delete Corner',
          icon: CornerUpLeft,
          active: false,
          action: onDeleteCorner,
          description: shouldDisableDelete
            ? 'Cannot delete corner (minimum 3 required)' 
            : 'Remove selected corner',
          disabled: shouldDisableDelete
        }
      ]
    },
    {
      id: 'terrain',
      label: 'Terrain Elevation',
      tools: [
        {
          id: 'terrain-toggle',
          label: 'Terrain',
          icon: Mountain,
          active: terrainEnabled,
          action: toggleTerrain,
          description: 'Enable terrain elevation visualization'
        }
      ]
    },
    {
      id: 'compass',
      label: 'Compass & Bearing',
      tools: [
        {
          id: 'compass-bearing',
          label: 'Compass',
          icon: Compass,
          active: showCompassBearing,
          action: toggleCompassBearing,
          description: 'Measure directions and bearings'
        }
      ]
    },
    {
      id: 'export',
      label: 'Export',
      tools: [
        {
          id: 'export-excel',
          label: 'Excel Export',
          icon: FileDown,
          active: false,
          action: exportToExcel,
          description: 'Export data to Excel spreadsheet'
        }
      ]
    }
  ];

  const RibbonTool = ({ tool, sectionId }) => {
    const isDisabled = tool.disabled;
    const baseClasses = `
      flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200
      min-w-[80px] h-[70px] relative group cursor-pointer
      ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
    `;
    
    const stateClasses = tool.active
      ? darkMode
        ? 'bg-blue-600 text-white shadow-md'
        : 'bg-blue-100 text-blue-700 shadow-md'
      : darkMode
        ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
        : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900';

    return (
      <div
        className={`${baseClasses} ${stateClasses}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isDisabled) {
            // Add small delay to prevent camera interference during state updates
            setTimeout(() => {
              tool.action();
            }, 16); // One frame delay (~16ms at 60fps)
          }
        }}
        onMouseEnter={() => setHoveredTool(`${sectionId}-${tool.id}`)}
        onMouseLeave={() => setHoveredTool(null)}
      >
        <tool.icon size={20} className="mb-1" />
        <span className="text-xs text-center leading-tight font-medium">
          {tool.label}
        </span>
        
        {/* Tooltip */}
        {hoveredTool === `${sectionId}-${tool.id}` && (
          <div className={`
            absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50
            px-3 py-2 text-xs rounded-lg shadow-lg pointer-events-none whitespace-nowrap
            ${darkMode 
              ? 'bg-gray-900 text-white border border-gray-700' 
              : 'bg-gray-800 text-white'
            }
          `}>
            {tool.description}
            <div className={`
              absolute top-full left-1/2 transform -translate-x-1/2 
              border-4 border-transparent
              ${darkMode ? 'border-t-gray-900' : 'border-t-gray-800'}
            `} />
          </div>
        )}
      </div>
    );
  };

  const RibbonSection = ({ section }) => (
    <div className={`
      flex flex-col border-r last:border-r-0 px-4 py-2
      ${darkMode ? 'border-gray-600' : 'border-gray-300'}
    `}>
      {/* Section Label */}
      <div className={`
        text-xs font-medium mb-2 text-center
        ${darkMode ? 'text-gray-400' : 'text-gray-600'}
      `}>
        {section.label}
      </div>
      
      {/* Tools */}
      <div className="flex gap-2 justify-center">
        {section.tools.map((tool) => (
          <RibbonTool 
            key={tool.id} 
            tool={tool} 
            sectionId={section.id}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div 
      className={`
        relative w-full border-b shadow-sm
        ${darkMode 
          ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700' 
          : 'bg-gradient-to-r from-slate-50 to-slate-100 border-gray-200'
        }
      `}
    >

      {/* Ribbon Header */}
      <div className={`
        px-6 py-2 border-b text-sm font-semibold
        ${darkMode 
          ? 'text-gray-300 border-gray-600' 
          : 'text-gray-700 border-gray-200'
        }
      `}>
        Tools & Functions
      </div>

      {/* Ribbon Content */}
      <div className="flex items-stretch overflow-x-auto py-3">
        {ribbonSections.map((section) => (
          <RibbonSection key={section.id} section={section} />
        ))}
      </div>

      {/* Quick Status Bar (Optional) */}
      <div className={`
        px-6 py-1 text-xs border-t
        ${darkMode 
          ? 'bg-gray-800 text-gray-400 border-gray-700' 
          : 'bg-gray-50 text-gray-600 border-gray-200'
        }
      `}>
        <div className="flex justify-between items-center">
          <span className="flex gap-4">
            {showAreaCalculator && <span>🧮 Calculating</span>}
            {terrainEnabled && <span>🏔️ Terrain</span>}
            {showCompassBearing && <span>🧭 Compass</span>}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Ribbon;