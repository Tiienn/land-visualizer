# Context Directory

This directory contains design documentation and guidelines that provide context and standards for developing the Land Visualizer application.

## Entry Points & Documentation Files

### **Design Principles Documentation**
- **`design-principles.md`** - Comprehensive design checklist and principles
  - **Main Sections:**
    - Core Principles (9 fundamental design principles)
    - UI/UX Guidelines (layout, typography, colors, interactions)
    - Performance Principles (React and Three.js optimization)

### **Brand Style Guide**
- **`style-guide.md`** - Complete brand and visual design system
  - **Main Sections:**
    - Color Palette (primary, secondary, subdivision, UI colors)
    - Typography System (font stack, sizes, weights)
    - Spacing System (8px grid system)
    - Component Styles (buttons, forms, cards, panels)
    - 3D Scene Styling Guidelines
    - Animation and Accessibility Standards

## Documentation Categories

### **Design Principles**

#### **Core Design Philosophy**
The design principles establish the fundamental approach to building professional land visualization software:

1. **Professional Surveying Focus** - Match industry software expectations
2. **Precision Over Convenience** - Prioritize accuracy in measurements
3. **Visual Clarity** - Ensure readability and distinguishability
4. **Non-Destructive Editing** - Allow modifications without data loss
5. **Progressive Disclosure** - Basic features first, advanced accessible
6. **Immediate Feedback** - Real-time visual feedback for operations
7. **Consistent Interaction Patterns** - Uniform mouse/touch interactions
8. **Data Integrity** - Maintain calculation precision and export accuracy
9. **Accessibility** - Keyboard navigation and screen reader support

#### **UI/UX Guidelines**
```markdown
Layout:
- Responsive grid systems
- Consistent spacing (8px grid)
- Clear visual hierarchy
- Adequate white space

Typography:
- Professional, readable fonts
- Consistent font sizes and weights
- Proper contrast ratios
- Typography hierarchy

Color Usage:
- Blue (#3b82f6) for primary land areas
- Systematic color assignment for subdivisions
- High contrast for text and important elements
- Consistent color meanings throughout app

Interaction States:
- Clear hover states for interactive elements
- Distinct selected states
- Disabled states when appropriate
- Loading states for async operations
```

### **Brand Style Guide**

#### **Color System**
```css
/* Primary Colors */
--primary-blue: #3b82f6;      /* Main land area color */
--primary-blue-light: #60a5fa; /* Hover states */
--primary-blue-dark: #1d4ed8;  /* Active states */

/* Secondary Colors */
--grass-green: #22c55e;       /* Ground plane */
--grid-gray: #6b7280;         /* Reference grid */
--background-gray: #f8fafc;   /* Page background */
--panel-gray: #f1f5f9;        /* Panel backgrounds */

/* Subdivision Colors (Systematic Assignment) */
--subdivision-1: #ef4444;     /* Red */
--subdivision-2: #f97316;     /* Orange */
--subdivision-3: #eab308;     /* Yellow */
--subdivision-4: #22c55e;     /* Green */
--subdivision-5: #06b6d4;     /* Cyan */
--subdivision-6: #8b5cf6;     /* Purple */
--subdivision-7: #ec4899;     /* Pink */
--subdivision-8: #64748b;     /* Slate */
```

#### **Typography System**
```css
/* Font Stack */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

/* Font Sizes (Tailwind CSS Classes) */
--font-size-xs: 0.75rem;     /* 12px - Captions */
--font-size-sm: 0.875rem;    /* 14px - Small text */
--font-size-base: 1rem;      /* 16px - Body text */
--font-size-lg: 1.125rem;    /* 18px - Large text */
--font-size-xl: 1.25rem;     /* 20px - Subheadings */
--font-size-2xl: 1.5rem;     /* 24px - Headings */

/* Font Weights */
--font-weight-normal: 400;   /* Body text */
--font-weight-medium: 500;   /* Labels */
--font-weight-semibold: 600; /* Subheadings */
--font-weight-bold: 700;     /* Headings and emphasis */
```

#### **Spacing System (8px Grid)**
```css
/* Spacing Values */
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */

/* Component Spacing */
- Panels: p-6 (24px padding)
- Cards: p-4 (16px padding)
- Buttons: px-4 py-2 (16px horizontal, 8px vertical)
- Form Elements: p-3 (12px padding)
```

## Usage Guidelines

### **Design Compliance Workflow**
When making visual (front-end, UI/UX) changes, always refer to these files:

1. **Check Design Principles** - Ensure changes align with core principles
2. **Validate Style Guide** - Use correct colors, typography, and spacing
3. **Test Accessibility** - Verify keyboard navigation and screen reader support
4. **Review Interaction Patterns** - Maintain consistency across the application

