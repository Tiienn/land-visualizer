import { renderHook, act } from '@testing-library/react';
import useAppState from './useAppState';

describe('useAppState', () => {
  test('should initialize with default state', () => {
    const { result } = renderHook(() => useAppState());
    
    expect(result.current.units).toHaveLength(1);
    expect(result.current.units[0]).toEqual({ value: 5000, unit: 'm²' });
    expect(result.current.subdivisions).toHaveLength(1);
    expect(result.current.subdivisions[0].id).toBe('default-square');
    expect(result.current.darkMode).toBe(false);
    expect(result.current.drawingMode).toBe(null);
  });

  test('should handle unit updates', () => {
    const { result } = renderHook(() => useAppState());
    
    act(() => {
      result.current.setUnits([{ value: 10000, unit: 'ft²' }]);
    });
    
    expect(result.current.units).toHaveLength(1);
    expect(result.current.units[0]).toEqual({ value: 10000, unit: 'ft²' });
  });

  test('should handle subdivision updates', () => {
    const { result } = renderHook(() => useAppState());
    
    const newSubdivision = {
      id: 'test-subdivision',
      type: 'rectangle',
      position: { x: 10, z: 10 },
      width: 20,
      height: 15,
      label: 'Test Area',
      color: '#ff0000'
    };
    
    act(() => {
      result.current.setSubdivisions(prev => [...prev, newSubdivision]);
    });
    
    expect(result.current.subdivisions).toHaveLength(2);
    expect(result.current.subdivisions[1]).toEqual(newSubdivision);
  });

  test('should handle undo/redo functionality', () => {
    const { result } = renderHook(() => useAppState());
    
    const originalUnits = result.current.units;
    
    act(() => {
      result.current.setUnits([{ value: 8000, unit: 'acres' }]);
    });
    
    expect(result.current.units[0]).toEqual({ value: 8000, unit: 'acres' });
    expect(result.current.canUndo).toBe(true);
    
    act(() => {
      result.current.undo();
    });
    
    expect(result.current.units).toEqual(originalUnits);
    expect(result.current.canRedo).toBe(true);
    
    act(() => {
      result.current.redo();
    });
    
    expect(result.current.units[0]).toEqual({ value: 8000, unit: 'acres' });
  });

  test('should handle UI state changes', () => {
    const { result } = renderHook(() => useAppState());
    
    act(() => {
      result.current.setDarkMode(true);
      result.current.setDrawingMode('rectangle');
      result.current.setShowMeasuringTape(true);
    });
    
    expect(result.current.darkMode).toBe(true);
    expect(result.current.drawingMode).toBe('rectangle');
    expect(result.current.showMeasuringTape).toBe(true);
  });

  test('should handle modal state', () => {
    const { result } = renderHook(() => useAppState());
    
    act(() => {
      result.current.setShowInsertAreaModal(true);
      result.current.setAreaInputValue('5000');
      result.current.setAreaInputUnit('hectares');
    });
    
    expect(result.current.showInsertAreaModal).toBe(true);
    expect(result.current.areaInputValue).toBe('5000');
    expect(result.current.areaInputUnit).toBe('hectares');
  });

  test('should handle functional updates', () => {
    const { result } = renderHook(() => useAppState());
    
    act(() => {
      result.current.setUnits(prevUnits => [
        ...prevUnits,
        { value: 2000, unit: 'hectares' }
      ]);
    });
    
    expect(result.current.units).toHaveLength(2);
    expect(result.current.units[1]).toEqual({ value: 2000, unit: 'hectares' });
  });
});