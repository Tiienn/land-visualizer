# Styles Directory

This directory contains the CSS design system and styling architecture for the Land Visualizer application, implementing a comprehensive design token system.

## Entry Points & Style Files

### **Design System Variables**
- **`variables.css`** - Complete design system with CSS custom properties (CSS variables)
  - **Main Entry Points:**
    - Color palette definitions
    - Typography system
    - Spacing and layout tokens
    - Component styling tokens
    - Animation and transition values
    - Accessibility and responsive design tokens

## CSS Architecture

### **Design Token System**
The design system follows a structured approach using CSS custom properties for consistent theming and maintainability.

#### **Color Palette**
```css
/* Primary Colors */
:root {
  --primary-blue: #3b82f6;      /* Main brand color for land areas */
  --primary-blue-light: #60a5fa; /* Hover states and variations */
  --primary-blue-dark: #1d4ed8;  /* Active states and emphasis */
  --primary-blue-hover: #2563eb; /* Interactive hover color */
}

/* Secondary Colors */
:root {
  --grass-green: #22c55e;       /* 3D ground plane color */
  --grid-gray: #6b7280;         /* Reference grid lines */
  --background-gray: #f8fafc;   /* Page background */
  --panel-gray: #f1f5f9;        /* Sidebar and panel backgrounds */
}

/* Subdivision Color System */
:root {
  --subdivision-1: #ef4444;     /* Red - First subdivision */
  --subdivision-2: #f97316;     /* Orange - Second subdivision */
  --subdivision-3: #eab308;     /* Yellow - Third subdivision */
  --subdivision-4: #22c55e;     /* Green - Fourth subdivision */
  --subdivision-5: #06b6d4;     /* Cyan - Fifth subdivision */
  --subdivision-6: #8b5cf6;     /* Purple - Sixth subdivision */
  --subdivision-7: #ec4899;     /* Pink - Seventh subdivision */
  --subdivision-8: #64748b;     /* Slate - Eighth subdivision */
}

/* UI Element Colors */
:root {
  --text-primary: #0f172a;      /* Primary text color */
  --text-secondary: #475569;    /* Secondary text color */
  --text-muted: #94a3b8;        /* Muted text for captions */
  --text-inverse: #ffffff;      /* Text on dark backgrounds */
  --border: #e2e8f0;            /* Default border color */
  --border-focus: var(--primary-blue); /* Focus border color */
  --success: #10b981;           /* Success state color */
  --warning: #f59e0b;           /* Warning state color */
  --error: #ef4444;             /* Error state color */
  --info: var(--primary-blue);  /* Info state color */
}
```

#### **Typography System**
```css
/* Font Family */
:root {
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* Font Sizes (aligned with Tailwind CSS) */
:root {
  --font-size-xs: 0.75rem;     /* 12px - Captions and small text */
  --font-size-sm: 0.875rem;    /* 14px - Secondary text */
  --font-size-base: 1rem;      /* 16px - Body text */
  --font-size-lg: 1.125rem;    /* 18px - Large text */
  --font-size-xl: 1.25rem;     /* 20px - Subheadings */
  --font-size-2xl: 1.5rem;     /* 24px - Main headings */
}

/* Font Weights */
:root {
  --font-weight-normal: 400;    /* Body text */
  --font-weight-medium: 500;    /* Labels and emphasis */
  --font-weight-semibold: 600;  /* Subheadings */
  --font-weight-bold: 700;      /* Headings and strong emphasis */
}
```

#### **Spacing System (8px Grid)**
```css
/* Base Spacing Units */
:root {
  --spacing-1: 0.25rem;   /* 4px - Minimal spacing */
  --spacing-2: 0.5rem;    /* 8px - Base grid unit */
  --spacing-3: 0.75rem;   /* 12px - Small spacing */
  --spacing-4: 1rem;      /* 16px - Medium spacing */
  --spacing-6: 1.5rem;    /* 24px - Large spacing */
  --spacing-8: 2rem;      /* 32px - Extra large spacing */
  --spacing-12: 3rem;     /* 48px - Section spacing */
  --spacing-16: 4rem;     /* 64px - Page section spacing */
}

/* Component-Specific Spacing */
:root {
  --sidebar-width: 320px;           /* Left sidebar width */
  --properties-panel-width: 280px;  /* Right properties panel width */
  --ribbon-height: 64px;            /* Top toolbar height */
}
```

