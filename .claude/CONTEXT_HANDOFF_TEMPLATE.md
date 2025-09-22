# Claude Code Session Context Handoff Template

## Quick Start for New Agents

### 1. Project Status Summary
- **Current Goal**: [What is the primary objective?]
- **Working Branch**: [Which branch contains current work?]
- **System Status**: [Is everything working? Any blockers?]
- **Last Session Focus**: [What was the previous agent working on?]

### 2. Context Files to Read (in order)
1. **`.claude/DEVELOPMENT_CONTEXT.md`** - Project overview and goals
2. **`git log --oneline -5`** - Recent changes and progress
3. **`git status`** - Current working tree state
4. **`.claude/ARCHITECTURE_CURRENT.md`** - System architecture
5. **`Claude-Code-DevOps-Git-Workflow.md`** - Development process standards

### 3. Critical Information
- **Safety Branch**: `architecture-review-backup` (rollback available)
- **Dev Server**: Usually runs on localhost:4321-4324
- **Key Paths**:
  - Product: `/projects/learning-lab-astro/`
  - Documentation: `/.claude/`
  - DevOps Guide: `/Claude-Code-DevOps-Git-Workflow.md`

### 4. Current Architecture Status
- **TypeScript**: Strict mode enabled, zero errors
- **Testing**: Manual validation after each change
- **Git Workflow**: Task-based commits with professional messages
- **Documentation**: Senior developer level throughout

### 5. Known Issues/Blockers
- [List any current blockers or technical debt]
- [Mention any partially completed work]
- [Note any areas that need special attention]

### 6. Next Priorities
- [What should the next agent focus on?]
- [Any specific tasks waiting to be completed?]
- [Long-term goals to keep in mind?]

## Session Start Protocol

```bash
# 1. Verify system works
cd /Users/kmgdev/dev_projects/claude-multi-agent/projects/learning-lab-astro
npm run dev  # Should start without errors

# 2. Check current state
git status
git log --oneline -5

# 3. Read context files
# - .claude/DEVELOPMENT_CONTEXT.md
# - .claude/ARCHITECTURE_CURRENT.md
# - Claude-Code-DevOps-Git-Workflow.md

# 4. Create session start commit
git commit --allow-empty -m "session: Start [SESSION_TYPE] session

Focus: [WHAT_YOU_PLAN_TO_WORK_ON]
Context: [BRIEF_CONTEXT_FROM_HANDOFF]
Duration: [ESTIMATED_TIME]

🤖 Session Start - Claude Code"
```

## Session End Protocol

```bash
# 1. Complete session commit
git commit -m "session: Complete [SESSION_TYPE] session

Summary:
✅ [COMPLETED_TASK_1]
✅ [COMPLETED_TASK_2]
🔄 [IN_PROGRESS_WORK]
❌ [BLOCKED_ITEMS]

Duration: [ACTUAL_TIME]
Next Focus: [WHAT_NEXT_AGENT_SHOULD_DO]

🤖 Session Complete - Claude Code"

# 2. Update context files if needed
# 3. Update this handoff template with current status
```

---

**Last Updated**: [DATE]
**Current Status**: [BRIEF_STATUS]
**Next Priority**: [NEXT_FOCUS_AREA]