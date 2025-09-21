# Context Management Patterns

## Pattern: Hierarchical Context Inheritance

### Problem
Multiple agents need different levels of context without confusion or information overload.

### Solution
Implement a hierarchical context structure where information flows from general to specific:
```
Repository Context → Exercise Context → Agent Context → Session Context
```

### Implementation
```markdown
# Repository Level (.claude/context.md)
- Global objectives
- Overall architecture
- Cross-exercise patterns

# Exercise Level (exercises/*/.claude/context.md)
- Exercise-specific goals
- Current phase and progress
- Success criteria

# Agent Level (exercises/*/.claude/agents/*.md)
- Role-specific responsibilities
- Current assignments
- Authority levels

# Session Level (exercises/*/.claude/session-logs/*.md)
- Immediate tasks
- Recent decisions
- Handoff state
```

### When to Use
- Multi-agent projects with specialized roles
- Complex workflows requiring context isolation
- Projects needing clean handoffs

### Benefits
- Prevents agent confusion
- Enables clean specialization
- Supports easy handoffs
- Maintains clarity at scale

---

## Pattern: Context Isolation Boundaries

### Problem
Agents receive irrelevant context that causes confusion or inefficiency.

### Solution
Create strict boundaries between agent contexts with explicit inclusion rather than inheritance.

### Implementation
```python
# Context filtering example
class ContextManager:
    def get_agent_context(self, agent_role):
        base_context = self.load_exercise_context()
        agent_specific = self.load_agent_context(agent_role)
        
        # Filter base context to only relevant parts
        filtered = self.filter_for_role(base_context, agent_role)
        
        return {
            'inherited': filtered,
            'specific': agent_specific,
            'boundaries': self.get_boundaries(agent_role)
        }
```

### When to Use
- Agents with very different responsibilities
- Sensitive information segregation
- Performance-critical context loading

---

## Pattern: Real-time Context Updates

### Problem
Context becomes stale during long-running sessions, causing decisions based on outdated information.

### Solution
Implement real-time context updates with structured change tracking.

### Implementation
```markdown
## Context Update Protocol
1. Detect significant change
2. Update relevant context file
3. Log change with timestamp
4. Notify dependent agents
5. Validate consistency

## Update Format
### [Timestamp] - [Change Type]
**What Changed**: [Description]
**Impact**: [Affected components]
**Action Required**: [Next steps]
```

### When to Use
- Long-running sessions
- Rapidly evolving requirements
- Multiple concurrent agents

---

## Pattern: Context Validation Gates

### Problem
Invalid or incomplete context causes agent failures or incorrect behavior.

### Solution
Implement validation gates at context boundaries.

### Implementation
```javascript
// Context validation
const validateContext = (context) => {
  const required = ['objectives', 'constraints', 'success_criteria'];
  const missing = required.filter(key => !context[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required context: ${missing.join(', ')}`);
  }
  
  // Validate format and consistency
  if (!isValidObjective(context.objectives)) {
    throw new Error('Invalid objective format');
  }
  
  return true;
};
```

### When to Use
- Critical decision points
- Agent handoffs
- Session starts
- Production environments

---

## Anti-Patterns to Avoid

### 🚫 Global Context Pollution
**Problem**: Putting all information in global context
**Why It's Bad**: Causes confusion, poor performance, maintenance nightmare
**Instead**: Use hierarchical inheritance with filtering

### 🚫 Implicit Context Assumptions
**Problem**: Assuming agents "know" context without explicit provision
**Why It's Bad**: Leads to failures, inconsistent behavior
**Instead**: Always explicitly provide needed context

### 🚫 Stale Context Syndrome
**Problem**: Never updating context during execution
**Why It's Bad**: Decisions based on outdated information
**Instead**: Implement real-time updates

### 🚫 Context Overload
**Problem**: Providing all available context to every agent
**Why It's Bad**: Information overload, confusion, poor performance
**Instead**: Filter context based on agent role and needs