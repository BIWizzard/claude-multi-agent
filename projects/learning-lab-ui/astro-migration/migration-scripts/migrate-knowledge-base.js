#!/usr/bin/env node

/**
 * Knowledge Base Migration Script
 * Converts knowledge base content to Astro Content Collections format
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  sourceDir: path.resolve(__dirname, '../../../knowledge-base'),
  targetDir: path.resolve(__dirname, '../../src/content/knowledge-base'),
  metaTargetDir: path.resolve(__dirname, '../../src/content/meta'),
};

/**
 * Main migration function
 */
async function migrateKnowledgeBase() {
  console.log('🧠 Starting knowledge base migration...\n');

  try {
    // Create target directories
    await fs.mkdir(CONFIG.targetDir, { recursive: true });
    await fs.mkdir(CONFIG.metaTargetDir, { recursive: true });

    // Scan source directory
    await scanAndMigrate(CONFIG.sourceDir, '');

    console.log('\n✅ Knowledge base migration completed!');

  } catch (error) {
    console.error('❌ Knowledge base migration failed:', error.message);
    process.exit(1);
  }
}

/**
 * Recursively scan and migrate knowledge base content
 */
async function scanAndMigrate(sourceDir, relativePath = '') {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(sourceDir, entry.name);
    const newRelativePath = path.join(relativePath, entry.name);

    if (entry.isDirectory()) {
      // Recursively process subdirectories
      await scanAndMigrate(fullPath, newRelativePath);
    } else if (entry.name.endsWith('.md')) {
      await migrateKnowledgeBaseFile(fullPath, newRelativePath);
    }
  }
}

/**
 * Migrate a single knowledge base file
 */
async function migrateKnowledgeBaseFile(filePath, relativePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const fileName = path.basename(relativePath, '.md');
    const category = getCategoryFromPath(relativePath);
    const type = getTypeFromPath(relativePath);

    // Determine if this is a special meta file
    if (fileName === 'README' && category === '') {
      await migrateMasterReadme(content, fileName);
      return;
    }

    // Create frontmatter based on content analysis
    const frontmatter = await analyzeAndCreateFrontmatter(content, {
      fileName,
      category,
      type,
      relativePath,
    });

    // Create migrated content
    const migratedContent = `---
${formatFrontmatter(frontmatter)}
---

${cleanContent(content)}`;

    // Determine target file path
    const targetFileName = `${category ? category + '-' : ''}${fileName}.mdx`;
    const targetPath = path.join(CONFIG.targetDir, targetFileName);

    await fs.writeFile(targetPath, migratedContent);
    console.log(`  ✓ Migrated: ${relativePath} → ${targetFileName}`);

  } catch (error) {
    console.warn(`  ⚠️  Could not migrate ${relativePath}: ${error.message}`);
  }
}

/**
 * Migrate the master README file
 */
async function migrateMasterReadme(content, fileName) {
  const frontmatter = {
    title: 'Knowledge Base',
    description: 'Extracted patterns, templates, and learnings from multi-agent orchestration exercises',
    type: 'guide',
    showInNavigation: true,
    order: 1,
    lastUpdated: new Date(),
    tags: ['overview', 'guide', 'patterns', 'templates'],
  };

  const migratedContent = `---
${formatFrontmatter(frontmatter)}
---

${cleanContent(content)}`;

  const targetPath = path.join(CONFIG.metaTargetDir, 'knowledge-base-overview.mdx');
  await fs.writeFile(targetPath, migratedContent);
  console.log(`  ✓ Migrated master README → knowledge-base-overview.mdx`);
}

/**
 * Analyze content and create appropriate frontmatter
 */
