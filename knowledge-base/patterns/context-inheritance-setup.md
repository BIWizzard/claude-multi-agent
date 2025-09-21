# How to Apply Context Inheritance in a New Multi-Agent Project

Based on learned patterns, here's how to prompt Claude Code to set up your context inheritance structure:

## Initial Setup Prompt

```markdown
"I'm starting a new multi-agent development project for [PROJECT_TYPE].
Please set up a three-tier context inheritance structure:

1. Create `.claude/global-context.md` with universal coding standards
2. Create `.claude/context.md` for project-specific architecture
3. Create `.claude/session-[date].md` for today's work
4. Implement context inheritance that allows session to override project, and project to override global
5. Include role-based filtering for different agent types"
```

## Specific Example Prompt

Here's a complete, real-world prompt you could use:

```markdown
"I'm building a task management SaaS application with multiple AI agents.
Set up my context hierarchy:

## Global Context (`.claude/global-context.md`)
- TypeScript required
- Test coverage minimum 80%
- Conventional commits
- No console.logs in production
- API error handling standards

## Project Context (`.claude/context.md`)
- Tech stack: Next.js 14, Supabase, Tailwind
- Database: PostgreSQL with Row Level Security
- Key files:
  - `/app/api/*` - API routes
  - `/components/*` - Reusable components
  - `/lib/supabase.ts` - Database client
- Project rules:
  - All database queries through Supabase client
  - Server Components by default
  - Client Components only when needed

## Session Context (`.claude/sessions/2024-01-15.md`)
- Current feature: User authentication flow
- Active agents:
  - Agent A (Frontend): Build login/signup forms
  - Agent B (Backend): Set up Supabase auth
  - Agent C (Testing): Write auth tests
- Today's decisions:
  - Using Supabase Auth instead of NextAuth
  - Email/password + OAuth (Google, GitHub)

Create the inheritance system where:
1. Session can override project settings for rapid prototyping
2. Each agent only sees their relevant context
3. Context changes are tracked with reasons"
```

## Agent-Specific Context Request

```markdown
"Now create filtered contexts for each agent role:

Frontend Agent needs:
- Component patterns from global
- UI framework from project
- Current UI tasks from session
- Filter out database schemas and backend logic

Backend Agent needs:
- Security rules from global
- Database schema from project
- API tasks from session
- Filter out CSS and component details

Testing Agent needs:
- Testing standards from global
- Test framework setup from project
- Features to test from session
- Access to both frontend and backend contexts"
```

## Context Override Handling

```markdown
"Implement override handling:

When I say 'SESSION OVERRIDE: disable TypeScript for rapid prototype',
the session context should:
1. Override the global TypeScript requirement
2. Document the reason and expiration
3. Preserve all other global/project rules
4. Alert other agents to the temporary change

Example override format:
```javascript
overrides: {
  'codeStandards.useTypeScript': {
    value: false,
    reason: 'Rapid prototype for client demo',
    expires: '2024-01-16',
    originalValue: true
  }
}
```"
```

## Practical Workflow Prompt

```markdown
"Set up a practical workflow using this context hierarchy:

1. Morning Setup:
   - Load global standards
   - Load project architecture
   - Create new session file with today's goals

2. Agent Initialization:
   - Frontend Agent: Gets filtered context for UI work
   - Backend Agent: Gets filtered context for API work
   - Review Agent: Gets full context for code review

3. Context Updates:
   - When making decisions, update session context
   - When changing architecture, update project context
   - Global context never changes during project

4. End of Day:
   - Save session decisions to project context if permanent
   - Document what was completed
   - Prepare tomorrow's session context"
```

## Testing Your Setup

```markdown
"Create a test to verify the context system:

1. Test that session overrides work:
   - Global says useTypeScript: true
   - Session says useTypeScript: false
   - Result should be false

2. Test agent filtering:
   - Frontend agent should NOT see database passwords
   - Backend agent should NOT see CSS variables
   - Both should see shared API types

3. Test deep merge:
   - Session overrides one security rule
   - Other security rules remain intact

Show me the test results to confirm everything works."
```

## Key Phrases to Use

When prompting Claude Code, use these specific phrases:

- **"Set up three-tier context inheritance"** - triggers the global/project/session pattern
- **"Role-based context filtering"** - ensures agents get appropriate views
- **"Session override with documentation"** - temporary changes with reasons
- **"Deep merge for nested objects"** - prevents losing data on override
- **"Agent handoff with context"** - smooth transitions between agents
- **"Validate context completeness"** - ensures required fields are present

## Red Flags to Avoid

Don't say:
- "Give each agent their own separate context" (breaks inheritance)
- "Let agents modify global context" (breaks hierarchy)
- "Merge everything into one file" (loses granularity)
- "Auto-update contexts" (loses intentionality)

## Example Follow-up Prompts

After initial setup:

```markdown
"Frontend Agent: Using your filtered context, implement the login form component"

"Backend Agent: Using your filtered context, set up the auth API endpoints"

"Session Override: We need to skip tests today for emergency hotfix - document this override"

"End of session: Promote today's auth decisions to project context as they're now permanent"
```

## Quick Reference Template

```bash
# Project structure for context inheritance
project-root/
├── .claude/
│   ├── global-context.md      # Universal standards
│   ├── context.md              # Project-specific
│   └── sessions/
│       └── 2024-01-15.md       # Today's work
├── src/
└── tests/
```

## Context Flow Diagram

```
Global Context (Universal Rules)
    ↓ inherits
Project Context (Project-Specific)
    ↓ inherits
Session Context (Today's Work)
    ↓ filters
Agent Context (Role-Specific View)
```

This approach ensures your multi-agent project maintains clean separation of concerns, proper inheritance, and clear documentation of all decisions and overrides.