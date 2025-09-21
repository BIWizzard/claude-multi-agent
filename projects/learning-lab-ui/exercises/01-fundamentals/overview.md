# Exercise 01: Claude Code Fundamentals

## 🎯 What You'll Accomplish

By the end of this exercise, you'll have built a complete multi-agent orchestration system with:

- **Hierarchical Context Management** - Information flows clearly from repository to agents
- **Agent Isolation** - Agents stay focused without context confusion
- **Session Handoffs** - Work continues smoothly across sessions
- **Reusable Patterns** - Templates for future multi-agent projects

## 🔍 Why This Matters

Multi-agent systems can quickly become chaotic without proper structure. You've probably experienced:

❌ **Context Confusion** - Agents unclear about their role or current state  
❌ **Information Overload** - Too much irrelevant information slowing down decisions  
❌ **Lost Progress** - Starting over because session state wasn't preserved  
❌ **Inconsistent Patterns** - Each project structured differently  

This exercise teaches you proven patterns that solve these problems.

## 🏗️ What You'll Build

### The Project Structure
```
multi-agent-project/
├── .claude/                    # Context management hub
│   ├── context.md              # Repository-level context
│   ├── agents/                 # Agent-specific contexts
│   └── session-logs/           # Session continuity
├── src/
│   ├── coordinator/            # Orchestration logic
│   ├── executor/               # Task implementation
│   └── shared/                 # Common utilities
└── knowledge-base/            # Extracted patterns
```

### The Context Hierarchy
```
Repository Context (Global objectives, architecture)
    ↓
Exercise Context (Specific goals, current phase)
    ↓
Agent Context (Role responsibilities, current tasks)
    ↓
Session Context (Immediate decisions, handoff state)
```

### The Two-Agent Pattern
We'll implement a simple but powerful pattern:

1. **Coordinator Agent** 🎯
   - Makes strategic decisions
   - Assigns tasks with clear context
   - Tracks progress and handles escalations
   - Prepares handoffs for session continuity

2. **Task Executor Agent** 🔧
   - Implements specific tasks
   - Reports results with documentation
   - Focuses on technical execution
   - Validates work against success criteria

## 📊 Exercise Structure

| Section | Type | Time | What You'll Do |
|---------|------|------|----------------|
| **Overview** | Reading | 10 min | Understand the goals (you are here) |
| **Key Concepts** | Reading | 15 min | Learn context management theory |
| **Project Setup** | Action | 20 min | Create structure in Claude Code |
| **Context Implementation** | Action | 45 min | Build the management system |
| **Agent Coordination** | Action | 30 min | Test isolation and communication |
| **Testing & Validation** | Validation | 15 min | Verify everything works |
| **Knowledge Extraction** | Reflection | 15 min | Capture learnings for reuse |

## 🎓 Learning Approach

This exercise follows a **hands-on learning pattern**:

1. **📚 Read** concepts and background (here on the web)
2. **🔨 Build** implementations (in Claude Code)
3. **✅ Validate** your work (back on the web)
4. **🧠 Reflect** on patterns learned (capture insights)

Each section clearly tells you when to switch between the web and Claude Code.

## 🎯 Success Criteria

You'll know you've succeeded when:

- ✅ Context flows clearly through the hierarchy
- ✅ Agents stay focused on their specific roles
- ✅ You can pause and resume work without confusion
- ✅ The structure scales to more complex scenarios
- ✅ You've documented reusable patterns

## 🚀 Ready to Start?

Click **Next** to dive into the key concepts behind effective multi-agent orchestration.

---

> 💡 **Pro Tip**: Keep this browser tab open throughout the exercise. You'll switch between here and Claude Code multiple times.