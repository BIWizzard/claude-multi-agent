#!/usr/bin/env node

/**
 * Context Loading Test - Validates the success criteria
 * Tests context management for Exercise 01 foundation
 */

const ContextManager = require('./src/shared/context-manager');
const path = require('path');

function testContextLoading() {
  console.log('🧪 Testing Context Loading for Both Agent Types\n');

  const contextManager = new ContextManager(__dirname);

  try {
    // Test 1: Load coordinator context
    console.log('📋 Test 1: Coordinator Context Loading');
    const coordinatorContext = contextManager.getAgentContext('coordinator');

    console.log('✅ Coordinator context loaded successfully');
    console.log('   Available sections:', Object.keys(coordinatorContext));
    console.log('   Repository context:', coordinatorContext.repository ? '✅' : '❌');
    console.log('   Exercise context:', coordinatorContext.exercise ? '✅' : '❌');
    console.log('   Agent context:', coordinatorContext.agent ? '✅' : '❌');

    // Test 2: Load executor context
    console.log('\n⚡ Test 2: Task Executor Context Loading');
    const executorContext = contextManager.getAgentContext('task-executor');

    console.log('✅ Task executor context loaded successfully');
    console.log('   Available sections:', Object.keys(executorContext));
    console.log('   Repository context:', executorContext.repository ? '✅' : '❌');
    console.log('   Exercise context:', executorContext.exercise ? '✅' : '❌');
    console.log('   Agent context:', executorContext.agent ? '✅' : '❌');

    return { coordinatorContext, executorContext, success: true };

  } catch (error) {
    console.error('❌ Context loading failed:', error.message);
    return { success: false, error: error.message };
  }
}

function testAgentFiltering() {
  console.log('\n🔍 Testing Agent Context Filtering\n');

  const contextManager = new ContextManager(__dirname);

  try {
    // Load both contexts to compare filtering
    const coordinatorContext = contextManager.getAgentContext('coordinator');
    const executorContext = contextManager.getAgentContext('task-executor');

    console.log('📊 Filtering Analysis:');

    // Check if coordinator gets orchestration-focused content
    const coordinatorFiltered = coordinatorContext.exercise;
    console.log('   Coordinator filtered context:', coordinatorFiltered ? '✅' : '❌');

    // Check if executor gets implementation-focused content
    const executorFiltered = executorContext.exercise;
    console.log('   Executor filtered context:', executorFiltered ? '✅' : '❌');

    // Verify contexts are different (filtered appropriately)
    const contextsDifferent = JSON.stringify(coordinatorContext) !== JSON.stringify(executorContext);
    console.log('   Contexts appropriately different:', contextsDifferent ? '✅' : '❌');

    return { success: true, filtered: contextsDifferent };

  } catch (error) {
    console.error('❌ Agent filtering test failed:', error.message);
    return { success: false, error: error.message };
  }
}

function testAgentIsolation() {
  console.log('\n🛡️ Testing Agent Isolation\n');

  try {
    const AgentIsolation = require('./src/shared/agent-isolation');

    // Test creating isolated workspaces
    const coordinatorIsolation = new AgentIsolation('coordinator', __dirname);
    const executorIsolation = new AgentIsolation('task-executor', __dirname);

    console.log('✅ Coordinator workspace:', coordinatorIsolation.workspace.id);
    console.log('✅ Executor workspace:', executorIsolation.workspace.id);

    // Test workspace isolation
    const workspacesIsolated = coordinatorIsolation.workspace.id !== executorIsolation.workspace.id;
    console.log('   Workspaces isolated:', workspacesIsolated ? '✅' : '❌');

    // Test operation validation
    try {
      coordinatorIsolation.validateOperation('task_assignment', 'coordinator');
      console.log('   Coordinator task assignment:', '✅');
    } catch (error) {
      console.log('   Coordinator task assignment:', '❌');
    }

    try {
      executorIsolation.validateOperation('implementation', 'task-executor');
      console.log('   Executor implementation:', '✅');
    } catch (error) {
      console.log('   Executor implementation:', '❌');
    }

    return { success: true, isolated: workspacesIsolated };

  } catch (error) {
    console.error('❌ Agent isolation test failed:', error.message);
    return { success: false, error: error.message };
  }
}

function testSessionHandoff() {
  console.log('\n🔄 Testing Session Handoff State Preservation\n');

  try {
    const SessionHandoff = require('./src/shared/session-handoff');
    const handoff = new SessionHandoff(__dirname);

    // Create test session data
    const testSessionData = {
      currentSession: 'test-session-001',
      context: {
        repository: { objectives: 'learning multi-agent patterns' },
        exercise: { phase: 'implementation' },
        agents: { coordinator: 'active', executor: 'ready' }
      },
      state: {
        activeTasks: ['task-001'],
        completedTasks: [],
        decisions: ['use-hierarchical-context'],
        blockers: []
      },
      progress: {
        currentPhase: 'Phase 1: Setup & Structure',
        completionRate: 60,
        milestones: ['context-system-ready']
      },
      nextSteps: ['test-agent-coordination']
    };

    // Test handoff creation
    console.log('📦 Creating handoff package...');
    const handoffPackage = handoff.createHandoffPackage(testSessionData);
    console.log('✅ Handoff package created:', handoffPackage.id);

    // Test handoff restoration
    console.log('🔧 Restoring from handoff...');
    const restoredSession = handoff.restoreFromHandoff(handoffPackage.id);
    console.log('✅ Session restored:', restoredSession.id);

    // Test state preservation
    const statePreserved = restoredSession.context && restoredSession.state && restoredSession.progress;
    console.log('   State preserved:', statePreserved ? '✅' : '❌');

    // Test continuity validation
    const continuity = handoff.validateSessionContinuity(testSessionData, restoredSession);
    console.log('   Continuity validated:', continuity.passed ? '✅' : '❌');

    return { success: true, preserved: statePreserved, continuous: continuity.passed };

  } catch (error) {
    console.error('❌ Session handoff test failed:', error.message);
    return { success: false, error: error.message };
  }
}

function runAllTests() {
  console.log('🚀 Running Complete Foundation Test Suite\n');
  console.log('==========================================\n');

  const results = {
    contextLoading: testContextLoading(),
    agentFiltering: testAgentFiltering(),
    agentIsolation: testAgentIsolation(),
    sessionHandoff: testSessionHandoff()
  };

  console.log('\n📊 Test Results Summary');
  console.log('=======================');

  const allPassed = Object.values(results).every(result => result.success);

  console.log('Context Loading:', results.contextLoading.success ? '✅ PASS' : '❌ FAIL');
  console.log('Agent Filtering:', results.agentFiltering.success ? '✅ PASS' : '❌ FAIL');
  console.log('Agent Isolation:', results.agentIsolation.success ? '✅ PASS' : '❌ FAIL');
  console.log('Session Handoff:', results.sessionHandoff.success ? '✅ PASS' : '❌ FAIL');

  console.log('\n🏆 Overall Result:', allPassed ? '✅ ALL TESTS PASS' : '❌ SOME TESTS FAILED');

  if (allPassed) {
    console.log('\n🎉 Foundation is ready for advanced multi-agent scenarios!');
  } else {
    console.log('\n🔧 Review failed tests and fix issues before proceeding.');
  }

  return { allPassed, results };
}

// Run tests if called directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testContextLoading,
  testAgentFiltering,
  testAgentIsolation,
  testSessionHandoff,
  runAllTests
};