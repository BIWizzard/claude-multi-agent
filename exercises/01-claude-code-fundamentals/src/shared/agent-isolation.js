/**
 * Agent Isolation Utility - Ensures clean boundaries between agents
 *
 * Patterns demonstrated:
 * - Workspace isolation
 * - Context filtering
 * - State boundaries
 * - Error isolation
 */

const fs = require('fs');
const path = require('path');

class AgentIsolation {
  constructor(agentName, exercisePath) {
    this.agentName = agentName;
    this.exercisePath = exercisePath;
    this.workspace = this.createWorkspace();
    this.contextBoundary = new Map();
  }

  /**
   * Create isolated workspace for agent
   */
  createWorkspace() {
    const workspace = {
      id: `workspace-${this.agentName}-${Date.now()}`,
      path: path.join(this.exercisePath, '.claude/workspaces', this.agentName),
      context: new Map(),
      state: new Map(),
      boundaries: {
        allowedOperations: this.getAllowedOperations(),
        forbiddenPaths: this.getForbiddenPaths(),
        contextFilters: this.getContextFilters()
      }
    };

    // Ensure workspace directory exists
    if (!fs.existsSync(workspace.path)) {
      fs.mkdirSync(workspace.path, { recursive: true });
    }

    return workspace;
  }

  /**
   * Filter context for agent boundaries
   */
  filterContext(context, agentName) {
    const filtered = {};
    const filters = this.workspace.boundaries.contextFilters;

    for (const [key, value] of Object.entries(context)) {
      if (this.shouldIncludeContext(key, agentName, filters)) {
        filtered[key] = this.sanitizeContextValue(value, agentName);
      }
    }

    return filtered;
  }

  /**
   * Validate operation is allowed for agent
   */
  validateOperation(operation, agentName) {
    const allowed = this.workspace.boundaries.allowedOperations;

    if (!allowed.includes(operation)) {
      throw new Error(
        `Operation '${operation}' not allowed for agent '${agentName}'`
      );
    }

    return true;
  }

  /**
   * Create state checkpoint for handoff
   */
  createStateCheckpoint() {
    const checkpoint = {
      timestamp: new Date().toISOString(),
      agent: this.agentName,
      workspace: this.workspace.id,
      context: Object.fromEntries(this.workspace.context),
      state: Object.fromEntries(this.workspace.state),
      boundaries: this.workspace.boundaries
    };

    // Save checkpoint
    const checkpointPath = path.join(
      this.workspace.path,
      `checkpoint-${Date.now()}.json`
    );

    fs.writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2));

    return checkpoint;
  }

  // Helper methods

  getAllowedOperations() {
    const operationsByAgent = {
      'coordinator': [
        'task_assignment',
        'progress_tracking',
        'decision_making',
        'context_distribution'
      ],
      'task-executor': [
        'implementation',
        'testing',
        'documentation',
        'result_reporting'
      ]
    };

    return operationsByAgent[this.agentName] || [];
  }

  getForbiddenPaths() {
    const pathsByAgent = {
      'coordinator': [
        '.claude/workspaces/task-executor'
      ],
      'task-executor': [
        '.claude/workspaces/coordinator',
        '.claude/handoffs'
      ]
    };

    return pathsByAgent[this.agentName] || [];
  }

  getContextFilters() {
    return {
      include: [],
      exclude: [],
      sanitize: []
    };
  }

  shouldIncludeContext(key, agentName, filters) {
    // Implementation of context filtering logic
    return true; // Simplified for demo
  }

  sanitizeContextValue(value, agentName) {
    // Implementation of context sanitization
    return value; // Simplified for demo
  }
}

module.exports = AgentIsolation;