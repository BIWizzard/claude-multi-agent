# Context Hierarchy in AI Collaboration

## Three Levels of Context

### 1. Global Context
**File**: `~/.claude/global-context.md`
**Scope**: Universal principles that apply across all projects
**Duration**: Persistent across all sessions and projects

**Real Example**:
```markdown
# Global AI Collaboration Context

## Code Quality Standards
- Always write tests for new functions
- Use TypeScript for type safety
- Follow semantic commit messages (feat:, fix:, docs:)
- Run `npm run lint` before committing

## Security Principles
- Never hardcode API keys or passwords
- Sanitize all user inputs
- Use HTTPS for all external API calls
- Validate file uploads for size and type

## Agent Communication
- Pass context explicitly between agents
- Include file paths and line numbers in references
- Always validate results before handoff
```

**Why here**: These rules apply whether you're building a todo app or an enterprise system.

### 2. Project Context
**File**: `./project-root/.claude/context.md`
**Scope**: Specific to the e-commerce website project
**Duration**: Persistent throughout the project lifecycle

**Real Example**:
```markdown
# E-Commerce Project Context

## Architecture
- Frontend: Next.js 14 with TypeScript
- Backend: Node.js Express API
- Database: PostgreSQL with Prisma ORM
- Authentication: Auth0
- Payment: Stripe integration

## Key Files
- `src/components/ProductCard.tsx` - Reusable product display
- `src/lib/db.ts` - Database connection and queries
- `prisma/schema.prisma` - Database schema
- `src/api/products/route.ts` - Product API endpoints

## Project Rules
- All components must be responsive (mobile-first)
- Price calculations happen server-side only
- Product images stored in Cloudinary
- Use Zod for API validation schemas
```

**Why here**: This context is specific to this e-commerce project but applies to every work session on it.

### 3. Session Context
**File**: `./project-root/.claude/session-2024-01-15.md`
**Scope**: Today's work on adding shopping cart functionality
**Duration**: Limited to this specific work session

**Real Example**:
```markdown
# Session Context - January 15, 2024

## Current Task
Adding shopping cart functionality to the e-commerce site

## Files Being Modified
- `src/components/CartButton.tsx` (creating new)
- `src/lib/cart-utils.ts` (creating new)
- `src/app/cart/page.tsx` (creating new)
- `prisma/schema.prisma` (adding CartItem model)

## Progress This Session
✅ Created CartItem database model
✅ Added cart state management with Zustand
🔄 Currently working on CartButton component
⏳ Next: Cart page layout and checkout flow

## Decisions Made
- Using Zustand instead of Redux for simpler state management
- Cart persists in localStorage, syncs to database on login
- Maximum 10 items per product in cart

## Current Agent Assignments
- Agent A: Frontend component development
- Agent B: Database schema and API endpoints
```

**Why here**: This information is only relevant for today's work session and will be replaced tomorrow.

## How Context Flows in Practice

```
~/.claude/global-context.md
    ↓ (inherited by)
./ecommerce-site/.claude/context.md
    ↓ (inherited by)
./ecommerce-site/.claude/session-2024-01-15.md
```

**Example in Action**:
When Agent A starts working on `CartButton.tsx`, they know:
- From Global: Use TypeScript, write tests, follow security principles
- From Project: This is a Next.js component, use responsive design, integrate with Stripe
- From Session: This button should use Zustand state, show cart count, handle 10-item limit

This hierarchy prevents agents from having to re-learn project setup every session while keeping immediate context focused and actionable.