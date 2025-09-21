# Strategic Scoping & Progressive Development: Prompting Patterns

## Overview

This document contains the specific prompting patterns that proved effective for breaking down complex tasks, testing incrementally, and building progressively. These patterns are extracted from successful AI-human collaboration on multi-agent context management systems.

## Core Prompting Philosophy

**Principle**: Be specific about what you want, how you want to build it, and how you'll know it works.

**Anti-Pattern**: Vague requests that lead to over-engineering or misaligned results.

## Category 1: Strategic Decomposition Patterns

### Pattern: Complex Goal Breakdown
**Purpose**: Transform overwhelming projects into manageable components

**Template**:
```
"I want to build [complex system description]. Before we code anything, help me break this task down into four or five manageable tasks, so that we can build incrementally and each one is independently testable."
```

**Real Example**:
```
"I want to build a context management system for multi-agent multi-agentic coding projects. Before we code anything, help me break this task down into four or five manageable tasks, so that we can build incrementally and each one is independently testable."
```

**Why It Works**:
- ✅ Sets expectation for incremental approach
- ✅ Requests specific number of components (4-5)
- ✅ Emphasizes independent testability
- ✅ Prevents overwhelming scope

**What Not to Say**:
❌ "How should I build this system?"
❌ "What's the best approach for this project?"
❌ "Build a context management system"

### Pattern: Scope Clarification
**Purpose**: Ensure understanding of context and constraints

**Template**:
```
"To clarify, we're working on [specific context/section] of [larger project]. The [components/utilities/documentation] we're creating need to be encapsulated within [specific location], following the existing structure."
```

**Real Example**:
```
"I forgot to mention what we are doing right now is exercises in Section 4 of Exercise 1 in the Learning Lab. The files and utilities and documentation we are creating as we create this context management system need to be encapsulated within Exercise 1, following the existing structure."
```

**Why It Works**:
- ✅ Provides necessary context constraints
- ✅ Clarifies scope boundaries
- ✅ Ensures work fits within existing structure
- ✅ Prevents scope creep

## Category 2: Foundation Building Patterns

### Pattern: Minimal Viable Start
**Purpose**: Begin with simplest possible working version

**Template**:
```
"Let's start with just creating a simple [core utility] that can [single basic function]. Let's keep it simple. And we'll add functionality once that's complete."
```

**Real Example**:
```
"Can we start with just creating a simple file reading utility that can ingest a Markdown file, break it down into sections? Let's keep it simple. And we'll add functionality once that's complete."
```

**Why It Works**:
- ✅ Explicitly requests simplicity
- ✅ Focuses on one core function
- ✅ Promises future expansion
- ✅ Prevents over-engineering

**What Not to Say**:
❌ "Build a complete file management system"
❌ "Create something that handles all possible use cases"
❌ "Make it production-ready from the start"

### Pattern: Progressive Feature Addition
**Purpose**: Add complexity gradually to working foundation

**Template**:
```
"Now let's expand and code the ability for [existing system] to [new capability]. It should be able to [specific new function] with [specific requirements]."
```

**Real Example**:
```
"Now let's expand and code the ability for the reader to handle multiple files in a directory. It should be able to read multiple files and merge them, combining their content with a clear structure."
```

**Why It Works**:
- ✅ References existing working system
- ✅ Adds one new capability at a time
- ✅ Provides specific requirements
- ✅ Maintains incremental approach

## Category 3: Testing & Validation Patterns

### Pattern: Immediate Testing Request
**Purpose**: Verify functionality with concrete examples

**Template**:
```
"Show me how to test this with a simple example file."
"Run the test and show me the output."
```

**Real Example**:
```
"Show me how to test this with a simple example file."
"Run the test and show me the output."
```

**Why It Works**:
- ✅ Requests concrete demonstration
- ✅ Asks for actual execution
- ✅ Provides immediate feedback
- ✅ Validates assumptions

### Pattern: Specific Test Scenario Requests
**Purpose**: Test particular behaviors and edge cases

**Template**:
```
"I want to perform [number] more independent tests:
1. [specific scenario] and make sure we get [expected behavior]
2. [specific edge case] and then create a test specifically [for validation]"
```

**Real Example**:
```
"I want to perform two more independent tests:
1. I'd like to test this with five files and make sure we get the same behavior and success metrics.
2. I want to ensure we've got built-in missing file handling and then create a test specifically. We want the missing file handling to provide friendly prompts when missing files are identified."
```

**Why It Works**:
- ✅ Requests specific number of tests
- ✅ Defines exact scenarios to test
- ✅ Sets clear success criteria
- ✅ Covers both success and failure cases

### Pattern: Output Verification
**Purpose**: Distinguish between expected and actual behavior

**Template**:
```
"Was that summary the result of running the test, or was that just showing expected behavior? I'm wanting to make sure we're testing it and I'm seeing what each [component] sees after the output of the test."
```

**Real Example**:
```
"Was that summary the result of running the test, or was that just showing expected behavior? I'm wanting to make sure we're testing it and I'm seeing what each sees after the output of the test."
```

