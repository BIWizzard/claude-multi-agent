#!/usr/bin/env node

/**
 * Exercise Migration Script
 * Converts the current exercise structure to Astro Content Collections format
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  sourceDir: path.resolve(__dirname, '../../exercises'),
  targetDir: path.resolve(__dirname, '../../src/content'),
  manifestFile: 'manifest.json',
  backupDir: path.resolve(__dirname, '../backups'),
};

/**
 * Main migration function
 */
async function migrateExercises() {
  console.log('🚀 Starting exercise migration to Astro Content Collections...\n');

  try {
    // Create target directories
    await createDirectories();

    // Load current manifest
    const manifest = await loadManifest();

    // Migrate each exercise
    for (const exercise of manifest.exercises) {
      console.log(`📝 Migrating exercise: ${exercise.title}`);
      await migrateExercise(exercise);
    }

    // Create collection index files
    await createCollectionIndexes(manifest);

    console.log('\n✅ Migration completed successfully!');
    console.log(`📁 Content migrated to: ${CONFIG.targetDir}`);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

/**
 * Create necessary directories
 */
async function createDirectories() {
  const dirs = [
    CONFIG.targetDir,
    path.join(CONFIG.targetDir, 'exercises'),
    path.join(CONFIG.targetDir, 'sections'),
    path.join(CONFIG.targetDir, 'knowledge-base'),
    path.join(CONFIG.targetDir, 'meta'),
    CONFIG.backupDir,
  ];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

/**
 * Load exercise manifest
 */
async function loadManifest() {
  const manifestPath = path.join(CONFIG.sourceDir, CONFIG.manifestFile);
  const manifestContent = await fs.readFile(manifestPath, 'utf-8');
  return JSON.parse(manifestContent);
}

/**
 * Migrate a single exercise
 */
async function migrateExercise(exercise) {
  // Create exercise metadata file
  await createExerciseMetadata(exercise);

  // Migrate sections
  for (const section of exercise.sections || []) {
    await migrateSection(exercise.id, section);
  }
}

/**
 * Create exercise metadata in Astro format
 */
async function createExerciseMetadata(exercise) {
  const frontmatter = {
    id: exercise.id,
    title: exercise.title,
    description: exercise.description,
    duration: exercise.duration,
    difficulty: exercise.difficulty,
    objectives: exercise.objectives || [],
    prerequisites: exercise.prerequisites || [],
    sections: exercise.sections || [],
    lastUpdated: new Date(),
    version: '1.0.0',
    order: getExerciseOrder(exercise.id),
  };

  // Create a minimal content body
  const content = `---
${formatFrontmatter(frontmatter)}
---

# ${exercise.title}

${exercise.description}

## Objectives

${(exercise.objectives || []).map(obj => `- ${obj}`).join('\n')}

## Prerequisites

${(exercise.prerequisites || []).map(prereq => `- ${prereq}`).join('\n')}

## Sections

${(exercise.sections || []).map(section =>
  `### ${section.title}
- **Type**: ${section.type}
- **Estimated Time**: ${section.estimatedTime || 'TBD'}
- **Description**: ${section.description || 'No description'}
`).join('\n')}
`;

  const fileName = `${exercise.id}.mdx`;
  const filePath = path.join(CONFIG.targetDir, 'exercises', fileName);
  await fs.writeFile(filePath, content);

  console.log(`  ✓ Created exercise metadata: ${fileName}`);
}

/**
 * Migrate a single section
 */
async function migrateSection(exerciseId, section) {
  try {
    // Load existing section content
    const sectionContent = await loadSectionContent(exerciseId, section.id);

    // Parse copy button markers
    const { content, hasCopyButton, copyButtonText } = parseCopyButtonMarkers(sectionContent);

    // Create section frontmatter
    const frontmatter = {
      exerciseId: exerciseId,
      sectionId: section.id,
      title: section.title,
      type: section.type,
      estimatedTime: section.estimatedTime || '10 minutes',
      description: section.description || 'No description provided',
      order: getSectionOrder(section.id),
      hasCopyButton,
      copyButtonText: hasCopyButton ? copyButtonText : undefined,
      hasCodeSnippets: content.includes('```'),
      hasTransition: detectTransition(content),
      transitionTarget: detectTransitionTarget(content),
      lastUpdated: new Date(),
    };

    // Create section file
    const sectionFile = `---
${formatFrontmatter(frontmatter)}
---

${content}`;

    const fileName = `${exerciseId}-${section.id}.mdx`;
    const filePath = path.join(CONFIG.targetDir, 'sections', fileName);
    await fs.writeFile(filePath, sectionFile);

    console.log(`    ✓ Migrated section: ${section.title}`);

  } catch (error) {
    console.warn(`    ⚠️  Could not migrate section ${section.id}: ${error.message}`);
  }
}

/**
 * Load section content from file
 */
async function loadSectionContent(exerciseId, sectionId) {
  const sectionPath = path.join(CONFIG.sourceDir, exerciseId, `${sectionId}.md`);

  try {
    return await fs.readFile(sectionPath, 'utf-8');
  } catch (error) {
    console.warn(`    ⚠️  Section file not found: ${sectionPath}`);
    return `# ${sectionId}\n\nContent not available - please add manually.`;
  }
}

/**
 * Parse and remove copy button markers
 */
function parseCopyButtonMarkers(content) {
  const copyButtonRegex = /\[COPY_BUTTON\]/g;
  const matches = content.match(copyButtonRegex);
  const hasCopyButton = matches && matches.length > 0;

  // Extract the copy button text (usually the preceding code block)
  let copyButtonText = '';
  if (hasCopyButton) {
    // Find the last code block before [COPY_BUTTON]
    const beforeMarker = content.split('[COPY_BUTTON]')[0];
    const codeBlockMatch = beforeMarker.match(/```[\s\S]*?```(?![\s\S]*```)/);
    if (codeBlockMatch) {
      copyButtonText = codeBlockMatch[0].replace(/```\w*\n?/g, '').replace(/```/g, '').trim();
    }
  }

  // Remove copy button markers
  const cleanContent = content.replace(copyButtonRegex, '');

  return {
    content: cleanContent,
    hasCopyButton,
    copyButtonText,
  };
}

/**
 * Detect transition instructions in content
 */
function detectTransition(content) {
  const transitionMarkers = [
    'claude code',
    'transition:',
    'open claude code',
    'go to claude code',
    'copy this prompt',
    'paste in claude code'
  ];

  const lowerContent = content.toLowerCase();
  return transitionMarkers.some(marker => lowerContent.includes(marker));
}

/**
 * Detect transition target
 */
function detectTransitionTarget(content) {
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes('claude code') || lowerContent.includes('copy this prompt')) {
    return 'claude-code';
  }

  if (lowerContent.includes('return to web') || lowerContent.includes('back to browser')) {
    return 'web';
  }

  return undefined;
}

/**
 * Create collection index files
 */
async function createCollectionIndexes(manifest) {
  // Create exercises index
  const exercisesIndex = `// Auto-generated exercises index
export { default as '01-fundamentals' } from './01-fundamentals.mdx';
${manifest.exercises.map(ex => ex.id !== '01-fundamentals' ? `export { default as '${ex.id}' } from './${ex.id}.mdx';` : '').filter(Boolean).join('\n')}
`;

  await fs.writeFile(
    path.join(CONFIG.targetDir, 'exercises', '_index.ts'),
    exercisesIndex
  );

  console.log('  ✓ Created exercises index');
}

/**
 * Format frontmatter object as YAML
 */
function formatFrontmatter(obj) {
  return Object.entries(obj)
    .map(([key, value]) => {
      if (value === undefined) return '';
      if (Array.isArray(value)) {
        if (value.length === 0) return `${key}: []`;
        return `${key}:\n${value.map(item => `  - ${formatValue(item)}`).join('\n')}`;
      }
      return `${key}: ${formatValue(value)}`;
    })
    .filter(Boolean)
    .join('\n');
}

/**
 * Format individual values for YAML
 */
function formatValue(value) {
  if (typeof value === 'string') {
    // Escape quotes and wrap in quotes if contains special characters
    if (value.includes(':') || value.includes('\n') || value.includes('"')) {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * Get exercise order based on ID
 */
function getExerciseOrder(exerciseId) {
  const orderMap = {
    '01-fundamentals': 1,
    '02-multi-agent': 2,
    '03-advanced': 3,
    '04-production': 4,
  };
  return orderMap[exerciseId] || 999;
}

/**
 * Get section order based on ID
 */
function getSectionOrder(sectionId) {
  const orderMap = {
    'overview': 1,
    'concepts': 2,
    'setup': 3,
    'context-implementation': 4,
    'agent-coordination': 5,
    'validation': 6,
    'reflection': 7,
  };
  return orderMap[sectionId] || 999;
}

// Run migration if called directly
if (process.argv[1] === __filename) {
  migrateExercises();
}

export { migrateExercises };