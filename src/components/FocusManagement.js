import React, { useRef, useEffect, useState, createContext, useContext } from 'react';
import { ScreenReaderOnly } from './AccessibilityUtils';

// Focus Management Context
const FocusContext = createContext({
  registerFocusable: () => {},
  unregisterFocusable: () => {},
  moveFocus: () => {},
  currentFocus: null,
  setCurrentFocus: () => {}
});

// Focus Manager Provider
export const FocusProvider = ({ children }) => {
  const [focusableElements, setFocusableElements] = useState(new Map());
  const [currentFocus, setCurrentFocus] = useState(null);
  const [focusMode, setFocusMode] = useState('mouse'); // 'mouse' or 'keyboard'
  const lastInteractionRef = useRef('mouse');

  // Register a focusable element
  const registerFocusable = (id, element, metadata = {}) => {
    setFocusableElements(prev => new Map(prev.set(id, { element, metadata })));
  };

  // Unregister a focusable element
  const unregisterFocusable = (id) => {
    setFocusableElements(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  };

  // Move focus to specific element
  const moveFocus = (direction) => {
    const elements = Array.from(focusableElements.values());
    if (elements.length === 0) return;

    const currentIndex = currentFocus 
      ? elements.findIndex(el => el.element === currentFocus)
      : -1;

    let nextIndex;
    switch (direction) {
      case 'next':
        nextIndex = (currentIndex + 1) % elements.length;
        break;
      case 'previous':
        nextIndex = (currentIndex - 1 + elements.length) % elements.length;
        break;
      case 'first':
        nextIndex = 0;
        break;
      case 'last':
        nextIndex = elements.length - 1;
        break;
      default:
        return;
    }

    const nextElement = elements[nextIndex]?.element;
    if (nextElement && nextElement.focus) {
      nextElement.focus();
      setCurrentFocus(nextElement);
    }
  };

  // Track interaction mode
  useEffect(() => {
    const handleMouseDown = () => {
      lastInteractionRef.current = 'mouse';
      setFocusMode('mouse');
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Tab' || event.key.startsWith('Arrow')) {
        lastInteractionRef.current = 'keyboard';
        setFocusMode('keyboard');
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const value = {
    registerFocusable,
    unregisterFocusable,
    moveFocus,
    currentFocus,
    setCurrentFocus,
    focusMode
  };

  return (
    <FocusContext.Provider value={value}>
      <div className={`focus-mode-${focusMode}`}>
        {children}
      </div>
    </FocusContext.Provider>
  );
};

// Hook to use focus context
export const useFocus = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
};

// Focusable Element HOC
export const withFocusManagement = (Component) => {
  return React.forwardRef((props, ref) => {
    const { registerFocusable, unregisterFocusable, focusMode } = useFocus();
    const elementRef = useRef(null);
    const focusId = useRef(`focusable-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
      const element = elementRef.current;
      if (element) {
        registerFocusable(focusId.current, element, props.focusMetadata);
      }

      return () => {
        unregisterFocusable(focusId.current);
      };
    }, [registerFocusable, unregisterFocusable, props.focusMetadata]);

    return (
      <Component
        {...props}
        ref={(el) => {
          elementRef.current = el;
          if (ref) {
            if (typeof ref === 'function') {
              ref(el);
            } else {
              ref.current = el;
            }
          }
        }}
        className={`${props.className || ''} ${focusMode === 'keyboard' ? 'keyboard-focus' : 'mouse-focus'}`}
      />
    );
  });
};

// Visual Focus Indicator Component
export const FocusIndicator = ({ 
  targetRef, 
  visible = true, 
  type = 'outline', 
  color = 'blue' 
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!visible || !targetRef?.current) {
      setIsVisible(false);
      return;
    }

    const updatePosition = () => {
      const element = targetRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
      setIsVisible(true);
    };

    updatePosition();

    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(targetRef.current);

    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [visible, targetRef]);

  if (!isVisible) return null;

  const indicatorStyles = {
    position: 'absolute',
    top: position.top - 2,
    left: position.left - 2,
    width: position.width + 4,
    height: position.height + 4,
    pointerEvents: 'none',
    zIndex: 9999,
    borderRadius: '4px',
    transition: 'all 0.2s ease'
  };

  switch (type) {
    case 'outline':
      indicatorStyles.border = `2px solid var(--${color}-500, #3b82f6)`;
      indicatorStyles.backgroundColor = 'transparent';
      break;
    case 'glow':
      indicatorStyles.boxShadow = `0 0 0 2px var(--${color}-500, #3b82f6), 0 0 8px var(--${color}-500, #3b82f6)`;
      break;
    case 'background':
      indicatorStyles.backgroundColor = `var(--${color}-100, rgba(59, 130, 246, 0.1))`;
      indicatorStyles.border = `1px solid var(--${color}-300, #93c5fd)`;
      break;
    default:
      indicatorStyles.border = `2px solid var(--${color}-500, #3b82f6)`;
  }

  return (
    <div style={indicatorStyles} aria-hidden="true" />
  );
};

// Skip Navigation Component
export const SkipNavigation = ({ links = [] }) => {
  const defaultLinks = [
    { href: '#main-content', text: 'Skip to main content' },
    { href: '#navigation', text: 'Skip to navigation' },
    { href: '#sidebar', text: 'Skip to sidebar' },
    { href: '#3d-viewport', text: 'Skip to 3D viewport' }
  ];

  const navigationLinks = links.length > 0 ? links : defaultLinks;

  return (
    <nav className="skip-navigation" aria-label="Skip navigation">
      {navigationLinks.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          style={{ zIndex: 10000 }}
        >
          {link.text}
        </a>
      ))}
    </nav>
  );
};

// Focus Trap Component
export const FocusTrap = ({ 
  children, 
  active = true, 
  restoreFocus = true,
  initialFocus = null 
}) => {
  const containerRef = useRef(null);
  const previousActiveElementRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    // Store the previously focused element
    if (restoreFocus) {
      previousActiveElementRef.current = document.activeElement;
    }

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements
    const focusableSelector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    const focusableElements = container.querySelectorAll(focusableSelector);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Set initial focus
    if (initialFocus && typeof initialFocus === 'string') {
      const initialElement = container.querySelector(initialFocus);
      if (initialElement) {
        initialElement.focus();
      }
    } else if (firstFocusable) {
      firstFocusable.focus();
    }

    const handleTabKey = (event) => {
      if (event.key !== 'Tab') return;

      if (focusableElements.length === 1) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        // Custom escape handler can be passed via props
        if (children.props?.onEscape) {
          children.props.onEscape();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    container.addEventListener('keydown', handleEscapeKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      container.removeEventListener('keydown', handleEscapeKey);
      
      // Restore focus to previously active element
      if (restoreFocus && previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [active, restoreFocus, initialFocus, children.props]);

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      style={{ outline: 'none' }}
    >
      {children}
    </div>
  );
};

// Roving Focus Manager for complex UI components
export const RovingFocusManager = ({ 
  children, 
  direction = 'horizontal',
  wrap = true,
  onSelectionChange 
}) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemsRef = useRef([]);

  const handleKeyDown = (event, index) => {
    const { key } = event;
    const isHorizontal = direction === 'horizontal';
    const isVertical = direction === 'vertical';

    let nextIndex = index;

    if ((isHorizontal && key === 'ArrowRight') || (isVertical && key === 'ArrowDown')) {
      event.preventDefault();
      nextIndex = wrap ? (index + 1) % itemsRef.current.length : Math.min(index + 1, itemsRef.current.length - 1);
    } else if ((isHorizontal && key === 'ArrowLeft') || (isVertical && key === 'ArrowUp')) {
      event.preventDefault();
      nextIndex = wrap ? (index - 1 + itemsRef.current.length) % itemsRef.current.length : Math.max(index - 1, 0);
    } else if (key === 'Home') {
      event.preventDefault();
      nextIndex = 0;
    } else if (key === 'End') {
      event.preventDefault();
      nextIndex = itemsRef.current.length - 1;
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      if (onSelectionChange) {
        onSelectionChange(index);
      }
      return;
    }

    if (nextIndex !== index) {
      setFocusedIndex(nextIndex);
      itemsRef.current[nextIndex]?.focus();
    }
  };

  const registerItem = (index, element) => {
    itemsRef.current[index] = element;
  };

  return (
    <div role="group" onKeyDown={(e) => handleKeyDown(e, focusedIndex)}>
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, {
          tabIndex: index === focusedIndex ? 0 : -1,
          ref: (el) => registerItem(index, el),
          onFocus: () => setFocusedIndex(index),
          'aria-setsize': React.Children.count(children),
          'aria-posinset': index + 1
        })
      )}
    </div>
  );
};

// High Contrast Mode Detector
export const useHighContrastMode = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const checkHighContrast = () => {
      // Check for high contrast media query
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
      setIsHighContrast(highContrastQuery.matches);
    };

    checkHighContrast();

    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    highContrastQuery.addListener(checkHighContrast);

    return () => {
      highContrastQuery.removeListener(checkHighContrast);
    };
  }, []);

  return isHighContrast;
};

// Reduced Motion Detector
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const checkReducedMotion = () => {
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(reducedMotionQuery.matches);
    };

    checkReducedMotion();

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionQuery.addListener(checkReducedMotion);

    return () => {
      reducedMotionQuery.removeListener(checkReducedMotion);
    };
  }, []);

  return prefersReducedMotion;
};

export default {
  FocusProvider,
  useFocus,
  withFocusManagement,
  FocusIndicator,
  SkipNavigation,
  FocusTrap,
  RovingFocusManager,
  useHighContrastMode,
  useReducedMotion
};