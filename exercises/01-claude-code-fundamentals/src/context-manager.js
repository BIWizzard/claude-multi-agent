/**
 * ContextManager - Unified Multi-Agent Context Management System
 *
 * A simple, all-in-one solution for loading, caching, and filtering markdown content
 * for multi-agent systems. Combines file reading, caching, role-based filtering,
 * and error handling into one easy-to-use class.
 *
 * Exercise 1 - Section 4: Context Management Implementation
 */

const fs = require('fs').promises;
const path = require('path');

class ContextManager {
  constructor(options = {}) {
    // Cache settings
    this.cache = new Map();
    this.cacheMaxAge = options.cacheMaxAge || 5 * 60 * 1000; // 5 minutes default

    // Error handling settings
    this.silentErrors = options.silentErrors || false;
    this.verboseLogging = options.verboseLogging || true;

    this.log('✅ ContextManager initialized');
  }

  // ============================================================================
  // PUBLIC API - Simple interface for users
  // ============================================================================

  /**
   * Load context from a single file
   * @param {string} filePath - Path to markdown file
   * @returns {Promise<Array>} Array of parsed sections
   */
  async loadFile(filePath) {
    try {
      return await this.readFileWithCache(filePath);
    } catch (error) {
      return this.handleError(`Loading file ${filePath}`, error);
    }
  }

  /**
   * Load context from all markdown files in a directory
   * @param {string} dirPath - Path to directory containing markdown files
   * @returns {Promise<Array>} Array of merged file objects
   */
  async loadDirectory(dirPath) {
    try {
      return await this.readDirectoryWithCache(dirPath);
    } catch (error) {
      return this.handleError(`Loading directory ${dirPath}`, error);
    }
  }

  /**
   * Get coordinator-specific context view
   * @param {Array} sections - Sections to filter
   * @returns {Array} Sections visible to coordinators
   */
  getCoordinatorContext(sections) {
    return this.filterByRole(sections, 'coordinator');
  }

  /**
   * Get executor-specific context view
   * @param {Array} sections - Sections to filter
   * @returns {Array} Sections visible to executors
   */
  getExecutorContext(sections) {
    return this.filterByRole(sections, 'executor');
  }

  /**
   * Get shared context visible to both roles
   * @param {Array} sections - Sections to filter
   * @returns {Array} Sections visible to both roles
   */
  getSharedContext(sections) {
    return sections.filter(section =>
      section.roles &&
      section.roles.includes('coordinator') &&
      section.roles.includes('executor')
    );
  }

  /**
   * Get all context including unmarked sections
   * @param {Array} sections - Sections to include
   * @returns {Array} All sections
   */
  getAllContext(sections) {
    return sections;
  }

  /**
   * Merge multiple files into unified context
   * @param {Array} files - Array of file objects from loadDirectory
   * @returns {Array} Unified sections with file separators
   */
  mergeContext(files) {
    const allSections = [];

    files.forEach(file => {
      // Add file separator
      allSections.push({
        level: 1,
        title: `📄 ${file.fileName}`,
        content: `Contents from ${file.fileName}`,
        startLine: 0,
        endLine: 0,
        fileName: file.fileName,
        isFileSeparator: true
      });

      // Add all sections from this file
      file.sections.forEach(section => {
        allSections.push({
          ...section,
          level: section.level + 1 // Indent under file header
        });
      });
    });

    return allSections;
  }

  // ============================================================================
  // UTILITY METHODS - Cache and system management
  // ============================================================================

  /**
   * Clear all cached content
   */
  clearCache() {
    this.cache.clear();
    this.log('🗑️ Cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
      maxAge: this.cacheMaxAge
    };
  }

  /**
   * Set cache maximum age
   * @param {number} milliseconds - Cache lifetime in ms
   */
  setCacheMaxAge(milliseconds) {
    this.cacheMaxAge = milliseconds;
    this.log(`⏰ Cache max age set to ${Math.round(milliseconds / 1000)}s`);
  }

  /**
   * Analyze role distribution in content
   * @param {Array} sections - Sections to analyze
   * @returns {Object} Analysis results
   */
  analyzeContent(sections) {
    const total = sections.length;
    const coordinator = this.getCoordinatorContext(sections).length;
    const executor = this.getExecutorContext(sections).length;
    const shared = this.getSharedContext(sections).length;
    const unmarked = sections.filter(s => !s.roles).length;

    return {
      total,
      coordinator,
      executor,
      shared,
      unmarked,
      percentageCoordinator: Math.round((coordinator / total) * 100),
      percentageExecutor: Math.round((executor / total) * 100),
      percentageShared: Math.round((shared / total) * 100),
      percentageUnmarked: Math.round((unmarked / total) * 100)
    };
  }

