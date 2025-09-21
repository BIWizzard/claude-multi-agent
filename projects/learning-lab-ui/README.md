# Claude Multi-Agent Learning Lab - Web UI

## 🎯 Overview

Interactive web interface that guides students through multi-agent orchestration exercises. Built using multi-agent patterns with specialized architect and translator agents.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

Open http://localhost:3000 to start learning!

### Production Build
```bash
npm run build
npm run preview
```

## 🏗️ Architecture

### Tech Stack (Lightweight & Fast)
- **Vite** - Lightning fast dev server and build tool
- **Alpine.js** - Minimal reactive framework (~15KB)
- **Marked** - Markdown to HTML conversion
- **DOMPurify** - Secure HTML sanitization
- **Vanilla CSS** - Custom properties and modern CSS

### Project Structure
```
learning-lab-ui/
├── index.html              # Main entry point
├── src/
│   ├── main.js            # Alpine.js app logic
│   └── styles/main.css    # Comprehensive styling
├── exercises/             # Exercise content
│   ├── manifest.json      # Exercise definitions
│   └── 01-fundamentals/   # Markdown content
└── .claude/              # Agent contexts
    └── agents/           # Architect & translator
```

## 🤖 Multi-Agent Development

This web UI was built using the multi-agent patterns it teaches:

### Agent Roles
1. **Web Architect Agent** (`.claude/agents/web-architect.md`)
   - Framework selection and technical decisions
   - Project structure and performance optimization
   - Development experience and deployment strategy

2. **UI Translator Agent** (`.claude/agents/ui-translator.md`)
   - Convert exercise content to web-friendly format
   - Design learning flows and user experience
   - Create interactive elements and validation

### Design Decisions
- **Vite + Alpine.js**: Minimal bundle size (~50KB total)
- **Static-first**: Works without backend, deploys anywhere
- **Progressive enhancement**: Functional without JavaScript
- **Local storage**: Progress persists across sessions
- **Responsive design**: Works on mobile and desktop

## 📚 Exercise Flow

### Learning Pattern
1. **🌐 Read** - Concepts and instructions (web)
2. **💻 Implement** - Hands-on coding (Claude Code)
3. **✅ Validate** - Check understanding (web)
4. **🧠 Reflect** - Capture insights (web)

### Exercise Structure
Each exercise includes:
- **Overview** - Goals and context
- **Concepts** - Background knowledge
- **Action Sections** - Switch to Claude Code
- **Validation** - Verify implementation
- **Reflection** - Extract learnings

## 📄 Content Management

### Adding New Exercises
1. **Update manifest** (`exercises/manifest.json`)
2. **Create content directory** (`exercises/[exercise-id]/`)
3. **Add markdown files** for each section
4. **Test the flow** end-to-end

### Content Format
```markdown
# Section Title

## 🔄 Transition Points
Clear indicators when to switch between web and Claude Code

## 💻 Action Required
Specific instructions for Claude Code work

## ✅ Success Criteria
How to know the section is complete
```

## 📊 Progress Tracking

### Storage
- **localStorage** - Progress persists across browser sessions
- **JSON format** - Easy to export/import progress
- **Section-level tracking** - Granular progress indication

### Data Structure
```javascript
{
  "01-fundamentals": {
    "completed": false,
    "sections": {
      "overview": { "completed": true, "timestamp": "..." },
      "setup": { "completed": false, "viewed": true }
    },
    "lastViewed": "setup"
  }
}
```

## 🌨️ Features

### Current
- ✅ Exercise overview with progress tracking
- ✅ Section-by-section navigation
- ✅ Markdown content rendering
- ✅ Progress persistence
- ✅ Responsive design
- ✅ Dark mode support

### Planned
- 🔄 Export/import progress
- 🔍 Search functionality
- 📈 Analytics and insights
- 📤 Email progress reports
- 🎯 Custom learning paths

## 🔧 Development

### File Watching
Vite automatically reloads when you change:
- HTML, CSS, or JavaScript files
- Exercise markdown content
- Exercise manifest

### Debugging
```javascript
// Access Alpine.js data in browser console
$data

// Check current state
console.log('Current exercise:', $data.currentExercise);
console.log('Progress:', $data.progress);
```

### Adding New Features
1. Update Alpine.js data/methods in `src/main.js`
2. Add corresponding HTML in `index.html`
3. Style with CSS in `src/styles/main.css`
4. Test across different exercises

## 🚀 Deployment

### Static Hosting
Works with any static host:
```bash
npm run build
# Upload 'dist' folder to:
# - Netlify, Vercel, GitHub Pages
# - S3, CloudFlare Pages
# - Any static web server
```

### CDN Integration
- All dependencies loaded from CDN
- No build step required for simple changes
- Cache-friendly with versioned assets

## 🧑‍💻 Contributing

### Content Updates
1. Edit markdown files in `exercises/[exercise-id]/`
2. Update manifest if adding new sections
3. Test locally with `npm run dev`
4. Submit PR with changes

### Feature Development
1. Follow existing Alpine.js patterns
2. Keep bundle size minimal
3. Test on mobile and desktop
4. Document new features in README

---

**Built with ❤️ using multi-agent orchestration patterns**