import { renderHook, act } from '@testing-library/react';
import { useUndoRedo } from './useUndoRedo';

describe('useUndoRedo Hook', () => {
  const initialState = {
    subdivisions: [
      { id: 'test-1', area: 1000, corners: [{ x: 0, z: 0 }, { x: 10, z: 10 }] }
    ],
    units: [{ value: 1000, unit: 'm²' }],
    selectedSubdivision: null
  };

  describe('Basic Functionality', () => {
    test('should initialize with correct initial state', () => {
      const { result } = renderHook(() => useUndoRedo(initialState));
      
      expect(result.current.present).toEqual(initialState);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
      expect(result.current.historyLength).toBe(0);
    });

    test('should execute state changes and enable undo', () => {
      const { result } = renderHook(() => useUndoRedo(initialState));
      
      act(() => {
        result.current.updateState({
          subdivisions: [
            ...initialState.subdivisions,
            { id: 'test-2', area: 2000, corners: [{ x: 0, z: 0 }, { x: 20, z: 20 }] }
          ]
        });
      });

      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
      expect(result.current.historyLength).toBe(1);
      expect(result.current.present.subdivisions).toHaveLength(2);
    });

    test('should undo changes correctly', () => {
      const { result } = renderHook(() => useUndoRedo(initialState));
      
      // Make a change
      act(() => {
        result.current.updateState({
          subdivisions: [
            ...initialState.subdivisions,
            { id: 'test-2', area: 2000, corners: [] }
          ]
        });
      });

      // Undo the change
      act(() => {
        result.current.undo();
      });

      expect(result.current.present.subdivisions).toHaveLength(1);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);
    });

    test('should redo changes correctly', () => {
      const { result } = renderHook(() => useUndoRedo(initialState));
      
      // Make a change
      act(() => {
        result.current.updateState({
          subdivisions: [
            ...initialState.subdivisions,
            { id: 'test-2', area: 2000, corners: [] }
          ]
        });
      });

      // Undo
      act(() => {
        result.current.undo();
      });

      // Redo
      act(() => {
        result.current.redo();
      });

      expect(result.current.present.subdivisions).toHaveLength(2);
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
    });
  });

  describe('Deep Cloning', () => {
    test('should deep clone complex nested objects', () => {
      const { result } = renderHook(() => useUndoRedo(initialState));
      
      // Modify nested corner data
      act(() => {
        const newSubdivisions = [...result.current.present.subdivisions];
        newSubdivisions[0] = {
          ...newSubdivisions[0],
          corners: [{ x: 5, z: 5 }, { x: 15, z: 15 }]
        };
        result.current.updateState({ subdivisions: newSubdivisions });
      });

      // Undo
      act(() => {
        result.current.undo();
      });

      // Verify original nested data is restored
      expect(result.current.present.subdivisions[0].corners[0].x).toBe(0);
      expect(result.current.present.subdivisions[0].corners[1].x).toBe(10);
    });

    test('should not affect original state when modifying cloned state', () => {
      const { result } = renderHook(() => useUndoRedo(initialState));
      
      // Get reference to current state
      const currentState = result.current.present;
      
      // Make a change
      act(() => {
        result.current.updateState({
          subdivisions: [
            { id: 'new-sub', area: 5000, corners: [{ x: 100, z: 100 }] }
          ]
        });
      });

      // Original reference should remain unchanged
      expect(currentState.subdivisions[0].area).toBe(1000);
      expect(currentState.subdivisions[0].corners[0].x).toBe(0);
    });
  });

  describe('State Filtering', () => {
    test('should exclude specified keys from history', () => {
      const stateWithUI = {
        ...initialState,
        ui: { showModal: true },
        temporary: { dragState: 'active' }
      };

      const { result } = renderHook(() => 
        useUndoRedo(stateWithUI, { excludedKeys: ['ui', 'temporary'] })
      );

      // Make change including excluded keys
      act(() => {
        result.current.updateState({
          subdivisions: [...stateWithUI.subdivisions, { id: 'new' }],
          ui: { showModal: false },
          temporary: { dragState: 'inactive' }
        });
      });

      // Undo should not restore excluded keys
      act(() => {
        result.current.undo();
      });

      expect(result.current.present.subdivisions).toHaveLength(1);
      expect(result.current.present.ui).toBeUndefined();
      expect(result.current.present.temporary).toBeUndefined();
    });

    test('should only track specified keys when trackedKeys is provided', () => {
      const { result } = renderHook(() => 
        useUndoRedo(initialState, { trackedKeys: ['subdivisions'] })
      );

      // Make changes to both tracked and untracked keys
      act(() => {
        result.current.updateState({
          subdivisions: [...initialState.subdivisions, { id: 'new' }],
          units: [{ value: 2000, unit: 'm²' }],
          selectedSubdivision: 'test-1'
        });
      });

      // Undo should only restore tracked keys
      act(() => {
        result.current.undo();
      });

      expect(result.current.present.subdivisions).toHaveLength(1);
      expect(result.current.present.units).toBeUndefined();
      expect(result.current.present.selectedSubdivision).toBeUndefined();
    });
  });

  describe('Memory Management', () => {
    test('should respect maxHistorySize limit', () => {
      const { result } = renderHook(() => 
        useUndoRedo(initialState, { maxHistorySize: 3 })
      );

      // Add 5 changes (exceeds limit of 3)
      act(() => {
        for (let i = 1; i <= 5; i++) {
          result.current.updateState({
            subdivisions: [
              ...initialState.subdivisions,
              { id: `test-${i}`, area: i * 1000, corners: [] }
            ]
          });
        }
      });

      expect(result.current.historyLength).toBe(3); // Should not exceed limit
    });

    test('should provide memory usage metadata', () => {
      const { result } = renderHook(() => useUndoRedo(initialState));

      expect(typeof result.current.memoryUsageMB).toBe('number');
      expect(result.current.memoryUsageMB).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Action Grouping', () => {
    test('should group rapid actions when using updateGrouped', async () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => 
        useUndoRedo(initialState, { groupingTimeout: 100 })
      );

      // Make rapid grouped updates
      act(() => {
        result.current.updateGrouped({ selectedSubdivision: 'test-1' });
        result.current.updateGrouped({ selectedSubdivision: 'test-2' });
        result.current.updateGrouped({ selectedSubdivision: 'test-3' });
      });

      expect(result.current.isGrouping).toBe(true);
      expect(result.current.historyLength).toBe(0); // No history yet

      // Fast forward past grouping timeout
      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(result.current.isGrouping).toBe(false);
      expect(result.current.historyLength).toBe(1); // Only one history entry
      expect(result.current.present.selectedSubdivision).toBe('test-3');

      jest.useRealTimers();
    });
  });

  describe('Function-based Updates', () => {
    test('should handle function-based state updates', () => {
      const { result } = renderHook(() => useUndoRedo(initialState));

      act(() => {
        result.current.updateState(prevState => ({
          subdivisions: [
            ...prevState.subdivisions,
            { id: 'functional-update', area: 3000, corners: [] }
          ]
        }));
      });

      expect(result.current.present.subdivisions).toHaveLength(2);
      expect(result.current.present.subdivisions[1].id).toBe('functional-update');
    });
  });

  describe('Edge Cases', () => {
    test('should not add history entry for identical state changes', () => {
      const { result } = renderHook(() => useUndoRedo(initialState));

      // Update with identical state
      act(() => {
        result.current.updateState(initialState);
      });

      expect(result.current.historyLength).toBe(0);
      expect(result.current.canUndo).toBe(false);
    });

    test('should handle undo with no history gracefully', () => {
      const { result } = renderHook(() => useUndoRedo(initialState));

      act(() => {
        result.current.undo();
      });

      expect(result.current.present).toEqual(initialState);
      expect(result.current.canUndo).toBe(false);
    });

    test('should handle redo with no future gracefully', () => {
      const { result } = renderHook(() => useUndoRedo(initialState));

      act(() => {
        result.current.redo();
      });

      expect(result.current.present).toEqual(initialState);
      expect(result.current.canRedo).toBe(false);
    });

    test('should clear future when new action is performed after undo', () => {
      const { result } = renderHook(() => useUndoRedo(initialState));

      // Make two changes
      act(() => {
        result.current.updateState({ subdivisions: [...initialState.subdivisions, { id: 'first' }] });
      });
      act(() => {
        result.current.updateState({ subdivisions: [...initialState.subdivisions, { id: 'second' }] });
      });

      // Undo one
      act(() => {
        result.current.undo();
      });

      expect(result.current.canRedo).toBe(true);

      // Make new change (should clear future)
      act(() => {
        result.current.updateState({ subdivisions: [...initialState.subdivisions, { id: 'new-branch' }] });
      });

      expect(result.current.canRedo).toBe(false);
      expect(result.current.futureLength).toBe(0);
    });
  });

  describe('History Reset and Jump', () => {
    test('should reset history correctly', () => {
      const { result } = renderHook(() => useUndoRedo(initialState));

      // Make some changes
      act(() => {
        result.current.updateState({ subdivisions: [...initialState.subdivisions, { id: 'temp' }] });
        result.current.updateState({ subdivisions: [...initialState.subdivisions, { id: 'temp2' }] });
      });

      // Reset with new initial state
      const newInitialState = { subdivisions: [], units: [] };
      act(() => {
        result.current.resetHistory(newInitialState);
      });

      expect(result.current.present).toEqual(newInitialState);
      expect(result.current.historyLength).toBe(0);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });
  });
});