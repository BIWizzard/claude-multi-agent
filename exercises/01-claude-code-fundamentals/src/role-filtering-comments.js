// Section 4: Role-Based Filtering with User-Friendly Comments
//
// This enhanced version includes helpful comments for non-technical users
// explaining how to mark their content for role-based filtering.

const fs = require('fs').promises;

class MarkdownReader {
  /**
   * ROLE MARKING GUIDE FOR CONTENT AUTHORS:
   *
   * Method 1 - Add to Headers (Easiest):
   *   # My Section [role: coordinator]
   *   ## Another Section [role: executor]
   *   ### Shared Section [roles: coordinator, executor]
   *
   * Method 2 - Add Comments in Content:
   *   <!-- role: coordinator -->
   *   <!-- roles: coordinator, executor -->
   *
   * Available Roles:
   *   - coordinator: Strategic planning, management, high-level decisions
   *   - executor: Technical implementation, coding, detailed work
   *   - both: Use [roles: coordinator, executor] for shared content
   *   - none: Leave unmarked for public/general content
   */

  static parseFile(content) {
    const lines = content.split('\n');
    const sections = [];
    let currentSection = null;

    lines.forEach((line, index) => {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);

      if (headerMatch) {
        // Save previous section if it exists
        if (currentSection) {
          sections.push({
            ...currentSection,
            endLine: index - 1
          });
        }

        // Extract roles from header using role tags like [role: coordinator]
        const headerText = headerMatch[2].trim();
        const roles = this.extractRoles(headerText);

        // Create new section with clean title (role tags removed)
        currentSection = {
          level: headerMatch[1].length,
          title: headerText.replace(/\[roles?:\s*[^\]]+\]/gi, '').trim(),
          content: '',
          startLine: index,
          roles: roles.length > 0 ? roles : undefined
        };
      } else if (currentSection) {
        // Check for role comments like <!-- role: coordinator -->
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

  /**
   * Extracts role assignments from header text
   * Supports formats like:
   *   [role: coordinator]
   *   [roles: coordinator, executor]
   *   [role: COORDINATOR] (case insensitive)
   */
  static extractRoles(text) {
    const roleMatches = text.match(/\[roles?:\s*([^\]]+)\]/gi);
    if (!roleMatches) return [];

    const roles = [];
    roleMatches.forEach(match => {
      const roleList = match.replace(/\[roles?:\s*|\]/gi, '');
      const splitRoles = roleList.split(',').map(role => role.trim().toLowerCase());
      roles.push(...splitRoles.filter(role => role.length > 0));
    });

    return [...new Set(roles)]; // Remove duplicates
  }

  /**
   * Extracts role assignments from HTML comments
   * Supports formats like:
   *   <!-- role: coordinator -->
   *   <!-- roles: coordinator, executor -->
   */
  static extractRolesFromComment(line) {
    const commentMatch = line.match(/<!--\s*roles?:\s*([^-]+)\s*-->/i);
    if (!commentMatch) return [];

    return commentMatch[1].split(',').map(role => role.trim().toLowerCase()).filter(role => role.length > 0);
  }

  static async readFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    return this.parseFile(content);
  }

  /**
   * FILTERING FUNCTIONS FOR DIFFERENT ROLES:
   *
   * These functions help you see content specific to each role.
   * Use these to create role-specific views of your documentation.
   */

  /**
   * Shows only content marked for coordinators
   * Use this for: Strategic planning, management, high-level oversight
   */
  static filterCoordinatorSections(sections) {
    return sections.filter(section =>
      section.roles && section.roles.includes('coordinator')
    );
  }

  /**
   * Shows only content marked for executors
   * Use this for: Technical implementation, detailed work, coding
   */
  static filterExecutorSections(sections) {
    return sections.filter(section =>
      section.roles && section.roles.includes('executor')
    );
  }

  /**
   * Shows content that has no role assignments
   * This is "public" content visible to everyone
   */
  static getUnassignedSections(sections) {
    return sections.filter(section => !section.roles);
  }

  /**
   * Shows content marked for BOTH coordinator and executor
   * Use this for: Shared workflows, API docs, coordination points
   */
  static getSharedSections(sections) {
    return sections.filter(section =>
      section.roles &&
      section.roles.includes('coordinator') &&
      section.roles.includes('executor')
    );
  }

  /**
   * UTILITY FUNCTIONS:
   */

  /**
   * Get statistics about role distribution in your content
   */
  static getRoleStats(sections) {
    const stats = {};
    sections.forEach(section => {
      if (section.roles) {
        section.roles.forEach(role => {
          stats[role] = (stats[role] || 0) + 1;
        });
      }
    });
    return stats;
  }

  /**
   * Check if content is properly marked for roles
   * Returns helpful suggestions for content authors
   */
  static analyzeRoleDistribution(sections) {
    const total = sections.length;
    const coordinatorSections = this.filterCoordinatorSections(sections).length;
    const executorSections = this.filterExecutorSections(sections).length;
    const sharedSections = this.getSharedSections(sections).length;
    const unmarkedSections = this.getUnassignedSections(sections).length;

    return {
      total,
      coordinator: coordinatorSections,
      executor: executorSections,
      shared: sharedSections,
      unmarked: unmarkedSections,
      suggestions: this.generateContentSuggestions(coordinatorSections, executorSections, sharedSections, unmarkedSections, total)
    };
  }

  /**
   * Provides helpful suggestions for content authors
   */
  static generateContentSuggestions(coordinator, executor, shared, unmarked, total) {
    const suggestions = [];

    if (unmarked > total * 0.5) {
      suggestions.push("💡 Consider adding role markings to more sections for better filtering");
    }

    if (shared === 0 && coordinator > 0 && executor > 0) {
      suggestions.push("💡 You might want some shared sections for coordination between roles");
    }

    if (coordinator === 0) {
      suggestions.push("💡 Consider marking strategic/management content for coordinators");
    }

    if (executor === 0) {
      suggestions.push("💡 Consider marking technical/implementation content for executors");
    }

    if (suggestions.length === 0) {
      suggestions.push("✅ Good role distribution! Your content is well-organized for filtering");
    }

    return suggestions;
  }
}

module.exports = MarkdownReader;