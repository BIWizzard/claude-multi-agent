# Multi-Agent Project Setup Template

**Purpose**: Master prompt template for setting up new multi-agent development projects
**Usage**: Customize the placeholders, select relevant modules, and use as your initial Claude Code prompt

---

## Base Project Setup

```markdown
"I'm starting a new multi-agent development project: [PROJECT_NAME]

Project Type: [WEB_APP/API/MOBILE_APP/CLI_TOOL/OTHER]
Tech Stack: [FRONTEND], [BACKEND], [DATABASE], [OTHER_TOOLS]
Team Size: [NUMBER] AI agents working collaboratively

Please set up a complete multi-agent workflow with the following modules:
```

---

## Module 1: Context Inheritance Protocol

```markdown
## Context Inheritance Setup

Create a three-tier context hierarchy:

### Global Context (`.claude/global-context.md`)
Universal standards across all projects:
- [CODE_QUALITY_STANDARDS]
- [SECURITY_PRINCIPLES]
- [TESTING_REQUIREMENTS]
- [COMMUNICATION_PROTOCOLS]

### Project Context (`.claude/context.md`)
Project-specific architecture and rules:
- Tech Stack: [TECH_STACK_DETAILS]
- Architecture: [ARCHITECTURE_PATTERN]
- Key Files:
  - [KEY_FILE_1] - [PURPOSE]
  - [KEY_FILE_2] - [PURPOSE]
  - [KEY_FILE_3] - [PURPOSE]
- Project Rules:
  - [PROJECT_RULE_1]
  - [PROJECT_RULE_2]
  - [PROJECT_RULE_3]

### Session Context (`.claude/sessions/[DATE].md`)
Today's specific work:
- Current Feature: [FEATURE_NAME]
- Active Agents:
  - Agent A ([ROLE]): [RESPONSIBILITY]
  - Agent B ([ROLE]): [RESPONSIBILITY]
  - Agent C ([ROLE]): [RESPONSIBILITY]
- Today's Goals: [SESSION_GOALS]

Implement inheritance where session can override project, project can override global, with documentation of all overrides.
```

---

## Module 2: Strategic Scoping & Progressive Development

```markdown
## Progressive Development Setup

Implement the five-stage progressive development pattern:

### Stage 1: Strategic Decomposition
Break complex goals into manageable components:

"I want to build [COMPLEX_SYSTEM_DESCRIPTION]. Before we code anything, help me break this task down into four or five manageable tasks, so that we can build incrementally and each one is independently testable."

Example customization:
- [COMPLEX_SYSTEM_DESCRIPTION]: "a user authentication system with role-based access control"
- Expected output: 4-5 independently testable components

### Stage 2: Foundation Building
Start with minimal viable implementation:

"Let's start with just creating a simple [CORE_UTILITY] that can [SINGLE_BASIC_FUNCTION]. Let's keep it simple. And we'll add functionality once that's complete."

Example customization:
- [CORE_UTILITY]: "authentication service"
- [SINGLE_BASIC_FUNCTION]: "validate user credentials against a database"

### Stage 3: Incremental Testing & Validation
Verify each component before building the next:

"Show me how to test this with a simple example."
"Run the test and show me the output."
"I want to perform [NUMBER] independent tests: [TEST_SCENARIO_1], [TEST_SCENARIO_2]"

Example customization:
- [NUMBER]: "three"
- [TEST_SCENARIO_1]: "valid user login with correct credentials"
- [TEST_SCENARIO_2]: "invalid user login with wrong password"

### Stage 4: Progressive Feature Addition
Build complexity gradually on proven foundations:

"Now let's expand and add the ability for [EXISTING_SYSTEM] to [NEW_CAPABILITY]. It should [SPECIFIC_REQUIREMENTS]."

Example customization:
- [EXISTING_SYSTEM]: "the authentication service"
- [NEW_CAPABILITY]: "handle role-based access control"
- [SPECIFIC_REQUIREMENTS]: "support multiple user roles with different permission levels"

### Stage 5: Comprehensive Integration
Create unified, production-ready system:

"Now combine all the pieces into one [CLASS_NAME] class that can [COMPLETE_FUNCTIONALITY]. Keep the interface simple."

"Create a comprehensive example that shows the full workflow: [STEP_1], [STEP_2], [STEP_3]."

Example customization:
- [CLASS_NAME]: "AuthenticationManager"
- [COMPLETE_FUNCTIONALITY]: "handle login, role validation, and permission checking"
- [STEP_1]: "User registration"
- [STEP_2]: "User login with role assignment"
- [STEP_3]: "Protected resource access"

### Edge Case Testing Pattern
Proactively test failure scenarios:

"What happens if [EDGE_CASE_SCENARIO]? Show me through test output how the system handles those edge cases."

Example customization:
- [EDGE_CASE_SCENARIO]: "a user tries to access a resource without proper permissions"

### Quality Assurance Checkpoints
- ✅ Each component works in isolation
- ✅ Integration testing passes
- ✅ Edge cases are handled gracefully
- ✅ User interface remains simple
- ✅ Documentation covers all use cases
```

