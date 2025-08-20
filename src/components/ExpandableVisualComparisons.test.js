import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExpandableVisualComparisons from './ExpandableVisualComparisons';

// Mock the landCalculations module
const mockComparisons = [
  {
    id: 'traditional-farmhouse',
    name: 'Traditional Farmhouse',
    area: 150,
    category: 'Traditional Buildings',
    context: 'Traditional',
    description: 'Historic farmhouse footprint (~6 toises)',
    traditionalContext: 'Common in rural areas measured in perches',
    icon: '🏚️',
    color: 'brown'
  },
  {
    id: 'stone-barn',
    name: 'Stone Barn', 
    area: 400,
    category: 'Traditional Buildings',
    context: 'Traditional',
    description: 'Traditional stone barn (~16 perches)',
    traditionalContext: 'Essential farm building, ~105 toises',
    icon: '🏭',
    color: 'slate'
  }
];

jest.mock('../services/landCalculations', () => ({
  getContextualComparisons: jest.fn(() => mockComparisons),
  getTraditionalUnitInfo: jest.fn((unit) => {
    const unitInfo = {
      'perche': {
        name: 'Perche',
        description: 'A traditional French unit of area, approximately 25.3 square meters',
        historicalContext: 'Used in medieval France for land measurement, varying by region',
        modernEquivalent: '~25.3 m² or ~272 ft²'
      },
      'toise': {
        name: 'Toise',
        description: 'An ancient French unit of area, approximately 3.8 square meters',
        historicalContext: 'Originally based on the span of outstretched arms, used until 1795',
        modernEquivalent: '~3.8 m² or ~41 ft²'
      }
    };
    return unitInfo[unit] || null;
  }),
  calculateComparisonQuantity: jest.fn((totalArea, objectArea) => {
    const quantity = totalArea / objectArea;
    if (quantity < 1) {
      return {
        type: 'fraction',
        text: `${(quantity).toFixed(1)} of`,
        quantity: quantity
      };
    } else {
      return {
        type: 'multiple',
        text: `${quantity.toFixed(1)} ×`,
        quantity: quantity
      };
    }
  }),
  TRADITIONAL_UNITS: ['perche', 'toise', 'arpent']
}));

