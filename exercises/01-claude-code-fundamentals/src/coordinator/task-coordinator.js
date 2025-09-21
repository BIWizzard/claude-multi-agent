/**
 * Task Coordinator - Orchestrates multi-agent workflows
 * 
 * Demonstrates patterns for:
 * - Task assignment and distribution
 * - Progress tracking
 * - Agent communication
 * - Decision management
 */

const ContextManager = require('../shared/context-manager');
const fs = require('fs');
const path = require('path');

class TaskCoordinator {
  constructor(exercisePath) {
    this.exercisePath = exercisePath;
    this.contextManager = new ContextManager(exercisePath);
    this.activeTasks = new Map();
    this.completedTasks = [];
    this.decisions = [];
  }

  /**
   * Initialize coordinator with context
   */
  async initialize(sessionId) {
    this.sessionId = sessionId;
    this.context = this.contextManager.getAgentContext('coordinator', sessionId);
    
    console.log('Coordinator initialized with context:', {
      objectives: this.extractObjectives(),
      currentPhase: this.extractCurrentPhase(),
      assignments: this.extractAssignments()
    });

    return this;
  }

  /**
   * Create and assign a task to an executor
   */
  assignTask(taskDefinition) {
    const taskId = this.generateTaskId();
    
    const task = {
      id: taskId,
      ...taskDefinition,
      assignedAt: new Date().toISOString(),
      status: 'assigned',
      contextPackage: this.createContextPackage(taskDefinition)
    };

    this.activeTasks.set(taskId, task);
    this.logDecision('task_assignment', `Assigned task ${taskId}: ${taskDefinition.name}`);
    
    // Create task file for executor
    this.createTaskFile(task);
    
    return taskId;
  }

  /**
   * Create context package for task
   */
  createContextPackage(taskDefinition) {
    return {
      task: taskDefinition,
      constraints: this.extractConstraints(),
      successCriteria: taskDefinition.successCriteria || this.extractSuccessCriteria(),
      resources: {
        exercisePath: this.exercisePath,
        sharedUtilities: '../shared',
        contextManager: 'available'
      },
      deadline: taskDefinition.deadline || 'end_of_phase'
    };
  }

  /**
   * Receive and process task results
   */
  receiveResults(taskId, results) {
    const task = this.activeTasks.get(taskId);
    
    if (!task) {
      throw new Error(`Unknown task: ${taskId}`);
    }

    // Validate results against success criteria
    const validation = this.validateResults(task, results);
    
    if (validation.passed) {
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      task.results = results;
      
      this.completedTasks.push(task);
      this.activeTasks.delete(taskId);
      
      this.logDecision('task_completion', `Task ${taskId} completed successfully`);
      
      // Update progress
      this.updateProgress(task);
      
      return { success: true, message: 'Task completed successfully' };
    } else {
      task.status = 'needs_revision';
      task.validationErrors = validation.errors;
      
      this.logDecision('task_revision', 
        `Task ${taskId} needs revision: ${validation.errors.join(', ')}`
      );
      
      return { 
        success: false, 
        message: 'Task needs revision',
        errors: validation.errors 
      };
    }
  }

  /**
   * Validate task results against success criteria
   */
  validateResults(task, results) {
    const errors = [];
    const criteria = task.contextPackage.successCriteria;

    // Check for required deliverables
    if (criteria.deliverables) {
      for (const deliverable of criteria.deliverables) {
        if (!results.deliverables || !results.deliverables[deliverable]) {
          errors.push(`Missing deliverable: ${deliverable}`);
        }
      }
    }

    // Check for validation tests
    if (criteria.validationTests) {
      if (!results.validationResults || !results.validationResults.allPassed) {
        errors.push('Validation tests did not pass');
      }
    }

    // Check for documentation
    if (criteria.requiresDocumentation && !results.documentation) {
      errors.push('Documentation is required but not provided');
    }

    return {
      passed: errors.length === 0,
      errors
    };
  }

  /**
   * Make and log a decision
   */
  makeDecision(decisionType, description, options = {}) {
    const decision = {
      id: this.generateDecisionId(),
      type: decisionType,
      description,
      options,
      madeAt: new Date().toISOString(),
      rationale: options.rationale || 'Not specified'
    };

    this.decisions.push(decision);
    this.logDecision(decisionType, description);
    
    // Update context with decision
    this.contextManager.updateContext(
      '.claude/agents/coordinator.md',
      `**Decision**: ${description}\n**Rationale**: ${decision.rationale}`
    );

    return decision;
  }