async function analyzeAndCreateFrontmatter(content, metadata) {
  const { fileName, category, type, relativePath } = metadata;

  // Extract title from content
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : fileName.replace(/-/g, ' ');

  // Extract description (first paragraph or content after title)
  const descriptionMatch = content.match(/^#[^\n]*\n\s*\n(.+?)(\n\n|\n#|$)/ms);
  const description = descriptionMatch
    ? descriptionMatch[1].replace(/\n/g, ' ').trim().substring(0, 200)
    : `${type} content for ${category || 'general'} topics`;

  // Base frontmatter
  const frontmatter = {
    type: type,
    category: category || 'general',
    title: title,
    description: description,
    lastUpdated: new Date(),
    version: '1.0.0',
    tags: generateTags(content, category, type),
  };

  // Add type-specific metadata
  if (type === 'pattern') {
    Object.assign(frontmatter, analyzePatternContent(content));
  } else if (type === 'template') {
    Object.assign(frontmatter, analyzeTemplateContent(content));
  } else if (type === 'troubleshooting') {
    Object.assign(frontmatter, analyzeTroubleshootingContent(content));
  }

  // Add usage metadata
  frontmatter.codeExamples = content.includes('```');
  frontmatter.usageContext = extractUsageContext(content);

  return frontmatter;
}

/**
 * Analyze pattern-specific content
 */
function analyzePatternContent(content) {
  const sections = {};

  // Look for problem context
  const problemMatch = content.match(/(?:problem|issue|challenge)[:.\s]*(.*?)(?:\n\n|\n#|$)/is);
  if (problemMatch) {
    sections.problemContext = problemMatch[1].trim();
  }

  // Look for solution approach
  const solutionMatch = content.match(/(?:solution|approach|implementation)[:.\s]*(.*?)(?:\n\n|\n#|$)/is);
  if (solutionMatch) {
    sections.solutionApproach = solutionMatch[1].trim();
  }

  // Look for when to use/avoid
  const whenToUseMatch = content.match(/(?:when to use|use when|appropriate for)[:.\s]*(.*?)(?:\n\n|\n#|$)/is);
  if (whenToUseMatch) {
    sections.whenToUse = [whenToUseMatch[1].trim()];
  }

  const whenToAvoidMatch = content.match(/(?:when to avoid|avoid when|not appropriate)[:.\s]*(.*?)(?:\n\n|\n#|$)/is);
  if (whenToAvoidMatch) {
    sections.whenToAvoid = [whenToAvoidMatch[1].trim()];
  }

  return sections;
}

/**
 * Analyze template-specific content
 */
function analyzeTemplateContent(content) {
  const sections = {};

  // Look for template type
  const typeMatch = content.match(/(?:template type|type)[:.\s]*(.*?)(?:\n\n|\n#|$)/is);
  if (typeMatch) {
    sections.templateType = typeMatch[1].trim();
  }

  // Look for setup instructions
  const setupMatch = content.match(/(?:setup|installation|getting started)[:.\s]*((?:.*\n)*?)(?:\n#|$)/is);
  if (setupMatch) {
    const instructions = setupMatch[1]
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[-*]\s*/, '').trim());
    sections.setupInstructions = instructions;
  }

  return sections;
}

/**
 * Analyze troubleshooting-specific content
 */
function analyzeTroubleshootingContent(content) {
  const sections = {};

  // Look for symptoms
  const symptomsMatch = content.match(/(?:symptoms|signs|indicators)[:.\s]*((?:.*\n)*?)(?:\n#|$)/is);
  if (symptomsMatch) {
    sections.symptoms = extractListItems(symptomsMatch[1]);
  }

  // Look for causes
  const causesMatch = content.match(/(?:causes|reasons|root cause)[:.\s]*((?:.*\n)*?)(?:\n#|$)/is);
  if (causesMatch) {
    sections.causes = extractListItems(causesMatch[1]);
  }

  // Look for solutions
  const solutionsMatch = content.match(/(?:solutions|fixes|resolution)[:.\s]*((?:.*\n)*?)(?:\n#|$)/is);
  if (solutionsMatch) {
    sections.solutions = extractListItems(solutionsMatch[1]);
  }

  return sections;
}

/**
 * Extract list items from text
 */
function extractListItems(text) {
  return text
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^[-*]\s*/, '').trim())
    .filter(item => item.length > 0);
}

/**
 * Generate tags based on content analysis
 */
function generateTags(content, category, type) {
  const tags = [type];

  if (category) tags.push(category);

  // Content-based tags
  if (content.includes('claude')) tags.push('claude');
  if (content.includes('agent')) tags.push('multi-agent');
  if (content.includes('context')) tags.push('context-management');
  if (content.includes('coordination')) tags.push('coordination');
  if (content.includes('pattern')) tags.push('pattern');
  if (content.includes('template')) tags.push('template');

  // Technical tags
  if (content.includes('```js') || content.includes('javascript')) tags.push('javascript');
  if (content.includes('```ts') || content.includes('typescript')) tags.push('typescript');
  if (content.includes('```md') || content.includes('markdown')) tags.push('markdown');

  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Extract usage context from content
 */
function extractUsageContext(content) {
  const contexts = [];

  if (content.includes('beginner')) contexts.push('beginner');
  if (content.includes('advanced')) contexts.push('advanced');
  if (content.includes('production')) contexts.push('production');
  if (content.includes('development')) contexts.push('development');
  if (content.includes('debugging')) contexts.push('debugging');
  if (content.includes('testing')) contexts.push('testing');

  return contexts;
}

/**
 * Get category from file path
 */
function getCategoryFromPath(relativePath) {
  const pathParts = path.dirname(relativePath).split(path.sep).filter(Boolean);
  return pathParts.length > 0 ? pathParts[0] : '';
}

/**
 * Get content type from path
 */
function getTypeFromPath(relativePath) {
  const category = getCategoryFromPath(relativePath);

  const typeMap = {
    'patterns': 'pattern',
    'templates': 'template',
    'troubleshooting': 'troubleshooting',
    'tools': 'tool-guide',
    'modules': 'pattern', // Modules are treated as patterns
    'prompting-patterns': 'pattern',
  };

  return typeMap[category] || 'pattern';
}

/**
 * Clean content (remove problematic formatting)
 */
function cleanContent(content) {
  // Remove any existing frontmatter
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');

  // Normalize line endings
  return withoutFrontmatter.replace(/\r\n/g, '\n').trim();
}

/**
 * Format frontmatter object as YAML
 */
function formatFrontmatter(obj) {
  return Object.entries(obj)
    .map(([key, value]) => {
      if (value === undefined || value === null) return '';
      if (Array.isArray(value)) {
        if (value.length === 0) return `${key}: []`;
        return `${key}:\n${value.map(item => `  - "${String(item).replace(/"/g, '\\"')}"`).join('\n')}`;
      }
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains special characters
        if (value.includes(':') || value.includes('\n') || value.includes('"') || value.includes('#')) {
          return `${key}: "${value.replace(/"/g, '\\"')}"`;
        }
        return `${key}: ${value}`;
      }
      if (value instanceof Date) {
        return `${key}: ${value.toISOString()}`;
      }
      return `${key}: ${String(value)}`;
    })
    .filter(Boolean)
    .join('\n');
}

// Run migration if called directly
if (process.argv[1] === __filename) {
  migrateKnowledgeBase();
}

export { migrateKnowledgeBase };