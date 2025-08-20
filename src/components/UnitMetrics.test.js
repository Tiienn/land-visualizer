import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UnitMetrics from './UnitMetrics';

describe('UnitMetrics Component', () => {
  const mockUnits = [
    { value: 1000, unit: 'm²' },
    { value: 1500, unit: 'm²' }
  ];

  test('renders unit metrics with correct title', () => {
    render(<UnitMetrics darkMode={false} units={mockUnits} />);
    
    expect(screen.getByText('Unit Metrics')).toBeInTheDocument();
    expect(screen.getByText('Automatic area conversions for all popular units')).toBeInTheDocument();
  });

  test('displays total area calculation', () => {
    render(<UnitMetrics darkMode={false} units={mockUnits} />);
    
    // Total should be 2500 m² (1000 + 1500) - now formatted with comma
    expect(screen.getByText('2,500 m²')).toBeInTheDocument();
    expect(screen.getByText('Total Area')).toBeInTheDocument();
  });

  test('shows all unit conversions including yd²', () => {
    render(<UnitMetrics darkMode={false} units={mockUnits} />);
    
    // Check that major unit types are displayed
    expect(screen.getByText('Square Meters')).toBeInTheDocument();
    expect(screen.getByText('Square Feet')).toBeInTheDocument();
    expect(screen.getByText('Square Yards')).toBeInTheDocument();
    expect(screen.getByText('Acres')).toBeInTheDocument();
    expect(screen.getByText('Hectares')).toBeInTheDocument();
  });

  test('displays copy buttons for each unit', () => {
    render(<UnitMetrics darkMode={false} units={mockUnits} />);
    
    const copyButtons = screen.getAllByRole('button');
    // Should have copy buttons for each unit conversion
    expect(copyButtons.length).toBeGreaterThan(5);
  });

  test('shows empty state when no units provided', () => {
    render(<UnitMetrics darkMode={false} units={[]} />);
    
    expect(screen.getByText('Enter land area values to see automatic conversions')).toBeInTheDocument();
  });

  test('handles dark mode styling', () => {
    render(<UnitMetrics darkMode={true} units={mockUnits} />);
    
    // Component should render without errors in dark mode
    expect(screen.getByText('Unit Metrics')).toBeInTheDocument();
  });
});