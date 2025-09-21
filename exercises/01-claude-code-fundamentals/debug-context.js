#!/usr/bin/env node

/**
 * Debug Context Loading - See what sections are actually parsed
 */

const ContextManager = require('./src/shared/context-manager');

function debugContext() {
  console.log('🔍 Debugging Context Loading\n');

  const contextManager = new ContextManager(__dirname);

  try {
    // Load raw context
    const rawExerciseContext = contextManager.loadExerciseContext();
    console.log('📄 Raw Exercise Context Length:', rawExerciseContext ? rawExerciseContext.length : 'null');

    // Parse sections
    const sections = contextManager.parseMarkdownSections(rawExerciseContext);
    console.log('\n📊 Parsed Sections:');
    Object.keys(sections).forEach(key => {
      console.log(`   - ${key}`);
    });

    // Check validation requirements
    console.log('\n🎯 Required Fields for Coordinator:');
    console.log('   - objectives');
    console.log('   - current_phase');
    console.log('   - success_criteria');

    console.log('\n✅ Available in Parsed Sections:');
    console.log('   - objectives:', sections.objectives ? '✅' : '❌');
    console.log('   - current_phase:', sections.current_phase ? '✅' : '❌');
    console.log('   - success_criteria:', sections.success_criteria ? '✅' : '❌');

    // Test filtering
    console.log('\n🔧 Testing Agent Filtering...');
    const filtered = contextManager.filterForAgent(rawExerciseContext, 'coordinator');
    console.log('   Filtered sections:', Object.keys(filtered));

    // Test full context loading
    console.log('\n📦 Testing Full Context Structure...');
    try {
      const fullContext = contextManager.getAgentContext('coordinator');
      console.log('   Context structure keys:', Object.keys(fullContext));
      console.log('   Exercise context keys:', Object.keys(fullContext.exercise || {}));

      // Check if fields exist in nested structure
      console.log('\n🔍 Field Search in Full Context:');
      console.log('   objectives found:', contextManager.contextContainsField(fullContext, 'objectives') ? '✅' : '❌');
      console.log('   current_phase found:', contextManager.contextContainsField(fullContext, 'current_phase') ? '✅' : '❌');
      console.log('   success_criteria found:', contextManager.contextContainsField(fullContext, 'success_criteria') ? '✅' : '❌');

    } catch (error) {
      console.error('   Full context loading failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

if (require.main === module) {
  debugContext();
}