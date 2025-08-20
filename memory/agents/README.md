# Agent Memory Storage

## Purpose
This directory stores agent-specific memory data, configurations, and persistent state information for individual Claude agents in the orchestration system.

## Integration with Land Visualizer
Agent memory storage supports the Land Visualizer project's specialized agents:
- **Design Review Agents**: Store architectural decisions and UX evaluation history
- **QA Testing Agents**: Maintain test results and measurement accuracy validations
- **Accessibility Agents**: Track WCAG compliance assessments and improvements
- **Performance Optimizers**: Store 3D rendering benchmarks and optimization strategies
- **Unit Conversion Agents**: Maintain precision standards and conversion audit trails

## Structure
Each agent gets its own subdirectory for isolated memory storage:

```
memory/agents/
├── agent_001/
│   ├── state.json           # Agent state and configuration
│   ├── knowledge.md         # Agent-specific knowledge base
│   ├── tasks.json          # Completed and active tasks
│   └── calibration.json    # Agent-specific calibrations
├── agent_002/
│   └── ...
└── shared/
    ├── common_knowledge.md  # Shared knowledge across agents
    └── global_config.json  # Global agent configurations
```

## Usage Guidelines
1. **Agent Isolation**: Each agent should only read/write to its own directory
2. **Shared Resources**: Use the `shared/` directory for cross-agent information
3. **State Persistence**: Update state.json whenever agent status changes
4. **Knowledge Sharing**: Document discoveries in knowledge.md files
5. **Cleanup**: Remove directories for terminated agents periodically

## Land Visualizer Specific Guidelines
1. **Survey Accuracy**: Maintain precision standards for all measurement-related agent memories
2. **Professional Context**: Store decisions relevant to surveying and real estate workflows
3. **Accessibility Compliance**: Document WCAG validation results and remediation strategies
4. **Performance Metrics**: Track 3D rendering optimizations and frame rate improvements
5. **Cross-Agent Learning**: Share best practices across specialized Land Visualizer agents

## Last Updated
2025-08-20T22:19:11.129Z
