#!/usr/bin/env node

/**
 * Meta Content Migration Script
 * Migrates special content like behind-the-scenes.md to meta collection
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  sourceDir: path.resolve(__dirname, '../../src'),
  targetDir: path.resolve(__dirname, '../../src/content/meta'),
};

const META_FILES = [
  {
    source: 'behind-the-scenes.md',
    target: 'behind-the-scenes.mdx',
    type: 'behind-scenes',
    title: 'Behind the Scenes: Building with Multi-Agent Orchestration',
    description: 'How this learning platform was built using the exact same multi-agent patterns it teaches',
    showInNavigation: true,
    order: 2,
  }
];

/**
 * Main migration function
 */
async function migrateMetaContent() {
  console.log('📄 Starting meta content migration...\n');

  try {
    // Create target directory
    await fs.mkdir(CONFIG.targetDir, { recursive: true });

    // Migrate each meta file
    for (const fileConfig of META_FILES) {
      await migrateMetaFile(fileConfig);
    }

    console.log('\n✅ Meta content migration completed!');

  } catch (error) {
    console.error('❌ Meta content migration failed:', error.message);
    process.exit(1);
  }
}

/**
 * Migrate a single meta file
 */
async function migrateMetaFile(fileConfig) {
  try {
    const sourcePath = path.join(CONFIG.sourceDir, fileConfig.source);
    const targetPath = path.join(CONFIG.targetDir, fileConfig.target);

    // Read source content
    const content = await fs.readFile(sourcePath, 'utf-8');

    // Extract tags from content
    const tags = extractTags(content, fileConfig.type);

    // Create frontmatter
    const frontmatter = {
      title: fileConfig.title,
      description: fileConfig.description,
      type: fileConfig.type,
      showInNavigation: fileConfig.showInNavigation,
      order: fileConfig.order,
      lastUpdated: new Date(),
      tags: tags,
      seoTitle: fileConfig.title,
      seoDescription: fileConfig.description,
    };

    // Create migrated content
    const migratedContent = `---
${formatFrontmatter(frontmatter)}
---

${cleanContent(content)}`;

    await fs.writeFile(targetPath, migratedContent);
    console.log(`  ✓ Migrated: ${fileConfig.source} → ${fileConfig.target}`);

  } catch (error) {
    console.warn(`  ⚠️  Could not migrate ${fileConfig.source}: ${error.message}`);
  }
}

/**
 * Extract relevant tags from content
 */
function extractTags(content, type) {
  const tags = [type];

  // Content-based tags
  if (content.includes('multi-agent')) tags.push('multi-agent');
  if (content.includes('orchestration')) tags.push('orchestration');
  if (content.includes('Alpine.js')) tags.push('alpine-js');
  if (content.includes('Vite')) tags.push('vite');
  if (content.includes('architecture')) tags.push('architecture');
  if (content.includes('performance')) tags.push('performance');
  if (content.includes('collaboration')) tags.push('collaboration');
  if (content.includes('real-time')) tags.push('real-time');

  return [...new Set(tags)]; // Remove duplicates
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
  migrateMetaContent();
}

export { migrateMetaContent };