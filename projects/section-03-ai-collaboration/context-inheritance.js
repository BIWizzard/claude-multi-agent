/**
 * Context Inheritance Demonstration
 * Shows how session context inherits from project context, which inherits from global context
 */

// Global Context - applies to all projects
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

// Project Context - specific to e-commerce project
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

// Session Context - today's specific work
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

/**
 * Context Inheritance Function
 * Merges contexts with session taking precedence, then project, then global
 */
function getInheritedContext() {
  return {
    ...globalContext,      // Base layer
    ...projectContext,     // Overrides global where applicable
    ...sessionContext,     // Most specific, overrides everything

    // Metadata about inheritance
    inheritanceChain: [
      "Global Context (universal rules)",
      "Project Context (e-commerce specific)",
      "Session Context (today's cart work)"
    ]
  };
}

/**
 * Get context for a specific agent with role-based filtering
 */
function getAgentContext(agentRole) {
  const fullContext = getInheritedContext();

  // Filter context based on agent role
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

// Demo the inheritance in action
console.log('🌍 Global Context:');
console.log(globalContext);

console.log('\n🏗️ Project Context:');
console.log(projectContext);

console.log('\n📅 Session Context:');
console.log(sessionContext);

console.log('\n🔗 Inherited Context (All Layers Combined):');
console.log(getInheritedContext());

console.log('\n🎯 Frontend Agent Context (Filtered):');
console.log(getAgentContext('frontend'));

console.log('\n⚙️ Backend Agent Context (Filtered):');
console.log(getAgentContext('backend'));