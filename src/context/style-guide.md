# Brand Style Guide

## Color Palette

### Primary Colors
```css
--primary-blue: #3b82f6;      /* Main land area color */
--primary-blue-light: #60a5fa; /* Hover states */
--primary-blue-dark: #1d4ed8;  /* Active states */
```

### Secondary Colors
```css
--grass-green: #22c55e;       /* Ground plane */
--grid-gray: #6b7280;         /* Reference grid */
--background-gray: #f8fafc;   /* Page background */
--panel-gray: #f1f5f9;        /* Panel backgrounds */
```

### Subdivision Colors (Systematic Assignment)
```css
--subdivision-1: #ef4444;     /* Red */
--subdivision-2: #f97316;     /* Orange */
--subdivision-3: #eab308;     /* Yellow */
--subdivision-4: #22c55e;     /* Green */
--subdivision-5: #06b6d4;     /* Cyan */
--subdivision-6: #8b5cf6;     /* Purple */
--subdivision-7: #ec4899;     /* Pink */
--subdivision-8: #64748b;     /* Slate */
```

### UI Element Colors
```css
--text-primary: #0f172a;      /* Primary text */
--text-secondary: #475569;    /* Secondary text */
--text-muted: #94a3b8;        /* Muted text */
--border: #e2e8f0;            /* Borders */
--success: #10b981;           /* Success states */
--warning: #f59e0b;           /* Warning states */
--error: #ef4444;             /* Error states */
```

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### Font Sizes (Tailwind CSS Classes)
- **Headings**: `text-2xl` (24px), `text-xl` (20px), `text-lg` (18px)
- **Body Text**: `text-base` (16px)
- **Small Text**: `text-sm` (14px)
- **Captions**: `text-xs` (12px)

### Font Weights
- **Bold**: `font-bold` (700) - For headings and emphasis
- **Semibold**: `font-semibold` (600) - For subheadings
- **Medium**: `font-medium` (500) - For labels
- **Normal**: `font-normal` (400) - For body text

## Spacing System

### 8px Grid System
- Use multiples of 8px for consistent spacing
- Tailwind classes: `p-1` (4px), `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px)

### Component Spacing
- **Panels**: `p-6` (24px padding)
- **Cards**: `p-4` (16px padding)
- **Buttons**: `px-4 py-2` (16px horizontal, 8px vertical)
- **Form Elements**: `p-3` (12px padding)

## Layout Guidelines

### Panel Structure
```css
/* Left Sidebar */
width: 320px;
background: --panel-gray;
border-right: 1px solid --border;

/* Right Properties Panel */
width: 280px;
background: --panel-gray;
border-left: 1px solid --border;

/* Top Ribbon */
height: 64px;
background: white;
border-bottom: 1px solid --border;
```

### 3D Viewport
- Full remaining space after panels
- Dark background for contrast
- Grid overlay for reference

## Component Styles

### Buttons
```css
/* Primary Button */
background: --primary-blue;
color: white;
padding: 8px 16px;
border-radius: 6px;
transition: all 0.15s ease;

/* Secondary Button */
background: transparent;
color: --primary-blue;
border: 1px solid --primary-blue;
padding: 8px 16px;
border-radius: 6px;
```

### Form Controls
```css
/* Input Fields */
border: 1px solid --border;
border-radius: 6px;
padding: 12px;
font-size: 14px;
transition: border-color 0.15s ease;

/* Focus State */
border-color: --primary-blue;
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
```

### Cards and Panels
```css
background: white;
border: 1px solid --border;
border-radius: 8px;
padding: 24px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
```

## 3D Scene Styling

### Materials and Opacity
- **Land Areas**: Blue material with 0.3 opacity
- **Subdivisions**: Solid colors with 0.7 opacity
- **Grid Lines**: Gray with 0.5 opacity
- **Selected Objects**: Bright outline with 1.0 opacity

### Text and Labels
- **3D Text**: White color with dark outline for visibility
- **Size**: Proportional to subdivision size
- **Position**: Centered on subdivision

## Animation Guidelines

### Transitions
```css
/* Standard transition */
transition: all 0.15s ease;

/* Hover effects */
transition: transform 0.2s ease, box-shadow 0.2s ease;

/* Modal animations */
transition: opacity 0.3s ease, transform 0.3s ease;
```

### Micro-interactions
- Button hover: slight scale up (1.02x)
- Card hover: subtle shadow increase
- Form focus: border color change with shadow
- Loading states: smooth fade in/out

## Responsive Breakpoints

### Desktop First Approach
- **Large Desktop**: 1440px+ (primary target)
- **Desktop**: 1024px - 1439px
- **Tablet**: 768px - 1023px
- **Mobile**: < 768px

### Panel Behavior
- **Desktop**: Fixed side panels
- **Tablet**: Collapsible panels
- **Mobile**: Full-screen modals

## Accessibility Standards

### Color Contrast
- Text on white: minimum 4.5:1 ratio
- Text on colored backgrounds: minimum 3:1 ratio
- Interactive elements: clear focus indicators

### Focus Management
- Visible focus rings on all interactive elements
- Logical tab order
- Skip links for navigation

## Icon System

### Lucide React Icons
- Consistent 20px size for toolbar icons
- 16px size for inline icons
- 24px size for primary actions
- Use outline style for consistency

### Icon Usage
- Clear, recognizable symbols
- Consistent stroke width
- Appropriate semantic meaning
- Paired with text labels where needed