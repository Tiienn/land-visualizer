# Claude Code Sub-Agents for Land Visualizer

## Quick Start

• Type `/agents` in Claude Code to create a new sub-agent
• Sub-agents work independently with their own context
• Each agent specializes in specific tasks

## Create Your First Agent

1. Run `/agents` in Claude Code
2. Choose project-specific or global
3. Name your agent and describe its purpose
4. Save to `.claude/agents/` folder

## Useful Agents for Land Visualizer

### 3D Scene Optimizer
• **Purpose**: Optimize Three.js rendering performance
• **Tasks**: Analyze frame rates, reduce draw calls, optimize geometries
• **Trigger**: When working on 3D performance issues

### Accessibility Checker
• **Purpose**: Ensure WCAG compliance
• **Tasks**: Check keyboard navigation, screen reader support, ARIA labels
• **Trigger**: After UI changes

### Export Specialist
• **Purpose**: Handle all export formats (DXF, PDF, Excel)
• **Tasks**: Format data, generate professional reports, validate exports
• **Trigger**: When exporting data

### Unit Converter
• **Purpose**: Handle complex unit conversions
• **Tasks**: Convert between traditional and metric units, validate calculations
• **Trigger**: When working with measurements

### Design Reviewer
• **Purpose**: Check UI/UX consistency
• **Tasks**: Validate against style guide, check responsive design
• **Trigger**: After visual changes

## How to Use

• **Automatic**: Claude detects which agent to use based on your request
• **Manual**: Use `@agent-name` to invoke specific agent
• **Example**: `@design-reviewer check the new ribbon UI`

## Benefits

• **Focused Context**: Each agent maintains its own memory
• **Faster Responses**: Specialized agents work more efficiently
• **Better Organization**: Separate concerns for different tasks
• **Team Simulation**: Like having specialist developers

## Tips

• Keep agent descriptions clear and specific
• Test agents with simple tasks first
• Agents can call other agents for complex workflows
• Store project agents in `.claude/agents/` folder

## Example Agent Configuration

```yaml
name: land-viz-3d-optimizer
description: Optimizes Three.js performance for land visualizer
tools:
  - Read
  - Edit
  - Grep
  - WebSearch
prompt: |
  You are a Three.js performance specialist for the land visualizer app.
  Focus on reducing draw calls, optimizing geometries, and improving frame rates.
  Always check current performance metrics before suggesting changes.
```

## Getting Started

1. Type `/agents` now
2. Create your first agent
3. Test with a simple task
4. Build your AI development team