**Why It Works**:
- ✅ Distinguishes between theory and practice
- ✅ Requests actual test evidence
- ✅ Ensures real validation
- ✅ Prevents assumption-based development

### Pattern: Edge Case Exploration
**Purpose**: Proactively test failure scenarios

**Template**:
```
"What happens if [specific edge case]? Show me through test output how the system handles those edge cases."
```

**Real Example**:
```
"What happens if a section isn't marked for either role or a section needs to be viewed by both roles? Show me through test output how the system handles those edge cases."
```

**Why It Works**:
- ✅ Identifies specific failure scenarios
- ✅ Requests demonstrated behavior
- ✅ Uses test output for validation
- ✅ Prevents production surprises

## Category 4: Progressive Integration Patterns

### Pattern: Feature Combination
**Purpose**: Merge components into unified system

**Template**:
```
"Now combine all the pieces into one [ClassName] class that can [complete functionality]. Keep the interface simple."
```

**Real Example**:
```
"Now combine all the pieces into one ContextManager class that can load files, cache them, filter by role and handle errors gracefully. Keep the interface simple."
```

**Why It Works**:
- ✅ Requests unified integration
- ✅ Emphasizes simple interface
- ✅ Lists complete functionality
- ✅ Maintains usability focus

### Pattern: Comprehensive Workflow Demonstration
**Purpose**: Validate complete system functionality

**Template**:
```
"Create a comprehensive example that shows the full workflow:
1. [step 1]
2. [step 2]
3. [step 3]
Demonstrate that they see different content."
```

**Real Example**:
```
"Now, create a comprehensive example that shows the full workflow:
1. Loading context
2. Filtering for a coordinator
3. Filtering for an executor
Demonstrate that they see different content."
```

**Why It Works**:
- ✅ Requests end-to-end demonstration
- ✅ Specifies exact workflow steps
- ✅ Asks for concrete differences
- ✅ Validates complete functionality

## Category 5: Documentation & User Experience Patterns

### Pattern: User-Friendly Documentation Request
**Purpose**: Create accessible guides for non-technical users

**Template**:
```
"Add comments explaining how someone would [use the system]. Make it simple for non-technical users."
```

**Real Example**:
```
"Add comments explaining how someone would mark their content for role-based filtering. Make it simple for non-technical users."
```

**Why It Works**:
- ✅ Focuses on user experience
- ✅ Targets non-technical audience
- ✅ Requests clear explanations
- ✅ Emphasizes accessibility

### Pattern: Pattern Documentation Request
**Purpose**: Capture lessons learned for future use

**Template**:
```
"Based on our experience building [system], help me create [documentation type] that documents the [specific patterns] we used: [pattern 1], [pattern 2], [pattern 3]. What would you tell someone else about [effective collaboration approach]?"
```

**Real Example**:
```
"Based on our experience building the context management system, help me create 'Module 2: Strategic Scoping & Progressive Development' for our multi-agent project template. Document the specific prompting patterns we used for breaking down complex tasks, testing incrementally, and building progressively."
```

**Why It Works**:
- ✅ References successful experience
- ✅ Requests pattern extraction
- ✅ Focuses on reusable knowledge
- ✅ Aims for future application

## Anti-Patterns: What Not to Do

### Vague Requests
❌ "Build this system"
❌ "Make it work better"
❌ "Add more features"
❌ "Test everything"

### Over-Ambitious Scope
❌ "Create a complete enterprise solution"
❌ "Handle all possible use cases"
❌ "Build it production-ready from day one"
❌ "Make it perfect"

### Assumption-Based Development
❌ "This should work correctly"
❌ "The system probably handles this"
❌ "I assume the output will be..."
❌ "It should be obvious how to use"

### All-at-Once Requests
❌ "Add caching, filtering, and error handling"
❌ "Build all the features we discussed"
❌ "Create the complete system now"
❌ "Implement everything at once"

## Success Indicators

### Good Prompting Results In:
- ✅ Clear, manageable components
- ✅ Immediate testability
- ✅ Concrete demonstrations
- ✅ Working code at each step
- ✅ User-friendly interfaces
- ✅ Comprehensive documentation

### Poor Prompting Results In:
- ❌ Overwhelming complexity
- ❌ Untestable components
- ❌ Theoretical explanations
- ❌ Broken intermediate states
- ❌ Technical-only interfaces
- ❌ Missing documentation

## Application Guidelines

### When Starting a New Project:
1. Use **Complex Goal Breakdown** pattern
2. Follow with **Minimal Viable Start** pattern
3. Apply **Immediate Testing Request** pattern

### During Development:
1. Use **Progressive Feature Addition** pattern
2. Apply **Specific Test Scenario Requests** pattern
3. Use **Output Verification** pattern regularly

### When Integrating:
1. Apply **Feature Combination** pattern
2. Use **Comprehensive Workflow Demonstration** pattern
3. Finish with **User-Friendly Documentation Request** pattern

### Throughout Process:
1. Use **Edge Case Exploration** pattern proactively
2. Apply **Output Verification** pattern frequently
3. Avoid all anti-patterns consistently

These patterns transform complex projects into manageable, successful implementations through strategic scoping and progressive development.