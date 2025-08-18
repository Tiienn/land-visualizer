import { useState, useCallback, useRef, useMemo, useEffect } from 'react';

/**
 * Deep clone utility with performance optimizations for Land Visualizer data structures
 * @param {*} obj - Object to clone
 * @returns {*} Deep cloned object
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
};

/**
 * Calculate memory size estimation for history management
 * @param {*} state - State object to measure
 * @returns {number} Estimated memory size in bytes
 */
const estimateMemorySize = (state) => {
  return JSON.stringify(state).length * 2; // Rough estimation: 2 bytes per character
};

/**
 * Advanced undo/redo hook for Land Visualizer
 * Features: 
 * - Deep cloning for complex nested data
 * - Memory management with configurable limits
 * - Action grouping for compound operations
 * - Selective state tracking
 * - Performance optimizations
 */
export const useUndoRedo = (initialState = {}, options = {}) => {
  const {
    maxHistorySize = 50,
    maxMemoryMB = 10, // Maximum memory usage in MB
    groupingTimeout = 100, // Timeout for grouping rapid actions (ms)
    trackedKeys = null, // If specified, only track these keys
    excludedKeys = ['temporary', 'ui', 'modal'], // Keys to exclude from tracking
  } = options;

  // History state management
  const [history, setHistory] = useState({
    past: [],
    present: deepClone(initialState),
    future: []
  });

  // Grouping and debouncing state
  const [isGrouping, setIsGrouping] = useState(false);
  const groupingTimerRef = useRef(null);
  const pendingActionRef = useRef(null);

  // Memory tracking
  const currentMemoryUsage = useRef(0);

  /**
   * Filter state to include only tracked keys and exclude unwanted keys
   * @param {Object} state - Full state object
   * @returns {Object} Filtered state for history
   */
  const filterState = useCallback((state) => {
    let filtered = { ...state };

    // If specific keys are being tracked, only include those
    if (trackedKeys && Array.isArray(trackedKeys)) {
      const tracked = {};
      trackedKeys.forEach(key => {
        if (state.hasOwnProperty(key)) {
          tracked[key] = state[key];
        }
      });
      filtered = tracked;
    }

    // Remove excluded keys
    excludedKeys.forEach(key => {
      delete filtered[key];
    });

    return filtered;
  }, [trackedKeys, excludedKeys]);

  /**
   * Manage memory usage by removing old history entries
   * @param {Array} pastArray - Current past history
   * @returns {Array} Trimmed past history
   */
  const managememory = useCallback((pastArray) => {
    const maxMemoryBytes = maxMemoryMB * 1024 * 1024;
    let totalMemory = currentMemoryUsage.current;
    let trimmedPast = [...pastArray];

    // Remove oldest entries if memory limit exceeded
    while (trimmedPast.length > 0 && totalMemory > maxMemoryBytes) {
      const removed = trimmedPast.shift();
      totalMemory -= estimateMemorySize(removed);
    }

    // Enforce max history size
    if (trimmedPast.length > maxHistorySize) {
      trimmedPast = trimmedPast.slice(-maxHistorySize);
    }

    currentMemoryUsage.current = totalMemory;
    return trimmedPast;
  }, [maxHistorySize, maxMemoryMB]);

  /**
   * Execute a state change and add it to history
   * @param {Object|Function} newState - New state or state updater function
   * @param {string} actionDescription - Optional description for debugging
   * @param {boolean} shouldGroup - Whether this action should be grouped with rapid subsequent actions
   */
  const executeWithHistory = useCallback((newState, actionDescription = '', shouldGroup = false) => {
    // Clear any pending grouping timer
    if (groupingTimerRef.current) {
      clearTimeout(groupingTimerRef.current);
      groupingTimerRef.current = null;
    }

    const updateHistory = (finalNewState) => {
      setHistory(prevHistory => {
        const filteredCurrentState = filterState(prevHistory.present);
        const filteredNewState = filterState(typeof finalNewState === 'function' 
          ? finalNewState(prevHistory.present) 
          : { ...prevHistory.present, ...finalNewState });

        // Check if state actually changed
        if (JSON.stringify(filteredCurrentState) === JSON.stringify(filteredNewState)) {
          return prevHistory; // No change, don't add to history
        }

        const newStateClone = deepClone(filteredNewState);
        const currentStateMemory = estimateMemorySize(filteredCurrentState);
        
        // Add current state to past and update memory tracking
        const newPast = managememory([...prevHistory.past, filteredCurrentState]);
        currentMemoryUsage.current += currentStateMemory;

        return {
          past: newPast,
          present: newStateClone,
          future: [] // Clear future when new action is performed
        };
      });
    };

    if (shouldGroup && !isGrouping) {
      // Start grouping mode
      setIsGrouping(true);
      pendingActionRef.current = newState;
      
      groupingTimerRef.current = setTimeout(() => {
        updateHistory(pendingActionRef.current);
        setIsGrouping(false);
        pendingActionRef.current = null;
        groupingTimerRef.current = null;
      }, groupingTimeout);
    } else if (isGrouping && shouldGroup) {
      // Update pending action in grouping mode
      pendingActionRef.current = typeof newState === 'function'
        ? (prevState) => newState(typeof pendingActionRef.current === 'function' 
            ? pendingActionRef.current(prevState) 
            : { ...prevState, ...pendingActionRef.current })
        : { ...pendingActionRef.current, ...newState };
    } else {
      // Execute immediately
      if (isGrouping) {
        // Flush pending grouped action first
        updateHistory(pendingActionRef.current);
        setIsGrouping(false);
        pendingActionRef.current = null;
      }
      updateHistory(newState);
    }
  }, [filterState, managememory, groupingTimeout, isGrouping]);

  /**
   * Undo the last action
   */
  const undo = useCallback(() => {
    // Flush any pending grouped action
    if (isGrouping && pendingActionRef.current) {
      executeWithHistory(pendingActionRef.current);
      return; // Let the user call undo again after flushing
    }

    setHistory(prevHistory => {
      if (prevHistory.past.length === 0) return prevHistory;

      const previous = prevHistory.past[prevHistory.past.length - 1];
      const newPast = prevHistory.past.slice(0, prevHistory.past.length - 1);

      return {
        past: newPast,
        present: deepClone(previous),
        future: [prevHistory.present, ...prevHistory.future]
      };
    });
  }, [executeWithHistory, isGrouping]);

  /**
   * Redo the last undone action
   */
  const redo = useCallback(() => {
    setHistory(prevHistory => {
      if (prevHistory.future.length === 0) return prevHistory;

      const next = prevHistory.future[0];
      const newFuture = prevHistory.future.slice(1);

      return {
        past: [...prevHistory.past, prevHistory.present],
        present: deepClone(next),
        future: newFuture
      };
    });
  }, []);

  /**
   * Reset history and set new initial state
   * @param {Object} newInitialState - New initial state
   */
  const resetHistory = useCallback((newInitialState = {}) => {
    setHistory({
      past: [],
      present: deepClone(newInitialState),
      future: []
    });
    currentMemoryUsage.current = 0;
  }, []);

  /**
   * Jump to a specific point in history
   * @param {number} index - Index in past array to jump to
   */
  const jumpToHistory = useCallback((index) => {
    if (index < 0 || index >= history.past.length) return;

    const targetState = history.past[index];
    const newPast = history.past.slice(0, index);
    const newFuture = [
      ...history.past.slice(index + 1),
      history.present,
      ...history.future
    ];

    setHistory({
      past: newPast,
      present: deepClone(targetState),
      future: newFuture
    });
  }, [history]);

  /**
   * Get history metadata for debugging and UI
   */
  const historyMetadata = useMemo(() => ({
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    historyLength: history.past.length,
    futureLength: history.future.length,
    memoryUsageMB: currentMemoryUsage.current / (1024 * 1024),
    isGrouping: isGrouping
  }), [history.past.length, history.future.length, isGrouping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (groupingTimerRef.current) {
        clearTimeout(groupingTimerRef.current);
      }
    };
  }, []);

  return {
    // State
    present: history.present,
    
    // Actions
    executeWithHistory,
    undo,
    redo,
    resetHistory,
    jumpToHistory,
    
    // Metadata
    ...historyMetadata,
    
    // Convenience aliases for common patterns
    updateState: executeWithHistory,
    updateGrouped: (newState, description) => executeWithHistory(newState, description, true)
  };
};

export default useUndoRedo;