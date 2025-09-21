export interface MarkdownSection {
  level: number;
  title: string;
  content: string;
  startLine: number;
  endLine: number;
  fileName?: string;
  roles?: string[];
}

export interface MergedMarkdownFile {
  fileName: string;
  sections: MarkdownSection[];
}

export interface CacheEntry {
  filePath: string;
  lastModified: number;
  sections: MarkdownSection[];
  cachedAt: number;
}

export class MarkdownReader {
  private static cache: Map<string, CacheEntry> = new Map();
  private static cacheMaxAge: number = 5 * 60 * 1000; // 5 minutes in milliseconds
  static parseFile(content: string): MarkdownSection[] {
    const lines = content.split('\n');
    const sections: MarkdownSection[] = [];
    let currentSection: Partial<MarkdownSection> | null = null;

    lines.forEach((line, index) => {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);

      if (headerMatch) {
        // Save previous section if it exists
        if (currentSection) {
          sections.push({
            ...currentSection,
            endLine: index - 1
          } as MarkdownSection);
        }

        // Extract roles from header
        const headerText = headerMatch[2].trim();
        const roles = this.extractRoles(headerText);

        // Start new section
        currentSection = {
          level: headerMatch[1].length,
          title: headerText.replace(/\[roles?:\s*[^\]]+\]/gi, '').trim(),
          content: '',
          startLine: index,
          roles: roles.length > 0 ? roles : undefined
        };
      } else if (currentSection) {
        // Check for role comments in content
        const roleComment = this.extractRolesFromComment(line);
        if (roleComment.length > 0) {
          currentSection.roles = [...(currentSection.roles || []), ...roleComment];
        }

        // Add content to current section
        currentSection.content += (currentSection.content ? '\n' : '') + line;
      }
    });

    // Add final section
    if (currentSection) {
      sections.push({
        ...currentSection,
        endLine: lines.length - 1
      } as MarkdownSection);
    }

    return sections;
  }

  private static extractRoles(text: string): string[] {
    const roleMatches = text.match(/\[roles?:\s*([^\]]+)\]/gi);
    if (!roleMatches) return [];

    const roles: string[] = [];
    roleMatches.forEach(match => {
      const roleList = match.replace(/\[roles?:\s*|\]/gi, '');
      const splitRoles = roleList.split(',').map(role => role.trim().toLowerCase());
      roles.push(...splitRoles);
    });

    return [...new Set(roles)]; // Remove duplicates
  }

  private static extractRolesFromComment(line: string): string[] {
    const commentMatch = line.match(/<!--\s*roles?:\s*([^-]+)\s*-->/i);
    if (!commentMatch) return [];

    return commentMatch[1].split(',').map(role => role.trim().toLowerCase());
  }

  static async readFile(filePath: string): Promise<MarkdownSection[]> {
    const fs = require('fs').promises;

    try {
      // Check if file exists and get its stats
      const stats = await fs.stat(filePath);
      const lastModified = stats.mtime.getTime();
      const now = Date.now();

      // Check cache
      const cached = this.cache.get(filePath);
      if (cached &&
          cached.lastModified === lastModified &&
          (now - cached.cachedAt) < this.cacheMaxAge) {
        console.log(`🔄 Cache Hit: Using cached data for "${filePath}"`);
        return cached.sections;
      }

      // Read and parse file
      console.log(`📖 Reading: "${filePath}" ${cached ? '(cache expired/outdated)' : '(not cached)'}`);
      const content = await fs.readFile(filePath, 'utf-8');
      const sections = this.parseFile(content);

      // Update cache
      this.cache.set(filePath, {
        filePath,
        lastModified,
        sections,
        cachedAt: now
      });

      return sections;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log(`📋 Missing File Helper: "${filePath}" was not found.`);
        console.log(`💡 Friendly Suggestion: Please check the file path and ensure the file exists.`);
        console.log(`🔍 Quick Fix: You might want to create this file or verify the correct path.`);
      }
      throw error;
    }
  }

  static async readDirectory(dirPath: string): Promise<MergedMarkdownFile[]> {
    const fs = require('fs').promises;
    const path = require('path');

    try {
      const files = await fs.readdir(dirPath);
      const markdownFiles = files.filter((file: string) => file.endsWith('.md'));

      if (markdownFiles.length === 0) {
        console.log(`📂 Directory Helper: No markdown files found in "${dirPath}".`);
        console.log(`💡 Friendly Suggestion: Add some .md files to this directory for processing.`);
        return [];
      }

      const results: MergedMarkdownFile[] = [];
      const failedFiles: string[] = [];

      for (const file of markdownFiles) {
        const filePath = path.join(dirPath, file);
        try {
          const sections = await this.readFile(filePath);

          // Add filename to each section
          sections.forEach(section => {
            section.fileName = file;
          });

          results.push({
            fileName: file,
            sections
          });
        } catch (error: any) {
          failedFiles.push(file);
          if (error.code === 'ENOENT') {
            console.log(`📋 Missing File Helper: "${file}" in directory "${dirPath}" could not be read.`);
            console.log(`💡 Friendly Suggestion: File may have been moved or deleted during processing.`);
          } else if (error.code === 'EACCES') {
            console.log(`🔒 Permission Helper: Cannot read "${file}" due to insufficient permissions.`);
            console.log(`💡 Friendly Suggestion: Check file permissions or run with appropriate access rights.`);
          } else {
            console.log(`⚠️ File Error Helper: Problem reading "${file}": ${error.message}`);
          }
        }
      }

      if (failedFiles.length > 0) {
        console.log(`📊 Processing Summary: ${results.length} files successfully processed, ${failedFiles.length} files failed.`);
        console.log(`❌ Failed files: ${failedFiles.join(', ')}`);
      }

      return results;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log(`📂 Directory Helper: Directory "${dirPath}" was not found.`);
        console.log(`💡 Friendly Suggestion: Please check the directory path and ensure it exists.`);
        console.log(`🔍 Quick Fix: You might want to create this directory or verify the correct path.`);
      } else if (error.code === 'EACCES') {
        console.log(`🔒 Permission Helper: Cannot access directory "${dirPath}" due to insufficient permissions.`);
        console.log(`💡 Friendly Suggestion: Check directory permissions or run with appropriate access rights.`);
      }
      throw error;
    }
  }

  static mergeFiles(files: MergedMarkdownFile[]): MarkdownSection[] {
    const allSections: MarkdownSection[] = [];

    files.forEach(file => {
      // Add file separator
      allSections.push({
        level: 1,
        title: `📄 ${file.fileName}`,
        content: `Contents from ${file.fileName}`,
        startLine: 0,
        endLine: 0,
        fileName: file.fileName
      });

      // Add all sections from this file
      file.sections.forEach(section => {
        allSections.push({
          ...section,
          level: section.level + 1 // Indent all sections under file header
        });
      });
    });

    return allSections;
  }

  static clearCache(): void {
    this.cache.clear();
    console.log(`🗑️ Cache cleared: All cached entries removed`);
  }

  static getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  static setCacheMaxAge(milliseconds: number): void {
    this.cacheMaxAge = milliseconds;
    console.log(`⏰ Cache max age set to ${milliseconds}ms (${Math.round(milliseconds / 1000)}s)`);
  }

  static filterByRole(sections: MarkdownSection[], role: string): MarkdownSection[] {
    return sections.filter(section =>
      section.roles && section.roles.includes(role.toLowerCase())
    );
  }

  static filterCoordinatorSections(sections: MarkdownSection[]): MarkdownSection[] {
    return this.filterByRole(sections, 'coordinator');
  }

  static filterExecutorSections(sections: MarkdownSection[]): MarkdownSection[] {
    return this.filterByRole(sections, 'executor');
  }

  static getRoleStats(sections: MarkdownSection[]): { [role: string]: number } {
    const stats: { [role: string]: number } = {};

    sections.forEach(section => {
      if (section.roles) {
        section.roles.forEach(role => {
          stats[role] = (stats[role] || 0) + 1;
        });
      }
    });

    return stats;
  }
}