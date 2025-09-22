# Claude Code DevOps & Git Workflow

## Overview

This document establishes comprehensive Git workflow practices specifically optimized for Claude Code multi-agent development. These practices ensure professional development breadcrumbs, excellent agent handoff context, and robust collaboration patterns.

## 🎯 Core Principles

1. **Task-Based Commits**: Every TodoWrite task completion = one commit
2. **Agent Context Preservation**: All commits include agent type and session context
3. **Professional Breadcrumbs**: Development history tells a clear story
4. **Safety-First Approach**: Always maintain rollback capability
5. **Standardized Communication**: Consistent formats for commits, PRs, and handoffs

## 🌳 Branch Strategy

### Branch Naming Conventions

```bash
# Feature development
feature/agent-coordination-system
feature/progress-tracking-enhancement
feature/exercise-content-migration

# Architecture changes
arch/separation-of-concerns-refactor
arch/component-library-implementation
arch/data-layer-optimization

# Agent-specific work
agent/ui-specialist/dark-mode-implementation
agent/content-specialist/mdx-structure-optimization
agent/data-specialist/analytics-integration

# Hotfixes and urgent changes
hotfix/progress-reset-bug
hotfix/mobile-navigation-overflow

# Experimental/exploration
experiment/ai-generated-content-validation
experiment/performance-optimization-poc

# Session-based development
session/20241122-architectural-review
session/20241122-ui-improvements
```

### Git Aliases for Easy Branch Management

```bash
# Create feature branch
git feature-branch <feature-name>

# Create agent-specific branch with date
git agent-branch <agent-type>

# Get session summary
git session-summary
```

## 📝 Commit Message Standards

### Template Structure

```
type(scope): brief description

Detailed explanation:
- What was changed and why
- Reference to TodoWrite tasks
- Testing/validation notes

✅ Task: [TodoWrite task reference]
🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Commit Types

- **feat**: New features and enhancements
- **fix**: Bug fixes and corrections
- **docs**: Documentation changes
- **style**: Code formatting, UI/styling changes
- **refactor**: Code restructuring without functionality changes
- **test**: Adding or modifying tests
- **chore**: Maintenance tasks, dependency updates
- **arch**: Architectural changes and major refactoring
- **workflow**: Development process and tooling changes

### Scope Examples

- **ui**: User interface components and styling
- **content**: MDX files, learning materials, content structure
- **data**: Progress tracking, analytics, user data
- **config**: Configuration files, build setup
- **build**: Build process, deployment scripts
- **workflow**: Development process, Git workflow

## 🤖 Agent-Specific Commit Patterns

### UI Specialist Agent

```bash
git commit -m "ui(components): Implement responsive exercise card layout

- Add Tailwind responsive breakpoints for exercise cards
- Optimize card spacing for mobile and desktop
- Ensure consistent hover states across components

Component: ExerciseCard.tsx
Screen Sizes: Mobile (sm), Tablet (md), Desktop (lg)
Testing: Verified across browser dev tools

✅ Task: Create responsive card components
🎨 UI Agent - Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Content Specialist Agent

```bash
git commit -m "content(exercises): Restructure section progression logic

- Update MDX frontmatter for proper exercise hierarchy
- Align section numbering with learning objectives
- Improve content flow between exercise sections

Files: 01-fundamentals-*.mdx (7 files)
Structure: 1 exercise → 7 progressive sections
Validation: Content renders correctly in all contexts

✅ Task: Optimize content structure and navigation
📚 Content Agent - Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Data Specialist Agent

```bash
git commit -m "data(progress): Optimize localStorage persistence layer

- Implement atomic updates for progress state
- Add data validation for user progress objects
- Include migration logic for schema changes

Storage: localStorage with JSON serialization
Performance: Reduced read/write operations by 40%
Compatibility: Backward compatible with existing data

✅ Task: Enhance progress tracking reliability
💾 Data Agent - Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Architecture Specialist Agent

```bash
git commit -m "arch(structure): Implement clean layer separation

- Separate UI concerns from business logic
- Extract content management to dedicated modules
- Isolate data persistence from presentation layer

Architecture: Three-layer separation (UI/Content/Data)
Impact: Improved maintainability and testability
Migration: Backward compatible with existing codebase

✅ Task: Establish architectural boundaries
🏗️ Architecture Agent - Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

## 🔄 Development Session Management

### Session Start Protocol

```bash
# Create session branch
git checkout -b session/$(date +%Y%m%d)-architectural-review