#### **Component Styling Tokens**
```css
/* Border Radius */
:root {
  --radius-sm: 0.25rem;   /* 4px - Small radius */
  --radius: 0.375rem;     /* 6px - Default radius */
  --radius-md: 0.5rem;    /* 8px - Medium radius */
  --radius-lg: 0.75rem;   /* 12px - Large radius */
}

/* Shadows */
:root {
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

/* Z-Index Scale */
:root {
  --z-dropdown: 1000;        /* Dropdown menus */
  --z-sticky: 1020;          /* Sticky elements */
  --z-fixed: 1030;           /* Fixed positioning */
  --z-modal-backdrop: 1040;  /* Modal backdrops */
  --z-modal: 1050;           /* Modal content */
  --z-popover: 1060;         /* Popovers and tooltips */
  --z-tooltip: 1070;         /* Tooltips */
}
```

#### **Animation and Transition Tokens**
```css
/* Transition Durations */
:root {
  --transition-fast: 0.15s ease;    /* Fast interactions */
  --transition-base: 0.2s ease;     /* Standard transitions */
  --transition-slow: 0.3s ease;     /* Slow, deliberate transitions */
}

/* Animation Durations */
:root {
  --animation-fast: 150ms;          /* Quick animations */
  --animation-base: 200ms;          /* Standard animations */
  --animation-slow: 300ms;          /* Slow animations */
}
```

#### **3D Scene Styling Tokens**
```css
/* 3D Visualization Variables */
:root {
  --land-area-opacity: 0.3;         /* Land area transparency */
  --subdivision-opacity: 0.7;       /* Subdivision transparency */
  --grid-opacity: 0.5;              /* Reference grid transparency */
  --selected-outline-opacity: 1.0;  /* Selected object outline */
}
```

## Accessibility and Responsive Design

### **Accessibility Support**
```css
/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  :root {
    --border: #000000;
    --text-muted: var(--text-secondary);
    --bg-gray-50: #ffffff;
    --bg-gray-100: #f0f0f0;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-fast: 0s;
    --transition-base: 0s;
    --transition-slow: 0s;
    --animation-fast: 0s;
    --animation-base: 0s;
    --animation-slow: 0s;
  }
}

/* Focus and Accessibility */
:root {
  --focus-ring: 0 0 0 3px rgba(59, 130, 246, 0.1);
  --focus-ring-offset: 2px;
}
```

### **Dark Mode Support (Future Enhancement)**
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-white: #0f172a;
    --bg-gray-50: #1e293b;
    --bg-gray-100: #334155;
    --text-primary: #f8fafc;
    --text-secondary: #cbd5e1;
    --text-muted: #64748b;
    --border: #334155;
    --panel-gray: #1e293b;
    --background-gray: #0f172a;
  }
}
```

### **Responsive Breakpoints**
```css
/* Breakpoint Reference (for use in media queries) */
:root {
  --breakpoint-sm: 640px;   /* Small devices */
  --breakpoint-md: 768px;   /* Medium devices */
  --breakpoint-lg: 1024px;  /* Large devices */
  --breakpoint-xl: 1280px;  /* Extra large devices */
  --breakpoint-2xl: 1536px; /* 2X large devices */
}
```

## Usage Patterns

### **Importing Design System**
```css
/* Import in main CSS file (index.css) */
@import './styles/variables.css';

/* Variables are now available globally */
.my-component {
  background-color: var(--primary-blue);
  padding: var(--spacing-4);
  border-radius: var(--radius);
  transition: all var(--transition-fast);
}
```

### **Component Styling Examples**
```css
/* Button Component */
.button-primary {
  background-color: var(--primary-blue);
  color: var(--text-inverse);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius);
  font-weight: var(--font-weight-medium);
  transition: background-color var(--transition-fast);
  
  &:hover {
    background-color: var(--primary-blue-light);
  }
  
  &:focus {
    box-shadow: var(--focus-ring);
    outline-offset: var(--focus-ring-offset);
  }
}

