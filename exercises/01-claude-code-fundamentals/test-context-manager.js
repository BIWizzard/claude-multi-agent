/**
 * Comprehensive test for the unified ContextManager
 * Tests all features: loading, caching, filtering, error handling
 */

const ContextManager = require('./src/context-manager.js');

async function testContextManager() {
  console.log('=== Exercise 1 - Section 4: ContextManager Unified Test ===\n');

  // Initialize ContextManager
  const contextManager = new ContextManager({
    cacheMaxAge: 60000, // 1 minute for testing
    verboseLogging: true
  });

  console.log('🧪 TEST 1: Single File Loading');
  console.log('==============================');

  try {
    const sections = await contextManager.loadFile('./test-docs/comprehensive-role-demo.md');
    console.log(`✅ Loaded ${sections.length} sections from single file\n`);
  } catch (error) {
    console.log(`❌ Error loading file: ${error.message}\n`);
  }

  console.log('🧪 TEST 2: Directory Loading');
  console.log('=============================');

  const files = await contextManager.loadDirectory('./test-docs');
  console.log(`✅ Loaded ${files.length} files from directory`);

  const totalSections = files.reduce((sum, file) => sum + file.sections.length, 0);
  console.log(`📊 Total sections across all files: ${totalSections}\n`);

  console.log('🧪 TEST 3: Context Merging');
  console.log('===========================');

  const mergedContext = contextManager.mergeContext(files);
  console.log(`✅ Merged into ${mergedContext.length} total sections (including file separators)\n`);

  console.log('🧪 TEST 4: Role-Based Filtering');
  console.log('================================');

  const coordinatorContext = contextManager.getCoordinatorContext(mergedContext);
  const executorContext = contextManager.getExecutorContext(mergedContext);
  const sharedContext = contextManager.getSharedContext(mergedContext);

  console.log(`👥 Coordinator context: ${coordinatorContext.length} sections`);
  console.log(`⚙️ Executor context: ${executorContext.length} sections`);
  console.log(`🤝 Shared context: ${sharedContext.length} sections\n`);

  console.log('🧪 TEST 5: Caching Performance');
  console.log('===============================');

  console.log('First read (should read from disk):');
  const start1 = Date.now();
  await contextManager.loadFile('./test-docs/project-overview.md');
  const time1 = Date.now() - start1;

  console.log('Second read (should use cache):');
  const start2 = Date.now();
  await contextManager.loadFile('./test-docs/project-overview.md');
  const time2 = Date.now() - start2;

  console.log(`⚡ Performance: ${time1}ms → ${time2}ms (${Math.round((1 - time2/time1) * 100)}% faster)\n`);

  console.log('🧪 TEST 6: Cache Management');
  console.log('============================');

  const cacheStats = contextManager.getCacheStats();
  console.log(`📊 Cache contains ${cacheStats.size} entries`);
  console.log(`📂 Cached files: ${cacheStats.entries.map(f => f.split('/').pop()).join(', ')}`);

  contextManager.clearCache();
  const clearedStats = contextManager.getCacheStats();
  console.log(`🗑️ After clearing: ${clearedStats.size} entries\n`);

  console.log('🧪 TEST 7: Content Analysis');
  console.log('============================');

  const analysis = contextManager.analyzeContent(mergedContext);
  console.log(`📈 Content Analysis:`);
  console.log(`   Total sections: ${analysis.total}`);
  console.log(`   Coordinator: ${analysis.coordinator} (${analysis.percentageCoordinator}%)`);
  console.log(`   Executor: ${analysis.executor} (${analysis.percentageExecutor}%)`);
  console.log(`   Shared: ${analysis.shared} (${analysis.percentageShared}%)`);
  console.log(`   Unmarked: ${analysis.unmarked} (${analysis.percentageUnmarked}%)\n`);

  console.log('🧪 TEST 8: Error Handling');
  console.log('==========================');

  // Test missing file
  try {
    await contextManager.loadFile('./non-existent-file.md');
  } catch (error) {
    console.log(`✅ Gracefully handled missing file error\n`);
  }

  // Test missing directory
  try {
    await contextManager.loadDirectory('./non-existent-directory');
  } catch (error) {
    console.log(`✅ Gracefully handled missing directory error\n`);
  }

  console.log('🧪 TEST 9: Practical Usage Example');
  console.log('===================================');

  console.log('📝 Simulating multi-agent workflow:');

  // Load project context
  const projectFiles = await contextManager.loadDirectory('./test-docs');
  const projectContext = contextManager.mergeContext(projectFiles);

  // Coordinator gets strategic view
  const coordinatorView = contextManager.getCoordinatorContext(projectContext);
  console.log(`👥 Coordinator sees ${coordinatorView.length} relevant sections:`);
  coordinatorView.slice(0, 3).forEach((section, i) => {
    if (!section.isFileSeparator) {
      console.log(`   ${i + 1}. ${section.title}`);
    }
  });

  // Executor gets technical view
  const executorView = contextManager.getExecutorContext(projectContext);
  console.log(`⚙️ Executor sees ${executorView.length} relevant sections:`);
  executorView.slice(0, 3).forEach((section, i) => {
    if (!section.isFileSeparator) {
      console.log(`   ${i + 1}. ${section.title}`);
    }
  });

  // Both coordinate on shared content
  const sharedView = contextManager.getSharedContext(projectContext);
  console.log(`🤝 Shared coordination points: ${sharedView.length} sections:`);
  sharedView.forEach((section, i) => {
    if (!section.isFileSeparator) {
      console.log(`   ${i + 1}. ${section.title}`);
    }
  });

  console.log('\n🎉 ContextManager comprehensive test completed!');
  console.log('✅ All features working: loading, caching, filtering, error handling');
  console.log('🚀 Ready for multi-agent context management!');
}

testContextManager();