  // ============================================================================
  // INTERNAL METHODS - Core functionality
  // ============================================================================

  async readFileWithCache(filePath) {
    try {
      // Check file stats for caching
      const stats = await fs.stat(filePath);
      const lastModified = stats.mtime.getTime();
      const now = Date.now();

      // Check cache
      const cached = this.cache.get(filePath);
      if (cached &&
          cached.lastModified === lastModified &&
          (now - cached.cachedAt) < this.cacheMaxAge) {
        this.log(`🔄 Cache hit: ${path.basename(filePath)}`);
        return cached.sections;
      }

      // Read and parse file
      this.log(`📖 Reading: ${path.basename(filePath)} ${cached ? '(cache expired)' : '(not cached)'}`);
      const content = await fs.readFile(filePath, 'utf-8');
      const sections = this.parseMarkdown(content);

      // Update cache
      this.cache.set(filePath, {
        filePath,
        lastModified,
        sections,
        cachedAt: now
      });

      return sections;

    } catch (error) {
      if (error.code === 'ENOENT') {
        this.log(`📋 File not found: "${filePath}"`);
        this.log(`💡 Please check the file path and ensure the file exists`);
      }
      throw error;
    }
  }

  async readDirectoryWithCache(dirPath) {
    try {
      const files = await fs.readdir(dirPath);
      const markdownFiles = files.filter(file => file.endsWith('.md'));

      if (markdownFiles.length === 0) {
        this.log(`📂 No markdown files found in "${dirPath}"`);
        return [];
      }

      const results = [];
      const failedFiles = [];

      for (const file of markdownFiles) {
        const filePath = path.join(dirPath, file);
        try {
          const sections = await this.readFileWithCache(filePath);

          // Add filename to each section
          sections.forEach(section => {
            section.fileName = file;
          });

          results.push({
            fileName: file,
            sections
          });
        } catch (error) {
          failedFiles.push(file);
          this.log(`❌ Failed to read: ${file} (${error.message})`);
        }
      }

      if (failedFiles.length > 0) {
        this.log(`📊 Processed ${results.length}/${markdownFiles.length} files successfully`);
      }

      return results;

    } catch (error) {
      if (error.code === 'ENOENT') {
        this.log(`📂 Directory not found: "${dirPath}"`);
        this.log(`💡 Please check the directory path and ensure it exists`);
      }
      throw error;
    }
  }

  parseMarkdown(content) {
    const lines = content.split('\n');
    const sections = [];
    let currentSection = null;

    lines.forEach((line, index) => {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);

      if (headerMatch) {
        if (currentSection) {
          sections.push({
            ...currentSection,
            endLine: index - 1
          });
        }

        const headerText = headerMatch[2].trim();
        const roles = this.extractRoles(headerText);

        currentSection = {
          level: headerMatch[1].length,
          title: headerText.replace(/\[roles?:\s*[^\]]+\]/gi, '').trim(),
          content: '',
          startLine: index,
          roles: roles.length > 0 ? roles : undefined
        };
      } else if (currentSection) {
        const roleComment = this.extractRolesFromComment(line);
        if (roleComment.length > 0) {
          currentSection.roles = [...(currentSection.roles || []), ...roleComment];
        }

        currentSection.content += (currentSection.content ? '\n' : '') + line;
      }
    });

    if (currentSection) {
      sections.push({
        ...currentSection,
        endLine: lines.length - 1
      });
    }

    return sections;
  }

  extractRoles(text) {
    const roleMatches = text.match(/\[roles?:\s*([^\]]+)\]/gi);
    if (!roleMatches) return [];

    const roles = [];
    roleMatches.forEach(match => {
      const roleList = match.replace(/\[roles?:\s*|\]/gi, '');
      const splitRoles = roleList.split(',').map(role => role.trim().toLowerCase());
      roles.push(...splitRoles.filter(role => role.length > 0));
    });

    return [...new Set(roles)];
  }

  extractRolesFromComment(line) {
    const commentMatch = line.match(/<!--\s*roles?:\s*([^-]+)\s*-->/i);
    if (!commentMatch) return [];

    return commentMatch[1].split(',').map(role => role.trim().toLowerCase()).filter(role => role.length > 0);
  }

  filterByRole(sections, role) {
    return sections.filter(section =>
      section.roles && section.roles.includes(role.toLowerCase())
    );
  }

  handleError(operation, error) {
    const errorMsg = `Error during ${operation}: ${error.message}`;

    if (this.silentErrors) {
      this.log(`⚠️ ${errorMsg} (continuing silently)`);
      return [];
    } else {
      this.log(`❌ ${errorMsg}`);
      throw error;
    }
  }

  log(message) {
    if (this.verboseLogging) {
      console.log(message);
    }
  }
}

module.exports = ContextManager;