/* Card Component */
.card {
  background-color: var(--bg-white);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--spacing-6);
  box-shadow: var(--shadow);
}

/* Panel Layout */
.left-sidebar {
  width: var(--sidebar-width);
  background-color: var(--panel-gray);
  border-right: 1px solid var(--border);
}

.ribbon {
  height: var(--ribbon-height);
  background-color: var(--bg-white);
  border-bottom: 1px solid var(--border);
}
```

### **3D Scene Styling**
```css
/* Land Area Styling */
.land-area {
  background-color: var(--primary-blue);
  opacity: var(--land-area-opacity);
}

/* Subdivision Styling */
.subdivision-1 { border-color: var(--subdivision-1); }
.subdivision-2 { border-color: var(--subdivision-2); }
.subdivision-3 { border-color: var(--subdivision-3); }
.subdivision-4 { border-color: var(--subdivision-4); }
.subdivision-5 { border-color: var(--subdivision-5); }
.subdivision-6 { border-color: var(--subdivision-6); }
.subdivision-7 { border-color: var(--subdivision-7); }
.subdivision-8 { border-color: var(--subdivision-8); }

/* Grid Styling */
.reference-grid {
  stroke: var(--grid-gray);
  opacity: var(--grid-opacity);
}
```

## Integration with Tailwind CSS

### **Design Token Alignment**
The design system is aligned with Tailwind CSS for seamless integration:

```css
/* Tailwind CSS classes can reference design tokens */
.bg-primary { background-color: var(--primary-blue); }
.text-primary { color: var(--text-primary); }
.p-4 { padding: var(--spacing-4); }
.rounded { border-radius: var(--radius); }
```

### **Custom Tailwind Configuration**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'primary-blue': 'var(--primary-blue)',
        'primary-blue-light': 'var(--primary-blue-light)',
        'primary-blue-dark': 'var(--primary-blue-dark)',
        // ... other design token colors
      },
      spacing: {
        '1': 'var(--spacing-1)',
        '2': 'var(--spacing-2)',
        '3': 'var(--spacing-3)',
        '4': 'var(--spacing-4)',
        // ... other spacing tokens
      }
    }
  }
};
```

## Maintenance and Updates

### **Design Token Updates**
When updating design tokens:

1. **Update variables.css** - Modify token values
2. **Test visual consistency** - Verify changes across components
3. **Update documentation** - Reflect changes in style guide
4. **Test accessibility** - Ensure contrast ratios remain compliant

### **New Token Addition**
```css
/* Add new tokens following naming convention */
:root {
  --new-color-primary: #value;
  --new-spacing-custom: 1.25rem;
  --new-shadow-custom: 0 4px 8px rgba(0, 0, 0, 0.15);
}
```

### **Browser Support**
- **CSS Custom Properties**: Supported in all modern browsers
- **Fallback Support**: Consider fallbacks for older browsers if needed
- **Progressive Enhancement**: Use feature detection for advanced features

## Performance Considerations

### **CSS Variable Performance**
- CSS custom properties are efficient and well-supported
- Minimal performance impact compared to CSS preprocessor variables
- Enable runtime theming and dynamic updates
- Support CSS animations and transitions

### **Bundle Size**
- Design tokens add minimal CSS bundle size
- Variables enable efficient CSS compression
- Reduce duplicate style declarations
- Enable tree-shaking of unused styles

## Development Workflow

### **Using Design Tokens**
```css
/* Always prefer design tokens over hardcoded values */

/* Good */
.component {
  color: var(--text-primary);
  padding: var(--spacing-4);
  background: var(--bg-white);
}

/* Avoid */
.component {
  color: #0f172a;
  padding: 16px;
  background: #ffffff;
}
```

### **Theme Customization**
```css
/* Override tokens for specific themes or contexts */
.dark-theme {
  --bg-white: #1a1a1a;
  --text-primary: #ffffff;
  --border: #333333;
}

.high-contrast-theme {
  --border: #000000;
  --text-primary: #000000;
  --bg-white: #ffffff;
}
```