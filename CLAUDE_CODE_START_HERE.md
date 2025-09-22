# 🤖 CLAUDE CODE AGENT - START HERE

## **READ THIS FIRST** - Context Bootstrap for New Agents

### **You are starting a Claude Code session for the `claude-multi-agent` project.**

**BEFORE DOING ANYTHING ELSE, read these files in this exact order:**

### **1. IMMEDIATE CONTEXT (Read First)**
```bash
# Get current project status
cat .claude/CURRENT_SESSION_STATUS.md
```

### **2. SESSION PROTOCOLS (Read Second)**
```bash
# Understand how to work in this project
cat .claude/CONTEXT_HANDOFF_TEMPLATE.md
```

### **3. PROJECT OVERVIEW (Read Third)**
```bash
# Understand the overall project and architecture
cat .claude/DEVELOPMENT_CONTEXT.md
```

### **4. DEVELOPMENT PROCESS (Read Fourth)**
```bash
# Understand our professional Git workflow
cat Claude-Code-DevOps-Git-Workflow.md
```

### **5. RECENT HISTORY (Read Fifth)**
```bash
# See what's been happening recently
git log --oneline -10
git status
```

## **CRITICAL INFORMATION**

### **Project Goal**
Creating a Claude multi-agent learning platform that separates the retail product from development workspace.

### **Current Status**
- **60% Complete**: Professional workflow established
- **40% Incomplete**: Product/development separation pending
- **System Status**: Fully functional, safe to continue work

### **Current Priority**
**FOCUS ON PRODUCT/DEVELOPMENT SEPARATION** - the original mission is incomplete.

### **Safety Protocols**
- **Backup Branch**: `architecture-review-backup` available for rollback
- **Working Branch**: Check git status for current branch
- **Dev Server**: Usually runs on localhost:4321-4324

### **Session Start Protocol**
1. **Read all context files above**
2. **Verify system works**: `cd projects/learning-lab-astro && npm run dev`
3. **Create session start commit** (see template in CONTEXT_HANDOFF_TEMPLATE.md)
4. **Begin work with clear understanding of current state**

---

## **DO NOT SKIP THIS CONTEXT SETUP**
The user expects you to understand the full context before beginning work. This project has established professional development practices that must be followed.

**After reading these files, you will understand:**
- What has been accomplished and what remains
- How to work professionally within this project
- The Git workflow and safety protocols to follow
- The specific focus for your session

**File Location**: You are currently in the root directory of the project. All context files are relative to this location.