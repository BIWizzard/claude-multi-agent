# Context Handoff Protocols

## Overview
Standardized procedures for maintaining context continuity across agent transitions and sessions.

## Protocol Types

### 1. Session Start Protocol
```markdown
## Session Start Checklist
1. [ ] Read repository context (`.claude/context.md`)
2. [ ] Read exercise context (`exercises/[current]/.claude/context.md`)
3. [ ] Review agent context if applicable
4. [ ] Check latest session logs
5. [ ] Validate no outdated information
6. [ ] Confirm current objectives
```

### 2. Agent Transition Protocol
```markdown
## Agent Handoff Checklist
1. [ ] Complete current task to logical stopping point
2. [ ] Update agent context with:
   - Progress made
   - Decisions taken
   - Blocking issues
   - Next steps
3. [ ] Create handoff package:
   - Task assignment
   - Context needed
   - Success criteria
   - Constraints
4. [ ] Validate receiving agent has all information
5. [ ] Log transition in session log
```

### 3. Session End Protocol
```markdown
## Session Completion Checklist
1. [ ] Update all relevant context files
2. [ ] Create comprehensive session log
3. [ ] Document key decisions and rationale
4. [ ] Extract learnings for knowledge base
5. [ ] Define next session objectives
6. [ ] Prepare handoff package for next session
```

## Handoff Package Template

```markdown
# Handoff Package - [Date/Time]

## Current State
- **Exercise**: [Current exercise name]
- **Phase**: [Current phase]
- **Last Completed**: [Last major milestone]
- **Current Task**: [Active work]

## Context Summary
- **Key Decisions**: [List important decisions made]
- **Constraints**: [Active constraints to consider]
- **Dependencies**: [What's needed for progress]

## Next Agent/Session
- **Objective**: [Clear objective for next work]
- **Required Context**: [Essential information]
- **Success Criteria**: [How to know when done]
- **Estimated Duration**: [Time estimate]

## Blocking Issues
- [List any blockers with context]

## Files Modified
- [List of files changed with brief description]

## Knowledge Captured
- [Key learnings to extract]
- [Patterns identified]
- [Improvements suggested]
```

## Context Update Standards

### Real-time Updates
Update context files immediately when:
- Major decision made
- Phase completed
- Blocker encountered
- Pattern discovered
- Agent transition needed

### Update Format
```markdown
## Update - [Timestamp]
**Change**: [What changed]
**Reason**: [Why it changed]
**Impact**: [How it affects next steps]
**Action**: [What needs to happen next]
```

## Agent Communication Protocols

### Coordinator to Executor
```markdown
## Task Assignment
**Task**: [Clear task description]
**Context**: [Relevant background]
**Constraints**: [Limitations to consider]
**Success Criteria**: [Definition of done]
**Deliverables**: [Expected outputs]
**Deadline**: [When needed]
```

### Executor to Coordinator
```markdown
## Task Report
**Task**: [Task that was assigned]
**Status**: [Completed/Blocked/Partial]
**Deliverables**: [What was produced]
**Challenges**: [Issues encountered]
**Decisions**: [Choices made and why]
**Next Steps**: [Recommended actions]
```

## Quality Gates

### Pre-Handoff Validation
1. **Context Clarity**: Information is complete and unambiguous
2. **State Consistency**: All files reflect current state
3. **Documentation**: Decisions and rationale captured
4. **Continuity**: Next agent/session can start immediately

### Post-Handoff Validation
1. **Understanding**: Receiving agent comprehends objectives
2. **Information**: All needed context available
3. **Capability**: Agent can execute assigned tasks
4. **Progress**: Work can continue without clarification

## Emergency Procedures

### Context Loss Recovery
1. Check all context files in hierarchy
2. Review recent session logs
3. Examine file modification history
4. Reconstruct from git history if needed
5. Document gap and continue with best understanding

### Agent Confusion Resolution
1. Stop current work immediately
2. Return to exercise context
3. Clarify role and boundaries
4. Validate current objectives
5. Resume with clear understanding

### Handoff Failure Recovery
1. Document incomplete handoff
2. Gather available information
3. Make conservative assumptions
4. Note uncertainties in context
5. Proceed with caution

## Best Practices

### Do's
- ✅ Update context immediately after significant changes
- ✅ Be explicit about assumptions and uncertainties
- ✅ Include rationale for all decisions
- ✅ Test handoff completeness before transition
- ✅ Maintain session logs throughout work

### Don'ts
- ❌ Don't assume context is obvious
- ❌ Don't skip documentation "to save time"
- ❌ Don't leave work in ambiguous state
- ❌ Don't handoff without validation
- ❌ Don't lose session continuity

## Metrics

### Handoff Quality Score
- **Complete** (5): All information present, immediately actionable
- **Good** (4): Minor clarifications needed, work can proceed
- **Adequate** (3): Some gaps, requires investigation
- **Poor** (2): Significant gaps, major clarification needed
- **Failed** (1): Cannot proceed without extensive reconstruction

### Target Metrics
- Average handoff quality: ≥4.5
- Context update frequency: Real-time
- Session continuity: 100%
- Recovery time from confusion: <5 minutes

---

*Effective handoffs ensure continuous progress and learning*