# Mark session start
git commit --allow-empty -m "session: Start architectural review session

Focus: Examine UI/Content/Data separation
Estimated Duration: 60-90 minutes
Agent Type: Architecture Specialist

🤖 Session Start - Claude Code"
```

### During Session - Task-Based Commits

```bash
# After each TodoWrite task completion
git add .
git commit -m "feat(progress): Implement exercise completion tracking

- Add completion state management to useExerciseProgress hook
- Update UI to show visual completion indicators
- Persist completion status in localStorage

Testing: Verified completion persists across page reloads
Integration: Works with existing progress dashboard

✅ Task: Add exercise completion tracking
🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Session End Protocol

```bash
git commit -m "session: Complete architectural review session

Summary:
✅ UI layer analysis complete
✅ Content structure optimized
✅ Data flow improvements identified
🔄 Implementation ready for next session

Session Duration: 75 minutes
Next Focus: Implementation of identified improvements

🤖 Session Complete - Claude Code"
```

## 📋 Pull Request Process

### PR Template Usage

All PRs use the standardized template at `.github/PULL_REQUEST_TEMPLATE.md` which includes:

- Agent information and session context
- TodoWrite task correlation
- Technical change summary
- Architecture impact assessment
- Testing validation checklist
- Success metrics and deployment notes

### Review Process

1. **Automated Checks**: Type checking, build validation
2. **Agent Context Review**: Ensure proper agent patterns demonstrated
3. **Functionality Validation**: All features work as expected
4. **Architecture Alignment**: Changes follow established patterns

### Merge Strategies

```bash
# Feature branches with clean agent work
git merge --squash feature/agent-coordination-system

# Architectural changes requiring history preservation
git merge --no-ff arch/separation-of-concerns-refactor

# Hotfixes (fast-forward when possible)
git merge hotfix/progress-reset-bug
```

## 🛡️ Safety and Rollback Procedures

### Creating Safety Nets

```bash
# Before major changes
git checkout -b architecture-review-backup
git push origin architecture-review-backup

# Create working branch
git checkout -b architecture-improvements
```

### Emergency Rollback

```bash
# If anything breaks during development
git checkout architecture-review-backup
cd /path/to/project
npm install  # Restore dependencies
npm run dev   # Verify everything works
```

### Rollback Validation Checklist

- [ ] Dev server starts without errors
- [ ] All exercises load correctly
- [ ] Progress tracking functions properly
- [ ] Navigation between exercises works
- [ ] Build process completes successfully
- [ ] UI styling and theming intact
- [ ] No console errors in browser

## 🔧 Failed Changes Protocol

### Preserving Failed Work

```bash
# When agent encounters failure
git add -A
git stash push -m "WIP: Failed attempt at dark mode implementation

Error: Tailwind classes not applying correctly
Issue: CSS purging removing dark mode classes
Status: Need to investigate PostCSS configuration

🚨 Failed Implementation - Preserving Work
🤖 Claude Code Agent"
```

### Documenting Rollbacks

```bash
# Rollback and create issue tracking
git reset --hard HEAD~1
git commit --allow-empty -m "rollback: Revert dark mode implementation attempt

Reason: CSS purging issues with Tailwind dark mode
Investigation Needed: PostCSS configuration review
Next Steps: Research Tailwind dark mode best practices

🔄 Rollback Complete - Issue Documented
🤖 Claude Code Agent"
```

## 📊 Session Tracking and Metrics

### Git Aliases for Development Insights

```bash
# Get development statistics
git config alias.agent-stats '!f() {
    echo "📊 Claude Code Development Stats";
    echo "Commits this session: $(git rev-list --count HEAD ^main)";
    echo "Files modified: $(git diff --name-only main | wc -l)";
    echo "Agent commits: $(git log --oneline --grep="Claude Code" main..HEAD | wc -l)";
}; f'

# Session summary with visual representation
git config alias.session-summary '!f() {
    echo "🎯 Session Summary";
    git log --oneline --grep="Claude Code" main..HEAD;
    echo "";
    echo "📁 Modified Files:";
    git diff --stat main;
}; f'
```

### Development Metrics to Track