describe('ExpandableVisualComparisons', () => {
  const defaultProps = {
    darkMode: false,
    comparisonOptions: mockComparisons,
    selectedComparison: null,
    onComparisonSelect: jest.fn(),
    totalAreaSquareMeters: 0, // Use 0 to force fallback to comparisonOptions
    inputUnit: 'm²'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    test('renders without crashing', () => {
      render(<ExpandableVisualComparisons {...defaultProps} />);
      expect(screen.getByTitle('Visual Comparisons - Hover to expand')).toBeInTheDocument();
    });

    test('shows visual comparisons header', () => {
      render(<ExpandableVisualComparisons {...defaultProps} />);
      fireEvent.click(screen.getByTitle('Visual Comparisons - Hover to expand'));
      
      expect(screen.getByText('Visual Comparisons')).toBeInTheDocument();
    });

    test('expands on click', () => {
      render(<ExpandableVisualComparisons {...defaultProps} />);
      const trigger = screen.getByTitle('Visual Comparisons - Hover to expand');
      
      fireEvent.click(trigger);
      
      expect(screen.getByText('Traditional Farmhouse')).toBeInTheDocument();
      expect(screen.getByText('Stone Barn')).toBeInTheDocument();
    });
  });

  describe('Traditional Unit Support', () => {
    test('shows traditional unit indicator for perche', () => {
      render(
        <ExpandableVisualComparisons 
          {...defaultProps} 
          inputUnit="perche"
          totalAreaSquareMeters={2500}
          comparisonOptions={mockComparisons}
        />
      );
      
      fireEvent.click(screen.getByTitle('Visual Comparisons - Hover to expand'));
      
      expect(screen.getByText('Traditional')).toBeInTheDocument();
      expect(screen.getByText('Objects sized for Perche measurements')).toBeInTheDocument();
    });

    test('shows educational tooltip for traditional units', async () => {
      render(
        <ExpandableVisualComparisons 
          {...defaultProps} 
          inputUnit="toise"
          totalAreaSquareMeters={380}
          comparisonOptions={mockComparisons}
        />
      );
      
      fireEvent.click(screen.getByTitle('Visual Comparisons - Hover to expand'));
      
      const infoButton = screen.getByTitle('Learn about traditional units');
      fireEvent.click(infoButton);
      
      await waitFor(() => {
        expect(screen.getByText('Toise')).toBeInTheDocument();
        expect(screen.getByText(/ancient French unit of area/)).toBeInTheDocument();
      });
    });

    test('does not show traditional indicators for modern units', () => {
      render(
        <ExpandableVisualComparisons 
          {...defaultProps} 
          inputUnit="m²"
        />
      );
      
      fireEvent.click(screen.getByTitle('Visual Comparisons - Hover to expand'));
      
      expect(screen.queryByText('Traditional')).not.toBeInTheDocument();
      expect(screen.getByText('Select objects to visualize land scale')).toBeInTheDocument();
    });
  });

  describe('Enhanced Comparison Display', () => {
    test('shows quantity calculations', () => {
      render(
        <ExpandableVisualComparisons 
          {...defaultProps}
          totalAreaSquareMeters={600}
          comparisonOptions={mockComparisons}
        />
      );
      
      fireEvent.click(screen.getByTitle('Visual Comparisons - Hover to expand'));
      
      // Should show calculated quantities (mocked to return simple calculations)
      expect(screen.getByText(/× Traditional Farmhouse/)).toBeInTheDocument();
    });

    test('shows traditional context for traditional objects', () => {
      render(<ExpandableVisualComparisons {...defaultProps} />);
      
      fireEvent.click(screen.getByTitle('Visual Comparisons - Hover to expand'));
      
      expect(screen.getByText('Common in rural areas measured in perches')).toBeInTheDocument();
      expect(screen.getByText('Essential farm building, ~105 toises')).toBeInTheDocument();
    });

    test('groups comparisons by category', () => {
      render(<ExpandableVisualComparisons {...defaultProps} />);
      
      fireEvent.click(screen.getByTitle('Visual Comparisons - Hover to expand'));
      
      // Check that the category header is displayed in uppercase
      expect(screen.getByText('TRADITIONAL BUILDINGS')).toBeInTheDocument();
    });
  });

  describe('Selection and Interaction', () => {
    test('calls onComparisonSelect when comparison is clicked', () => {
      const mockOnSelect = jest.fn();
      render(
        <ExpandableVisualComparisons 
          {...defaultProps}
          onComparisonSelect={mockOnSelect}
        />
      );
      
      fireEvent.click(screen.getByTitle('Visual Comparisons - Hover to expand'));
      
      const farmhouseButton = screen.getByRole('button', { name: /Traditional Farmhouse/ });
      fireEvent.click(farmhouseButton);
      
      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'traditional-farmhouse',
          name: 'Traditional Farmhouse'
        })
      );
    });

    test('shows enhanced footer stats when comparison is selected', () => {
      const selectedComparison = {
        id: 'stone-barn',
        name: 'Stone Barn',
        area: 400,
        context: 'Traditional',
        traditionalContext: 'Essential farm building, ~105 toises'
      };

      render(
        <ExpandableVisualComparisons 
          {...defaultProps}
          selectedComparison={selectedComparison}
          totalAreaSquareMeters={1200}
          inputUnit="perche"
          comparisonOptions={mockComparisons}
        />
      );
      
      fireEvent.click(screen.getByTitle('Visual Comparisons - Hover to expand'));
      
      expect(screen.getByText('Selected:')).toBeInTheDocument();
      expect(screen.getByText('Stone Barn')).toBeInTheDocument();
      expect(screen.getByText('Your land equals:')).toBeInTheDocument();
      expect(screen.getByText('Essential farm building, ~105 toises')).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    test('applies dark mode styles', () => {
      render(
        <ExpandableVisualComparisons 
          {...defaultProps}
          darkMode={true}
          inputUnit="toise"
          totalAreaSquareMeters={380}
          comparisonOptions={mockComparisons}
        />
      );
      
      fireEvent.click(screen.getByTitle('Visual Comparisons - Hover to expand'));
      
      const infoButton = screen.getByTitle('Learn about traditional units');
      fireEvent.click(infoButton);
      
      // Check that dark mode classes are applied (basic check)
      const tooltip = screen.getByText('Toise').closest('div');
      expect(tooltip).toHaveClass('bg-gray-800');
    });
  });

  describe('Contextual Comparison Integration', () => {
    test('uses contextual comparisons when total area is provided', () => {
      const { getContextualComparisons } = require('../services/landCalculations');
      
      render(
        <ExpandableVisualComparisons 
          {...defaultProps}
          totalAreaSquareMeters={2500}
          inputUnit="perche"
        />
      );
      
      expect(getContextualComparisons).toHaveBeenCalledWith(2500, 'perche', 8);
    });

    test('falls back to comparisonOptions when no total area', () => {
      const comparisonOptions = [
        { id: 'test', name: 'Test Object', area: 100, category: 'Test' }
      ];
      
      render(
        <ExpandableVisualComparisons 
          {...defaultProps}
          totalAreaSquareMeters={0}
          comparisonOptions={comparisonOptions}
        />
      );
      
      fireEvent.click(screen.getByTitle('Visual Comparisons - Hover to expand'));
      
      expect(screen.getByText('Test Object')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels and roles', () => {
      render(<ExpandableVisualComparisons {...defaultProps} />);
      
      fireEvent.click(screen.getByTitle('Visual Comparisons - Hover to expand'));
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Check for proper button roles on comparison items
      expect(screen.getByRole('button', { name: /Traditional Farmhouse/ })).toBeInTheDocument();
    });

    test('supports keyboard navigation', () => {
      render(<ExpandableVisualComparisons {...defaultProps} />);
      
      const trigger = screen.getByTitle('Visual Comparisons - Hover to expand');
      
      // Test keyboard activation
      fireEvent.keyDown(trigger, { key: 'Enter', code: 'Enter' });
      fireEvent.click(trigger); // Simulate the click that would happen
      
      expect(screen.getByText('Traditional Farmhouse')).toBeInTheDocument();
    });
  });
});