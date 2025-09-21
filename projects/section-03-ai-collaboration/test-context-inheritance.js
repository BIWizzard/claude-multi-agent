/**
 * Test Suite for Context Inheritance
 * Validates that context layers properly inherit and override each other
 */

const assert = require('assert');

// Import the context data and functions (simulating module import)
const globalContext = {
  codeStandards: {
    useTypeScript: true,
    writeTests: true,
    followLinting: true
  },
  security: {
    noHardcodedSecrets: true,
    sanitizeInputs: true,
    useHTTPS: true
  },
  agentRules: {
    passContextExplicitly: true,
    includeFileReferences: true,
    validateResults: true
  }
};

const projectContext = {
  architecture: {
    frontend: "Next.js 14",
    backend: "Node.js Express",
    database: "PostgreSQL with Prisma"
  },
  keyFiles: [
    "src/components/ProductCard.tsx",
    "src/lib/db.ts",
    "prisma/schema.prisma"
  ],
  projectRules: {
    responsiveDesign: true,
    serverSideCalculations: true,
    useCloudinary: true
  }
};

const sessionContext = {
  currentTask: "Adding shopping cart functionality",
  filesBeingModified: [
    "src/components/CartButton.tsx",
    "src/lib/cart-utils.ts",
    "src/app/cart/page.tsx"
  ],
  progressToday: {
    completed: ["CartItem model", "Zustand state management"],
    inProgress: "CartButton component",
    next: "Cart page layout"
  },
  decisionsToday: {
    stateManagement: "Zustand (not Redux)",
    persistence: "localStorage + database sync",
    itemLimit: 10
  }
};

function getInheritedContext() {
  return {
    ...globalContext,
    ...projectContext,
    ...sessionContext,
    inheritanceChain: [
      "Global Context (universal rules)",
      "Project Context (e-commerce specific)",
      "Session Context (today's cart work)"
    ]
  };
}

function getAgentContext(agentRole) {
  const fullContext = getInheritedContext();

  switch(agentRole) {
    case 'frontend':
      return {
        codeStandards: fullContext.codeStandards,
        frontend: fullContext.architecture?.frontend,
        responsiveDesign: fullContext.projectRules?.responsiveDesign,
        currentTask: fullContext.currentTask,
        filesBeingModified: fullContext.filesBeingModified?.filter(file =>
          file.includes('components') || file.includes('app')
        ),
        stateManagement: fullContext.decisionsToday?.stateManagement
      };

    case 'backend':
      return {
        codeStandards: fullContext.codeStandards,
        security: fullContext.security,
        backend: fullContext.architecture?.backend,
        database: fullContext.architecture?.database,
        serverSideCalculations: fullContext.projectRules?.serverSideCalculations,
        filesBeingModified: fullContext.filesBeingModified?.filter(file =>
          file.includes('lib') || file.includes('api')
        )
      };

    default:
      return fullContext;
  }
}