- **Commits per session**: Measure development velocity
- **Task completion rate**: TodoWrite tasks → commits correlation
- **Agent handoff frequency**: How often work passes between agents
- **Rollback frequency**: Indicator of development stability
- **Code churn**: Lines added/removed per session

## 🎯 TodoWrite Integration

### Correlation Strategy

```bash
# Each TodoWrite task completion triggers a commit
✅ Task: Implement dark mode toggle
→ Commit: feat(ui): Add dark mode toggle component

✅ Task: Update exercise navigation
→ Commit: feat(navigation): Enhance exercise section navigation

✅ Task: Optimize progress tracking
→ Commit: perf(data): Optimize localStorage operations
```

### Task-Commit Mapping

- **One task = One commit** (primary pattern)
- **Related tasks = Grouped commit** (when logical)
- **Failed tasks = Stash + document** (preserve work)
- **Blocked tasks = Checkpoint commit** (enable handoff)

## 📚 Context Preservation for Agent Handoffs

### Session Handoff Documentation

```markdown
# Session Handoff: 2024-11-22

## Current Branch State
- **Active Branch**: architecture-improvements
- **Commits This Session**: 7
- **Files Modified**: 12

## TodoWrite Status
- ✅ UI layer analysis complete
- ✅ Content structure optimized
- 🔄 Data flow improvements in progress
- ❌ Testing framework setup blocked

## Context for Next Agent
The architecture review has identified excellent separation
of concerns. The UI components are well-structured, content
management is clean, but the data layer needs optimization.

Focus next on:
1. Progress tracking performance improvements
2. Analytics integration architecture
3. User data privacy considerations

## Environment Setup
```bash
cd /Users/kmgdev/dev_projects/claude-multi-agent/projects/learning-lab-astro
npm run dev  # Runs on localhost:4323
```
```

## 🚀 Implementation Quick Start

### 1. Configure Git Templates

```bash
# Set up commit message template
git config commit.template .gitmessage

# Configure helpful aliases
git config alias.feature-branch '!f() { git checkout -b "feature/$1"; }; f'
git config alias.agent-branch '!f() { git checkout -b "agent/$1/$(date +%Y%m%d)"; }; f'
git config alias.session-summary '!f() { echo "🎯 Session Summary"; git log --oneline --grep="Claude Code" main..HEAD; echo ""; echo "📁 Modified Files:"; git diff --stat main; }; f'
```

### 2. Create Safety Branches

```bash
# Always create backup before major changes
git checkout -b architecture-review-backup
git push origin architecture-review-backup

# Create working branch
git checkout -b architecture-improvements
```

### 3. Follow Task-Commit Pattern

```bash
# Complete TodoWrite task
# → Stage changes
git add .
# → Commit with standardized message
git commit -m "feat(ui): Add responsive navigation

- Implement mobile-first navigation design
- Add hamburger menu for mobile devices
- Ensure accessibility with keyboard navigation

Testing: Verified on mobile, tablet, desktop
Integration: Works with existing dark mode toggle

✅ Task: Create responsive navigation component
🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

## 🎉 Benefits of This Workflow

### For Development Quality
- **Clear development history**: Every change is documented and traceable
- **Professional breadcrumbs**: Easy to understand project evolution
- **Robust rollback capability**: Never lose working functionality
- **Agent collaboration patterns**: Excellent handoff between different specialists

### For Learning and Teaching
- **Multi-agent best practices**: The workflow itself demonstrates good practices
- **Development methodology**: Students learn professional Git workflows
- **Context preservation**: Future development sessions start with full context
- **Process documentation**: The development process becomes part of the curriculum

### For Project Maintenance
- **Easy debugging**: Clear commit history helps identify when issues were introduced
- **Feature tracking**: Each feature development is well-documented
- **Architecture evolution**: Major changes are clearly marked and explained
- **Team onboarding**: New developers can understand the development patterns quickly

---

## 📖 Related Documentation

- [`.gitmessage`](/.gitmessage) - Commit message template
- [`.github/PULL_REQUEST_TEMPLATE.md`](/.github/PULL_REQUEST_TEMPLATE.md) - PR template
- [`CONTRIBUTING.md`](/CONTRIBUTING.md) - Contribution guidelines
- Session handoff documents in project root

---

*This workflow was designed specifically for Claude Code multi-agent development and serves as both a development tool and a learning resource for students studying multi-agent orchestration patterns.*