# How to Mark Content for Role-Based Filtering

This guide explains how to mark your markdown content so different roles (coordinator vs executor) see only what's relevant to them.

## Quick Start: The Two Methods

### Method 1: Add Role Tags to Headers (Easiest)

Simply add `[role: rolename]` or `[roles: role1, role2]` to any header:

```markdown
# Project Planning [role: coordinator]
## Technical Setup [role: executor]
### Shared Documentation [roles: coordinator, executor]
```

### Method 2: Use Comments in Content

Add HTML comments anywhere in your content:

```markdown
## General Section

This paragraph is visible to everyone.

<!-- role: coordinator -->
This paragraph is only visible to coordinators.

<!-- roles: coordinator, executor -->
This paragraph is visible to both roles.
```

## The Three Role Options

### 1. Coordinator-Only Content
Use for: Strategic planning, budgets, stakeholder communication, high-level decisions

```markdown
# Budget Planning [role: coordinator]
# Sprint Goals [role: coordinator]

<!-- role: coordinator -->
Strategic planning notes go here.
```

### 2. Executor-Only Content
Use for: Technical implementation, coding details, testing procedures, infrastructure

```markdown
# Database Setup [role: executor]
# Testing Strategy [role: executor]

<!-- role: executor -->
Technical implementation details go here.
```

### 3. Shared Content (Both Roles)
Use for: APIs, workflows, deployment, anything both roles need to coordinate on

```markdown
# API Documentation [roles: coordinator, executor]
# Deployment Process [roles: coordinator, executor]

<!-- roles: coordinator, executor -->
Information both roles need for collaboration.
```

## What Happens to Unmarked Content?

Content with **no role markings** is considered **public** - it's visible to everyone but won't appear in role-specific filtered views.

```markdown
# General Information
This section has no role assignment, so it's public.
```

## Real-World Examples

### Example 1: Project Documentation
```markdown
# My Project Documentation

## Overview [roles: coordinator, executor]
High-level project goals that both roles need to understand.

## Budget & Resources [role: coordinator]
Financial planning and resource allocation.

### Technical Requirements [role: executor]
Specific technical needs and constraints.

## Implementation Plan [role: executor]
Step-by-step technical implementation.

<!-- role: executor -->
Additional technical notes here.

## Stakeholder Updates [role: coordinator]
Communication templates and schedules.
```

### Example 2: Mixed Content Section
```markdown
## Deployment Process

General deployment overview for everyone.

### Pre-deployment Checklist [role: coordinator]
Business readiness, stakeholder notifications, go/no-go decisions.

### Technical Deployment [role: executor]
Server configurations, database migrations, code deployment.

<!-- roles: coordinator, executor -->
Both roles need to coordinate on the deployment timing.
```

## Tips for Content Authors

### ✅ Do:
- **Be specific:** Use `[role: coordinator]` or `[role: executor]`
- **Use shared content:** Mark coordination points with `[roles: coordinator, executor]`
- **Keep it simple:** One role tag per header is usually enough
- **Think about your audience:** What does each role actually need to know?

### ❌ Don't:
- **Mix case randomly:** Use lowercase `coordinator` and `executor` (system handles case but be consistent)
- **Over-assign roles:** Not everything needs role filtering
- **Forget shared content:** Some information needs both roles for coordination

## How the Filtering Works

When someone uses the role filters:

- **Coordinator filter:** Shows only sections marked `coordinator` + any shared content
- **Executor filter:** Shows only sections marked `executor` + any shared content
- **General view:** Shows ALL content including unmarked sections

**Example filtered views:**

Original document:
```markdown
# Project Setup [role: coordinator]
# Technical Setup [role: executor]
# API Docs [roles: coordinator, executor]
# General Notes
```

**Coordinator sees:**
- Project Setup ✅
- API Docs ✅
- (Technical Setup and General Notes are hidden)

**Executor sees:**
- Technical Setup ✅
- API Docs ✅
- (Project Setup and General Notes are hidden)

**General view sees:**
- All sections ✅

## Quick Reference Card

| What you want | How to mark it |
|---------------|----------------|
| Coordinator only | `[role: coordinator]` |
| Executor only | `[role: executor]` |
| Both roles | `[roles: coordinator, executor]` |
| Everyone (public) | No marking needed |
| Add role to content | `<!-- role: coordinator -->` |
| Add multiple roles to content | `<!-- roles: coordinator, executor -->` |

Start simple: just add `[role: coordinator]` or `[role: executor]` to your headers, and you're ready to go!