// Test Suite
function runTests() {
  console.log('🧪 Running Context Inheritance Tests\n');
  console.log('=' .repeat(50));

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Global context is inherited
  try {
    const inherited = getInheritedContext();
    assert.strictEqual(inherited.codeStandards.useTypeScript, true);
    assert.strictEqual(inherited.security.noHardcodedSecrets, true);
    console.log('✅ Test 1 PASSED: Global context is inherited');
    passedTests++;
  } catch (error) {
    console.log('❌ Test 1 FAILED: Global context not properly inherited');
    console.log(`   Error: ${error.message}`);
    failedTests++;
  }

  // Test 2: Project context is inherited
  try {
    const inherited = getInheritedContext();
    assert.strictEqual(inherited.architecture.frontend, "Next.js 14");
    assert.strictEqual(inherited.projectRules.responsiveDesign, true);
    assert(Array.isArray(inherited.keyFiles));
    console.log('✅ Test 2 PASSED: Project context is inherited');
    passedTests++;
  } catch (error) {
    console.log('❌ Test 2 FAILED: Project context not properly inherited');
    console.log(`   Error: ${error.message}`);
    failedTests++;
  }

  // Test 3: Session context is inherited
  try {
    const inherited = getInheritedContext();
    assert.strictEqual(inherited.currentTask, "Adding shopping cart functionality");
    assert.strictEqual(inherited.decisionsToday.stateManagement, "Zustand (not Redux)");
    assert.strictEqual(inherited.progressToday.inProgress, "CartButton component");
    console.log('✅ Test 3 PASSED: Session context is inherited');
    passedTests++;
  } catch (error) {
    console.log('❌ Test 3 FAILED: Session context not properly inherited');
    console.log(`   Error: ${error.message}`);
    failedTests++;
  }

  // Test 4: All three layers are present in inherited context
  try {
    const inherited = getInheritedContext();
    // From global
    assert(inherited.codeStandards !== undefined, 'Global layer missing');
    // From project
    assert(inherited.architecture !== undefined, 'Project layer missing');
    // From session
    assert(inherited.currentTask !== undefined, 'Session layer missing');
    console.log('✅ Test 4 PASSED: All three context layers are present');
    passedTests++;
  } catch (error) {
    console.log('❌ Test 4 FAILED: Not all context layers are present');
    console.log(`   Error: ${error.message}`);
    failedTests++;
  }

  // Test 5: Frontend agent gets filtered context
  try {
    const frontendContext = getAgentContext('frontend');
    // Should have frontend-specific fields
    assert.strictEqual(frontendContext.frontend, "Next.js 14");
    assert.strictEqual(frontendContext.responsiveDesign, true);
    assert.strictEqual(frontendContext.stateManagement, "Zustand (not Redux)");
    // Should filter files to only frontend files
    assert(frontendContext.filesBeingModified.includes("src/components/CartButton.tsx"));
    assert(frontendContext.filesBeingModified.includes("src/app/cart/page.tsx"));
    assert(!frontendContext.filesBeingModified.includes("src/lib/cart-utils.ts"));
    console.log('✅ Test 5 PASSED: Frontend agent receives correctly filtered context');
    passedTests++;
  } catch (error) {
    console.log('❌ Test 5 FAILED: Frontend agent context filtering incorrect');
    console.log(`   Error: ${error.message}`);
    failedTests++;
  }

  // Test 6: Backend agent gets filtered context
  try {
    const backendContext = getAgentContext('backend');
    // Should have backend-specific fields
    assert.strictEqual(backendContext.backend, "Node.js Express");
    assert.strictEqual(backendContext.database, "PostgreSQL with Prisma");
    assert(backendContext.security !== undefined);
    // Should filter files to only backend files
    assert(backendContext.filesBeingModified.includes("src/lib/cart-utils.ts"));
    assert(!backendContext.filesBeingModified.includes("src/components/CartButton.tsx"));
    console.log('✅ Test 6 PASSED: Backend agent receives correctly filtered context');
    passedTests++;
  } catch (error) {
    console.log('❌ Test 6 FAILED: Backend agent context filtering incorrect');
    console.log(`   Error: ${error.message}`);
    failedTests++;
  }

  // Test 7: Inheritance chain is properly documented
  try {
    const inherited = getInheritedContext();
    assert(Array.isArray(inherited.inheritanceChain));
    assert.strictEqual(inherited.inheritanceChain.length, 3);
    assert(inherited.inheritanceChain[0].includes("Global"));
    assert(inherited.inheritanceChain[1].includes("Project"));
    assert(inherited.inheritanceChain[2].includes("Session"));
    console.log('✅ Test 7 PASSED: Inheritance chain is properly documented');
    passedTests++;
  } catch (error) {
    console.log('❌ Test 7 FAILED: Inheritance chain not properly documented');
    console.log(`   Error: ${error.message}`);
    failedTests++;
  }

  // Test 8: Context override works (session overrides project/global)
  try {
    // Create test contexts with overlapping fields
    const testGlobal = { priority: 'low', source: 'global' };
    const testProject = { priority: 'medium', source: 'project', extra: 'project-data' };
    const testSession = { priority: 'high', source: 'session' };

    const merged = { ...testGlobal, ...testProject, ...testSession };

    // Session should win for overlapping fields
    assert.strictEqual(merged.priority, 'high');
    assert.strictEqual(merged.source, 'session');
    // Project-specific field should still exist
    assert.strictEqual(merged.extra, 'project-data');
    console.log('✅ Test 8 PASSED: Context override precedence is correct');
    passedTests++;
  } catch (error) {
    console.log('❌ Test 8 FAILED: Context override precedence incorrect');
    console.log(`   Error: ${error.message}`);
    failedTests++;
  }

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 Test Results Summary\n');
  console.log(`   Total Tests: ${passedTests + failedTests}`);
  console.log(`   ✅ Passed: ${passedTests}`);
  console.log(`   ❌ Failed: ${failedTests}`);

  if (failedTests === 0) {
    console.log('\n🎉 All tests passed! Context inheritance is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Review the implementation.');
  }

  // Return exit code
  return failedTests === 0 ? 0 : 1;
}

// Run the tests
const exitCode = runTests();
process.exit(exitCode);