### **Component Development**
```javascript
// Reference design principles in component development
import { useDesignPrinciples } from './hooks/useDesignPrinciples';

// Use style guide variables
const Button = styled.button`
  background-color: var(--primary-blue);
  color: var(--text-inverse);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius);
  font-weight: var(--font-weight-medium);
  
  &:hover {
    background-color: var(--primary-blue-light);
  }
`;
```

### **Design System Integration**
```css
/* Import design system variables */
@import './styles/variables.css';

/* Use design tokens in components */
.land-area {
  background-color: var(--primary-blue);
  opacity: var(--land-area-opacity);
}

.subdivision {
  border-color: var(--subdivision-1);
  opacity: var(--subdivision-opacity);
}
```

## Design Review Process

### **Quick Visual Check**
IMMEDIATELY after implementing any front-end changes:

1. **Identify what changed** - Review modified components/pages
2. **Navigate to affected pages** - Use Playwright browser navigation
3. **Verify design compliance** - Compare against design principles and style guide
4. **Validate feature implementation** - Ensure change fulfills requirements
5. **Check acceptance criteria** - Review provided context files
6. **Capture evidence** - Take full page screenshots at 1440px desktop viewport
7. **Check for errors** - Run browser console message checks

### **Comprehensive Design Review**
Invoke the 'design-review' agent for thorough validation when:
- Completing significant UI/UX features
- Before finalizing PRs with visual changes
- Needing comprehensive accessibility and responsiveness testing

## Accessibility Standards

### **WCAG 2.1 AA Compliance**
```markdown
Color Contrast:
- Text on white: minimum 4.5:1 ratio
- Text on colored backgrounds: minimum 3:1 ratio
- Interactive elements: clear focus indicators

Focus Management:
- Visible focus rings on all interactive elements
- Logical tab order
- Skip links for navigation

Screen Reader Support:
- Semantic HTML structure
- Proper ARIA labels and roles
- Live regions for dynamic content
- Descriptive alternative text
```

### **Keyboard Navigation Standards**
```markdown
Navigation Patterns:
- Tab: Move forward through interactive elements
- Shift+Tab: Move backward through interactive elements
- Arrow keys: Navigate within components
- Enter/Space: Activate buttons and controls
- Escape: Close modals and cancel operations

3D Scene Navigation:
- WASD: Camera movement
- Q/E: Vertical movement
- Shift+A/D: Camera rotation
- Ctrl+Tab: Switch navigation modes
```

## Performance Guidelines

### **React Performance**
```markdown
Rendering Optimization:
- Use React.memo() for expensive components
- Implement proper key props for lists
- Minimize re-renders through state management
- Use lazy loading where appropriate

Memory Management:
- Cleanup event listeners in useEffect
- Dispose Three.js objects properly
- Avoid memory leaks in component lifecycle
```

### **Three.js Performance**
```markdown
3D Optimization:
- Limit subdivision count for performance
- Cap comparison object rendering at 50 items
- Use efficient geometry and materials
- Implement LOD (Level of Detail) systems

Rendering Optimization:
- Use frustum culling
- Implement object pooling
- Optimize shader usage
- Reduce draw calls
```

## Integration with Development Workflow

### **Design System Usage**
```javascript
// Always import design system variables
import './styles/variables.css';

// Reference design principles in decision making
// Consult style-guide.md for component styling
// Follow accessibility guidelines for new features
```

### **Code Review Checklist**
```markdown
Design Compliance:
□ Follows design principles from design-principles.md
□ Uses colors from style guide color palette
□ Implements proper typography scale
□ Uses 8px grid spacing system
□ Includes accessibility features
□ Provides keyboard navigation
□ Implements proper focus management
□ Uses semantic HTML structure
```

### **Testing Integration**
```javascript
// Test design compliance
describe('Design System Compliance', () => {
  test('uses design system colors', () => {
    // Test color usage matches style guide
  });
  
  test('follows spacing system', () => {
    // Test 8px grid compliance
  });
  
  test('implements accessibility features', () => {
    // Test keyboard navigation and screen reader support
  });
});
```

## Maintenance and Updates

### **Document Updates**
- Update design principles when adding new interaction patterns
- Maintain style guide when introducing new colors or typography
- Version control design decisions and rationale
- Document breaking changes to design system

### **Design System Evolution**
- Regularly review and refine design principles
- Update style guide based on user feedback
- Maintain consistency across new features
- Consider accessibility improvements

### **Professional Standards**
- Align with surveying industry standards
- Follow CAD software interaction patterns
- Maintain professional visual appearance
- Ensure export format compliance