  /**
   * Generate progress report
   */
  generateProgressReport() {
    const report = {
      session: this.sessionId,
      phase: this.extractCurrentPhase(),
      tasksAssigned: this.activeTasks.size + this.completedTasks.length,
      tasksCompleted: this.completedTasks.length,
      tasksActive: this.activeTasks.size,
      decisions: this.decisions.length,
      completionRate: this.calculateCompletionRate(),
      blockers: this.identifyBlockers(),
      nextSteps: this.determineNextSteps()
    };

    return report;
  }

  /**
   * Prepare handoff package for next session
   */
  prepareHandoff() {
    const handoff = {
      timestamp: new Date().toISOString(),
      currentState: {
        phase: this.extractCurrentPhase(),
        activeTasks: Array.from(this.activeTasks.values()),
        completedTasks: this.completedTasks,
        decisions: this.decisions
      },
      context: {
        objectives: this.extractObjectives(),
        constraints: this.extractConstraints(),
        successCriteria: this.extractSuccessCriteria()
      },
      nextSession: {
        objectives: this.determineNextSteps(),
        estimatedDuration: '1 hour',
        requiredContext: ['Previous decisions', 'Active tasks', 'Current phase']
      },
      files: {
        modified: this.getModifiedFiles(),
        created: this.getCreatedFiles()
      }
    };

    // Save handoff to file
    this.saveHandoff(handoff);
    
    return handoff;
  }

  // Helper methods

  extractObjectives() {
    // Extract from context
    return ['Master context management', 'Agent isolation', 'Clean handoffs'];
  }

  extractCurrentPhase() {
    // Extract from context
    return 'Phase 1: Setup & Structure';
  }

  extractAssignments() {
    // Extract from context
    return ['Implement context system', 'Create isolation patterns'];
  }

  extractConstraints() {
    return ['Learning exercise', 'Focus on patterns', 'Document everything'];
  }

  extractSuccessCriteria() {
    return {
      deliverables: ['implementation', 'documentation', 'tests'],
      validationTests: true,
      requiresDocumentation: true
    };
  }

  generateTaskId() {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generateDecisionId() {
    return `decision-${Date.now()}`;
  }

  createTaskFile(task) {
    const taskPath = path.join(
      this.exercisePath,
      '.claude/tasks',
      `${task.id}.json`
    );
    
    // Ensure directory exists
    const dir = path.dirname(taskPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(taskPath, JSON.stringify(task, null, 2));
  }

  logDecision(type, description) {
    console.log(`[COORDINATOR DECISION] ${type}: ${description}`);
  }

  updateProgress(task) {
    // Update progress in context
    const update = `Completed task: ${task.name}`;
    this.contextManager.updateContext('.claude/context.md', update);
  }

  calculateCompletionRate() {
    const total = this.activeTasks.size + this.completedTasks.length;
    if (total === 0) return 0;
    return (this.completedTasks.length / total) * 100;
  }

  identifyBlockers() {
    // Check for tasks in 'blocked' or 'needs_revision' status
    return Array.from(this.activeTasks.values())
      .filter(task => task.status === 'blocked' || task.status === 'needs_revision')
      .map(task => ({ id: task.id, reason: task.blockReason || 'Needs revision' }));
  }

  determineNextSteps() {
    // Logic to determine next steps based on current state
    return ['Continue implementation', 'Test isolation', 'Document patterns'];
  }

  getModifiedFiles() {
    // Track modified files
    return ['context.md', 'coordinator.md', 'task-executor.md'];
  }

  getCreatedFiles() {
    // Track created files
    return this.completedTasks.map(task => task.results?.createdFiles || []).flat();
  }

  saveHandoff(handoff) {
    const handoffPath = path.join(
      this.exercisePath,
      '.claude/handoffs',
      `handoff-${this.sessionId}.json`
    );
    
    // Ensure directory exists
    const dir = path.dirname(handoffPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(handoffPath, JSON.stringify(handoff, null, 2));
  }
}

module.exports = TaskCoordinator;