---

## Module 3: Communication Protocols
*[To be added in future lesson]*

```markdown
## Agent Communication

Establish clear communication patterns:
- [COMMUNICATION_PATTERN_1]
- [COMMUNICATION_PATTERN_2]
- [ERROR_HANDLING_PROTOCOL]
- [QUALITY_ASSURANCE_PROCESS]
```

---

## Module 4: Workflow Orchestration
*[To be added in future lesson]*

```markdown
## Workflow Management

Define task assignment and coordination:
- [TASK_ASSIGNMENT_STRATEGY]
- [PROGRESS_TRACKING_METHOD]
- [DECISION_MAKING_PROCESS]
- [HANDOFF_PROCEDURES]
```

---

## Module 5: Quality Assurance
*[To be added in future lesson]*

```markdown
## Quality Control

Implement validation and review processes:
- [VALIDATION_CRITERIA]
- [PEER_REVIEW_PROCESS]
- [TESTING_STRATEGY]
- [ERROR_RECOVERY_PLAN]
```

---

## Customization Guide

### For Web Applications
Replace placeholders with:
- `[PROJECT_TYPE]`: "Full-stack web application"
- `[TECH_STACK_DETAILS]`: "React/Next.js frontend, Node.js API, PostgreSQL database"
- `[ARCHITECTURE_PATTERN]`: "MVC with API-first design"

### For APIs
Replace placeholders with:
- `[PROJECT_TYPE]`: "RESTful API service"
- `[TECH_STACK_DETAILS]`: "Express.js, MongoDB, Redis caching"
- `[ARCHITECTURE_PATTERN]`: "Microservices with domain separation"

### For CLI Tools
Replace placeholders with:
- `[PROJECT_TYPE]`: "Command-line utility"
- `[TECH_STACK_DETAILS]`: "Node.js with commander.js, file system operations"
- `[ARCHITECTURE_PATTERN]`: "Command pattern with plugin architecture"

---

## Usage Instructions

### Step 1: Customize Base Setup
1. Fill in `[PROJECT_NAME]`, `[PROJECT_TYPE]`, and `[TECH_STACK]`
2. Choose relevant modules (use all for comprehensive setup)
3. Replace all placeholders with project-specific details

### Step 2: Activate Relevant Modules
- **Always use**: Module 1 (Context Inheritance)
- **Always use**: Module 2 (Strategic Scoping & Progressive Development)
- **Use when needed**: Other modules based on project complexity

### Step 3: Send to Claude Code
Copy the customized template and paste as your initial project setup prompt.

### Step 4: Validate Setup
After Claude Code creates the structure, run tests to verify:
- Context inheritance is working
- Agent boundaries are correct
- All modules are properly integrated

---

## Template Evolution

As we learn new patterns, add them as modules:

### Adding a New Module
1. Create a new "Module X" section
2. Define the pattern and its prompts
3. Add customization examples
4. Update the usage instructions

### Module Status
- ✅ **Module 1**: Context Inheritance Protocol (Complete)
- ✅ **Module 2**: Strategic Scoping & Progressive Development (Complete)
- 🔄 **Module 3**: Communication Protocols (Planned)
- 🔄 **Module 4**: Workflow Orchestration (Planned)
- 🔄 **Module 5**: Quality Assurance (Planned)

---

## Quick Start Examples

### Simple Web App
```markdown
"I'm starting a new multi-agent development project: Todo App

Project Type: Web application
Tech Stack: Next.js, Supabase, Tailwind CSS
Team Size: 2 AI agents working collaboratively

Please set up Module 1: Context Inheritance Protocol and Module 2: Strategic Scoping & Progressive Development:

Module 1 - Context Inheritance:
- Global: TypeScript, testing, conventional commits
- Project: Next.js 14, Supabase auth, responsive design
- Session: Building task creation feature with drag-and-drop

Module 2 - Progressive Development:
I want to build a todo application with task management and user authentication. Before we code anything, help me break this task down into four or five manageable tasks, so that we can build incrementally and each one is independently testable."
```

### Enterprise API
```markdown
"I'm starting a new multi-agent development project: Customer Management API

Project Type: Enterprise REST API
Tech Stack: Node.js, Express, PostgreSQL, Redis, Docker
Team Size: 4 AI agents working collaboratively

Please set up Module 1: Context Inheritance Protocol and Module 2: Strategic Scoping & Progressive Development:

Module 1 - Context Inheritance:
- Global: Security standards, API versioning, comprehensive testing
- Project: Express.js patterns, PostgreSQL schemas, Redis caching strategies
- Session: Building customer CRUD endpoints with validation

Module 2 - Progressive Development:
I want to build an enterprise customer management API with authentication, CRUD operations, data validation, and caching. Before we code anything, help me break this task down into four or five manageable tasks, so that we can build incrementally and each one is independently testable."
```

This template will grow with our learning and become more powerful with each pattern we master.