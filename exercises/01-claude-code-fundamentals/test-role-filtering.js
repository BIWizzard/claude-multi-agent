const fs = require('fs').promises;
const path = require('path');

// Section 4: Role-based filtering test
class MarkdownReader {
  static cache = new Map();
  static cacheMaxAge = 5 * 60 * 1000;

  static parseFile(content) {
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

  static extractRoles(text) {
    const roleMatches = text.match(/\[roles?:\s*([^\]]+)\]/gi);
    if (!roleMatches) return [];

    const roles = [];
    roleMatches.forEach(match => {
      const roleList = match.replace(/\[roles?:\s*|\]/gi, '');
      const splitRoles = roleList.split(',').map(role => role.trim().toLowerCase());
      roles.push(...splitRoles);
    });

    return [...new Set(roles)];
  }

  static extractRolesFromComment(line) {
    const commentMatch = line.match(/<!--\s*roles?:\s*([^-]+)\s*-->/i);
    if (!commentMatch) return [];

    return commentMatch[1].split(',').map(role => role.trim().toLowerCase());
  }

  static async readFile(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const lastModified = stats.mtime.getTime();
      const now = Date.now();

      const cached = this.cache.get(filePath);
      if (cached &&
          cached.lastModified === lastModified &&
          (now - cached.cachedAt) < this.cacheMaxAge) {
        return cached.sections;
      }

      const content = await fs.readFile(filePath, 'utf-8');
      const sections = this.parseFile(content);

      this.cache.set(filePath, {
        filePath,
        lastModified,
        sections,
        cachedAt: now
      });

      return sections;
    } catch (error) {
      throw error;
    }
  }

  static filterByRole(sections, role) {
    return sections.filter(section =>
      section.roles && section.roles.includes(role.toLowerCase())
    );
  }

  static filterCoordinatorSections(sections) {
    return this.filterByRole(sections, 'coordinator');
  }

  static filterExecutorSections(sections) {
    return this.filterByRole(sections, 'executor');
  }

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
}

async function testRoleFiltering() {
  console.log('=== Exercise 1 - Section 4: Role-Based Filtering Test ===\n');

  // Read the role-based content file
  console.log('📖 Reading role-based content file...');
  const sections = await MarkdownReader.readFile('./test-docs/role-based-content.md');

  console.log(`\n📊 Total sections parsed: ${sections.length}\n`);

  // Show all sections with their roles
  console.log('🔍 All sections with role assignments:');
  console.log('----------------------------------------');
  sections.forEach((section, i) => {
    const roleText = section.roles ? `[${section.roles.join(', ')}]` : '[no roles]';
    console.log(`${i + 1}. ${section.title} ${roleText}`);
  });

  // Get role statistics
  console.log('\n📈 Role Statistics:');
  console.log('-------------------');
  const stats = MarkdownReader.getRoleStats(sections);
  Object.entries(stats).forEach(([role, count]) => {
    console.log(`${role}: ${count} sections`);
  });

  // Test coordinator filtering
  console.log('\n👥 COORDINATOR-ONLY VIEW:');
  console.log('==========================');
  const coordinatorSections = MarkdownReader.filterCoordinatorSections(sections);
  console.log(`Found ${coordinatorSections.length} coordinator-relevant sections:\n`);

  coordinatorSections.forEach((section, i) => {
    console.log(`${i + 1}. 📋 ${section.title}`);
    console.log(`   Roles: [${section.roles.join(', ')}]`);
    console.log(`   Content preview: ${section.content.substring(0, 60)}...\n`);
  });

  // Test executor filtering
  console.log('⚙️ EXECUTOR-ONLY VIEW:');
  console.log('======================');
  const executorSections = MarkdownReader.filterExecutorSections(sections);
  console.log(`Found ${executorSections.length} executor-relevant sections:\n`);

  executorSections.forEach((section, i) => {
    console.log(`${i + 1}. 🔧 ${section.title}`);
    console.log(`   Roles: [${section.roles.join(', ')}]`);
    console.log(`   Content preview: ${section.content.substring(0, 60)}...\n`);
  });

  // Show sections visible to both
  const sharedSections = sections.filter(section =>
    section.roles &&
    section.roles.includes('coordinator') &&
    section.roles.includes('executor')
  );

  console.log('🤝 SHARED SECTIONS (Both Roles):');
  console.log('=================================');
  console.log(`Found ${sharedSections.length} sections visible to both roles:\n`);

  sharedSections.forEach((section, i) => {
    console.log(`${i + 1}. 🔄 ${section.title}`);
  });

  // Summary
  console.log('\n🎉 Role-based filtering test completed!');
  console.log(`📊 Summary:`);
  console.log(`   Total sections: ${sections.length}`);
  console.log(`   Coordinator sections: ${coordinatorSections.length}`);
  console.log(`   Executor sections: ${executorSections.length}`);
  console.log(`   Shared sections: ${sharedSections.length}`);
  console.log(`   Unassigned sections: ${sections.length - Object.values(stats).reduce((a,b) => a+b, 0)}`);
}

testRoleFiltering();