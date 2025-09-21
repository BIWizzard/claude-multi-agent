/**
 * Complete Multi-Agent Context Management Workflow Demonstration
 *
 * This demo shows the full workflow of how different agents (coordinator vs executor)
 * interact with the same project documentation but see only what's relevant to them.
 *
 * Exercise 1 - Section 4: Complete Context Management Workflow
 */

const ContextManager = require('./src/context-manager.js');

function displaySection(section, index, prefix = '') {
  const indent = '  '.repeat(Math.max(0, section.level - 1));
  const roleText = section.roles ? `[${section.roles.join(', ')}]` : '';

  if (section.isFileSeparator) {
    console.log(`${prefix}${index + 1}. 📁 ${section.title}`);
  } else {
    console.log(`${prefix}${index + 1}. ${indent}${section.title} ${roleText}`);

    // Show content preview for important sections
    if (section.content && section.content.trim()) {
      const preview = section.content.trim().replace(/\n+/g, ' ').substring(0, 80);
      console.log(`${prefix}    ${preview}${preview.length >= 80 ? '...' : ''}`);
    }
  }
}

async function demonstrateFullWorkflow() {
  console.log('=== Multi-Agent Context Management: Complete Workflow Demo ===\n');

  // ============================================================================
  // STEP 1: Initialize Context Manager
  // ============================================================================

  console.log('🚀 STEP 1: Initialize Context Management System');
  console.log('===============================================');

  const contextManager = new ContextManager({
    cacheMaxAge: 300000, // 5 minutes cache
    verboseLogging: true
  });

  console.log('✅ ContextManager ready for multi-agent operations\n');

  // ============================================================================
  // STEP 2: Load Project Context
  // ============================================================================

  console.log('📂 STEP 2: Load Complete Project Context');
  console.log('=========================================');

  console.log('Loading all project documentation...');
  const projectFiles = await contextManager.loadDirectory('./test-docs');
  const unifiedContext = contextManager.mergeContext(projectFiles);

  console.log(`📊 Project Context Loaded:`);
  console.log(`   Files processed: ${projectFiles.length}`);
  console.log(`   Total sections: ${unifiedContext.length}`);
  console.log(`   Content analysis: ${contextManager.analyzeContent(unifiedContext).total} sections parsed\n`);

  // ============================================================================
  // STEP 3: Multi-Agent Context Analysis
  // ============================================================================

  console.log('🔍 STEP 3: Analyze Context for Multi-Agent Distribution');
  console.log('=======================================================');

  const analysis = contextManager.analyzeContent(unifiedContext);

  console.log('📈 Content Distribution Analysis:');
  console.log(`   👥 Coordinator-specific: ${analysis.coordinator} sections (${analysis.percentageCoordinator}%)`);
  console.log(`   ⚙️ Executor-specific: ${analysis.executor} sections (${analysis.percentageExecutor}%)`);
  console.log(`   🤝 Shared content: ${analysis.shared} sections (${analysis.percentageShared}%)`);
  console.log(`   🔓 Public content: ${analysis.unmarked} sections (${analysis.percentageUnmarked}%)\n`);

  // ============================================================================
  // STEP 4: COORDINATOR AGENT WORKFLOW
  // ============================================================================

  console.log('👥 STEP 4: COORDINATOR AGENT WORKFLOW');
  console.log('=====================================');
  console.log('Simulating coordinator agent accessing project context...\n');

  console.log('🔎 Coordinator filters context for strategic/management view:');
  const coordinatorContext = contextManager.getCoordinatorContext(unifiedContext);

  console.log(`📋 COORDINATOR SEES: ${coordinatorContext.length} relevant sections\n`);
  console.log('┌─ Coordinator-Specific Content ─────────────────────────────────────┐');

  coordinatorContext.slice(0, 10).forEach((section, i) => {
    displaySection(section, i, '│ ');
  });

  if (coordinatorContext.length > 10) {
    console.log(`│ ... and ${coordinatorContext.length - 10} more coordinator sections`);
  }
  console.log('└─────────────────────────────────────────────────────────────────────┘\n');

  console.log('💼 Coordinator Focus Areas:');
  const coordinatorSample = coordinatorContext.slice(0, 5).filter(s => !s.isFileSeparator);
  coordinatorSample.forEach((section, i) => {
    console.log(`   ${i + 1}. ${section.title} - Strategic/management level content`);
  });

  console.log('\n🚫 COORDINATOR CANNOT SEE:');
  const coordinatorCannotSee = unifiedContext.filter(section =>
    !section.isFileSeparator &&
    (!section.roles || !section.roles.includes('coordinator'))
  );
  console.log(`   ${coordinatorCannotSee.length} sections are hidden from coordinator view:`);
  coordinatorCannotSee.slice(0, 5).forEach((section, i) => {
    const roleText = section.roles ? `[${section.roles.join(', ')}]` : '[unmarked]';
    console.log(`   ❌ ${section.title} ${roleText}`);
  });
  if (coordinatorCannotSee.length > 5) {
    console.log(`   ❌ ... and ${coordinatorCannotSee.length - 5} more hidden sections`);
  }

  // ============================================================================
  // STEP 5: EXECUTOR AGENT WORKFLOW
  // ============================================================================

  console.log('\n\n⚙️ STEP 5: EXECUTOR AGENT WORKFLOW');
  console.log('==================================');
  console.log('Simulating executor agent accessing project context...\n');

  console.log('🔧 Executor filters context for technical/implementation view:');
  const executorContext = contextManager.getExecutorContext(unifiedContext);

  console.log(`🛠️ EXECUTOR SEES: ${executorContext.length} relevant sections\n`);
  console.log('┌─ Executor-Specific Content ────────────────────────────────────────┐');

  executorContext.slice(0, 10).forEach((section, i) => {
    displaySection(section, i, '│ ');
  });

  if (executorContext.length > 10) {
    console.log(`│ ... and ${executorContext.length - 10} more executor sections`);
  }
  console.log('└─────────────────────────────────────────────────────────────────────┘\n');

  console.log('⚡ Executor Focus Areas:');
  const executorSample = executorContext.slice(0, 5).filter(s => !s.isFileSeparator);
  executorSample.forEach((section, i) => {
    console.log(`   ${i + 1}. ${section.title} - Technical/implementation details`);
  });

  console.log('\n🚫 EXECUTOR CANNOT SEE:');
  const executorCannotSee = unifiedContext.filter(section =>
    !section.isFileSeparator &&
    (!section.roles || !section.roles.includes('executor'))
  );
  console.log(`   ${executorCannotSee.length} sections are hidden from executor view:`);
  executorCannotSee.slice(0, 5).forEach((section, i) => {
    const roleText = section.roles ? `[${section.roles.join(', ')}]` : '[unmarked]';
    console.log(`   ❌ ${section.title} ${roleText}`);
  });
  if (executorCannotSee.length > 5) {
    console.log(`   ❌ ... and ${executorCannotSee.length - 5} more hidden sections`);
  }

  // ============================================================================
  // STEP 6: COLLABORATION POINTS
  // ============================================================================

  console.log('\n\n🤝 STEP 6: COLLABORATION BETWEEN AGENTS');
  console.log('========================================');

  const sharedContext = contextManager.getSharedContext(unifiedContext);
  console.log(`Both agents can collaborate on ${sharedContext.length} shared sections:\n`);

  console.log('🔄 SHARED COORDINATION POINTS:');
  sharedContext.forEach((section, i) => {
    if (!section.isFileSeparator) {
      console.log(`   ${i + 1}. ${section.title} - Both roles need this for coordination`);
    }
  });

  // ============================================================================
  // STEP 7: WORKFLOW COMPARISON
  // ============================================================================

  console.log('\n\n📊 STEP 7: SIDE-BY-SIDE COMPARISON');
  console.log('==================================');

  console.log('┌─ COORDINATOR VIEW ─────────────┬─ EXECUTOR VIEW ─────────────────┐');
  console.log('│ Strategic & Management Focus   │ Technical & Implementation Focus │');
  console.log('├─────────────────────────────────┼─────────────────────────────────┤');

  const maxRows = Math.max(coordinatorSample.length, executorSample.length);
  for (let i = 0; i < maxRows; i++) {
    const coordSection = coordinatorSample[i];
    const execSection = executorSample[i];

    const coordText = coordSection ? coordSection.title.substring(0, 30) : '';
    const execText = execSection ? execSection.title.substring(0, 30) : '';

    console.log(`│ ${coordText.padEnd(31)} │ ${execText.padEnd(31)} │`);
  }
  console.log('└─────────────────────────────────┴─────────────────────────────────┘');

  // ============================================================================
  // STEP 8: PRACTICAL IMPACT
  // ============================================================================

  console.log('\n\n💡 STEP 8: PRACTICAL IMPACT OF ROLE-BASED FILTERING');
  console.log('===================================================');

  const coordinatorOnly = coordinatorContext.length - sharedContext.length;
  const executorOnly = executorContext.length - sharedContext.length;

  console.log('🎯 Context Isolation Results:');
  console.log(`   👥 Coordinator gets ${coordinatorOnly} unique + ${sharedContext.length} shared = ${coordinatorContext.length} total sections`);
  console.log(`   ⚙️ Executor gets ${executorOnly} unique + ${sharedContext.length} shared = ${executorContext.length} total sections`);
  console.log(`   🔄 ${sharedContext.length} collaboration points maintain team coordination`);

  const coordinatorFocus = Math.round((coordinatorOnly / unifiedContext.length) * 100);
  const executorFocus = Math.round((executorOnly / unifiedContext.length) * 100);
  const sharedFocus = Math.round((sharedContext.length / unifiedContext.length) * 100);

  console.log(`\n📈 Efficiency Gains:`);
  console.log(`   👥 Coordinator focuses on ${coordinatorFocus}% of total content (strategic relevance)`);
  console.log(`   ⚙️ Executor focuses on ${executorFocus}% of total content (technical relevance)`);
  console.log(`   🤝 ${sharedFocus}% reserved for essential collaboration`);
  console.log(`   🎯 Each agent filters out ${100 - Math.round(((coordinatorContext.length + executorContext.length - sharedContext.length) / 2 / unifiedContext.length) * 100)}% of irrelevant content`);

  console.log('\n🏆 WORKFLOW COMPLETE!');
  console.log('=====================');
  console.log('✅ Context loaded from multiple files');
  console.log('✅ Role-based filtering applied successfully');
  console.log('✅ Agents see only relevant content');
  console.log('✅ Collaboration points maintained');
  console.log('✅ Multi-agent context management working perfectly!');
}

demonstrateFullWorkflow().catch(console.error);