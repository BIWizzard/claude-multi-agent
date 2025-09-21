/**
 * Context Manager - Core utility for managing hierarchical context in multi-agent systems
 * 
 * This implementation demonstrates the fundamental patterns for:
 * - Loading and parsing context files
 * - Implementing inheritance hierarchy
 * - Filtering context by agent role
 * - Validating context completeness
 */

const fs = require('fs');
const path = require('path');

class ContextManager {
  constructor(exercisePath) {
    this.exercisePath = exercisePath;
    this.contextCache = new Map();
  }

  /**
   * Load repository-level context
   */
  loadRepositoryContext() {
    const contextPath = path.join(this.exercisePath, '../../.claude/context.md');
    return this.loadContextFile(contextPath);
  }

  /**
   * Load exercise-specific context
   */
  loadExerciseContext() {
    const contextPath = path.join(this.exercisePath, '.claude/context.md');
    return this.loadContextFile(contextPath);
  }

  /**
   * Load agent-specific context
   */
  loadAgentContext(agentName) {
    const contextPath = path.join(this.exercisePath, `.claude/agents/${agentName}.md`);
    return this.loadContextFile(contextPath);
  }

  /**
   * Load session context
   */
  loadSessionContext(sessionId) {
    const contextPath = path.join(
      this.exercisePath, 
      `.claude/session-logs/session-${sessionId}.md`
    );
    return this.loadContextFile(contextPath);
  }

  /**
   * Get complete context for an agent with inheritance
   */
  getAgentContext(agentName, sessionId = null) {
    const context = {
      repository: this.filterForAgent(this.loadRepositoryContext(), agentName),
      exercise: this.filterForAgent(this.loadExerciseContext(), agentName),
      agent: this.loadAgentContext(agentName),
      session: sessionId ? this.loadSessionContext(sessionId) : null
    };

    // Validate context completeness
    this.validateContext(context, agentName);

    return context;
  }

  /**
   * Filter context based on agent role
   */
  filterForAgent(context, agentName) {
    // Define what each agent should see from parent contexts
    const filters = {
      'coordinator': {
        include: ['objectives', 'architecture', 'progress', 'success_criteria', 'current_phase'],
        exclude: ['implementation_details', 'technical_specs']
      },
      'task-executor': {
        include: ['current_task', 'technical_specs', 'success_criteria', 'constraints', 'deliverables'],
        exclude: ['strategic_decisions', 'human_approvals']
      }
    };

    const filter = filters[agentName] || { include: [], exclude: [] };
    
    // Parse and filter context
    const filtered = {};
    const sections = this.parseMarkdownSections(context);
    
    for (const [section, content] of Object.entries(sections)) {
      const shouldInclude = filter.include.some(keyword => 
        section.toLowerCase().includes(keyword.toLowerCase())
      );
      const shouldExclude = filter.exclude.some(keyword => 
        section.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (shouldInclude && !shouldExclude) {
        filtered[section] = content;
      }
    }

    return filtered;
  }

  /**
   * Validate context has required information
   */
  validateContext(context, agentName) {
    const requirements = {
      'coordinator': ['objectives', 'current_phase', 'success_criteria'],
      'task-executor': ['current_task', 'deliverables', 'constraints']
    };

    const required = requirements[agentName] || [];
    const missing = [];

    for (const field of required) {
      if (!this.contextContainsField(context, field)) {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      throw new Error(
        `Invalid context for agent '${agentName}'. Missing: ${missing.join(', ')}`
      );
    }

    return true;
  }

  /**
   * Load and cache context file
   */
  loadContextFile(filePath) {
    if (this.contextCache.has(filePath)) {
      return this.contextCache.get(filePath);
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      this.contextCache.set(filePath, content);
      return content;
    } catch (error) {
      console.error(`Failed to load context from ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Parse markdown into sections
   */
  parseMarkdownSections(markdown) {
    if (!markdown) return {};
    
    const sections = {};
    const lines = markdown.split('\n');
    let currentSection = 'root';
    let sectionContent = [];

    for (const line of lines) {
      if (line.startsWith('#')) {
        // Save previous section
        if (sectionContent.length > 0) {
          sections[currentSection] = sectionContent.join('\n').trim();
        }
        
        // Start new section
        currentSection = line.replace(/^#+\s*/, '').toLowerCase().replace(/\s+/g, '_');
        sectionContent = [];
      } else {
        sectionContent.push(line);
      }
    }

    // Save last section
    if (sectionContent.length > 0) {
      sections[currentSection] = sectionContent.join('\n').trim();
    }

    return sections;
  }

  /**
   * Check if context contains a field
   */
  contextContainsField(context, field) {
    const searchInObject = (obj) => {
      if (!obj) return false;

      if (typeof obj === 'string') {
        return obj.toLowerCase().includes(field.toLowerCase());
      }

      if (typeof obj === 'object') {
        // Check if field exists as a key in this object
        if (Object.keys(obj).includes(field)) {
          return true;
        }
        // Also search in values
        return Object.values(obj).some(value => searchInObject(value));
      }

      return false;
    };

    return searchInObject(context);
  }

  /**
   * Update context with new information
   */
  updateContext(contextPath, updates) {
    const timestamp = new Date().toISOString();
    const updateBlock = `

## Update - ${timestamp}
${updates}
`;
    
    try {
      fs.appendFileSync(
        path.join(this.exercisePath, contextPath),
        updateBlock
      );
      
      // Clear cache for updated file
      this.contextCache.delete(path.join(this.exercisePath, contextPath));
      
      return true;
    } catch (error) {
      console.error('Failed to update context:', error.message);
      return false;
    }
  }
}

module.exports = ContextManager;