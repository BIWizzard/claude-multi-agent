# Web UI Architect Agent Context

## Agent Role
Technical architect responsible for framework selection, project structure, and architectural decisions for the learning lab web UI.

## Mission
Design and implement a simple, lightweight, user-friendly web interface that guides students through multi-agent exercises with clear instructions and progress tracking.

## Core Responsibilities
- **Framework Selection**: Choose appropriate tech stack
- **Architecture Design**: Structure for maintainability and simplicity
- **Performance Optimization**: Keep it lightweight and fast
- **Developer Experience**: Easy to maintain and extend
- **User Experience**: Intuitive navigation and clear presentation

## Design Constraints
- **Simplicity First**: Avoid over-engineering
- **Minimal Dependencies**: Reduce complexity and maintenance
- **Static-First**: Prefer static generation where possible
- **Local Development**: Should work without backend
- **Progressive Enhancement**: Basic functionality without JS

## Technical Requirements
- Display markdown-formatted exercise instructions
- Track progress locally (localStorage)
- Navigate between exercises
- Show current status and next steps
- Responsive design for different screens
- Fast load times
- Clear typography and readability

## Framework Evaluation Criteria
1. **Learning Curve**: How quickly can we build?
2. **Bundle Size**: How lightweight is the output?
3. **Developer Experience**: How pleasant to work with?
4. **Markdown Support**: Native or easy integration?
5. **Routing**: Simple navigation between exercises?
6. **Build Speed**: Fast iteration cycles?
7. **Deployment**: Easy to host anywhere?

## Architectural Decisions Log

### Decision 1: Framework Selection
**Options Considered**:
1. **Vite + Vanilla JS**: Minimal, fast, full control
2. **Astro**: Great for content sites, markdown-first
3. **11ty**: Pure static site generator
4. **Next.js**: Full-featured but potentially overkill
5. **SvelteKit**: Modern, compiled, efficient

**Recommendation**: **Vite + Alpine.js + Marked**
- **Rationale**: 
  - Vite provides instant HMR and great DX
  - Alpine.js adds reactivity without framework overhead
  - Marked handles markdown rendering
  - Total bundle <50KB
  - Zero build step for development
  - Deploy anywhere as static files

### Decision 2: Project Structure
```
learning-lab-ui/
├── index.html              # Entry point
├── src/
│   ├── main.js            # App initialization
│   ├── styles/            # CSS modules
│   ├── components/        # Reusable components
│   ├── exercises/         # Exercise content
│   └── lib/              # Utilities
├── public/               # Static assets
└── exercises/           # Markdown content
    ├── 01-fundamentals.md
    ├── 02-multi-agent.md
    └── ...
```

### Decision 3: Data Structure
```javascript
// Exercise manifest
{
  exercises: [
    {
      id: '01-fundamentals',
      title: 'Claude Code Fundamentals',
      description: 'Master project structure and context management',
      duration: '2 hours',
      difficulty: 'beginner',
      status: 'not-started', // not-started | in-progress | completed
      sections: [
        {
          type: 'instruction',
          content: 'markdown content'
        },
        {
          type: 'task',
          content: 'Go to Claude Code and...',
          validation: 'self-check'
        }
      ]
    }
  ],
  progress: {
    currentExercise: '01-fundamentals',
    completedExercises: [],
    lastUpdated: '2025-01-20T...'
  }
}
```

### Decision 4: Styling Approach
- **CSS Custom Properties**: For theming
- **CSS Modules**: For component isolation
- **Utility Classes**: For common patterns
- **System Font Stack**: For performance
- **Dark Mode**: Optional, respects system preference

## Implementation Priority
1. **Core Structure**: HTML, routing, navigation
2. **Exercise Display**: Markdown rendering, sections
3. **Progress Tracking**: localStorage, state management
4. **Polish**: Animations, transitions, responsive design
5. **Enhancements**: Search, filtering, export progress

## Success Criteria
- Loads in <1 second
- Works without JavaScript (readable)
- Clear navigation between exercises
- Progress persists between sessions
- Accessible (WCAG 2.1 AA)
- Responsive on mobile
- Easy to add new exercises

## Next Actions
1. Set up Vite project
2. Create basic HTML structure
3. Implement Alpine.js components
4. Add markdown rendering
5. Build progress tracking
6. Style with CSS
7. Test exercise flow