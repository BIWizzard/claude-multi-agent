const fs = require('fs').promises;

// Section 4: Comprehensive role-based filtering demonstration
class MarkdownReader {
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
    const content = await fs.readFile(filePath, 'utf-8');
    return this.parseFile(content);
  }

  static filterCoordinatorSections(sections) {
    return sections.filter(section =>
      section.roles && section.roles.includes('coordinator')
    );
  }

  static filterExecutorSections(sections) {
    return sections.filter(section =>
      section.roles && section.roles.includes('executor')
    );
  }

  static getUnassignedSections(sections) {
    return sections.filter(section => !section.roles);
  }
}

function displaySection(section, index) {
  const roleText = section.roles ? `[${section.roles.join(', ')}]` : '[unassigned]';
  const indent = '  '.repeat(Math.max(0, section.level - 1));
  console.log(`${index + 1}. ${indent}${section.title} ${roleText}`);

  // Show first 80 characters of content if it exists
  if (section.content.trim()) {
    const preview = section.content.trim().replace(/\n+/g, ' ').substring(0, 80);
    console.log(`   ${preview}${preview.length >= 80 ? '...' : ''}`);
  }
  console.log();
}

async function demonstrateRoleViews() {
  console.log('=== Exercise 1 - Section 4: Role View Demonstration ===\n');

  const sections = await MarkdownReader.readFile('./test-docs/comprehensive-role-demo.md');

  console.log('📋 ALL CONTENT (Complete Document):');
  console.log('=====================================');
  console.log(`Total sections: ${sections.length}\n`);

  sections.forEach((section, i) => displaySection(section, i));

  // Coordinator View
  console.log('\n👥 COORDINATOR VIEW (Strategic/Management Focus):');
  console.log('================================================');
  const coordinatorSections = MarkdownReader.filterCoordinatorSections(sections);
  console.log(`Coordinator sees ${coordinatorSections.length} sections:\n`);

  coordinatorSections.forEach((section, i) => displaySection(section, i));

  console.log('🔒 COORDINATOR CANNOT SEE:');
  console.log('---------------------------');
  const coordinatorCantSee = sections.filter(section =>
    !section.roles || !section.roles.includes('coordinator')
  );
  coordinatorCantSee.forEach(section => {
    const roleText = section.roles ? `[${section.roles.join(', ')}]` : '[unassigned]';
    console.log(`❌ ${section.title} ${roleText}`);
  });

  // Executor View
  console.log('\n\n⚙️ EXECUTOR VIEW (Technical/Implementation Focus):');
  console.log('=================================================');
  const executorSections = MarkdownReader.filterExecutorSections(sections);
  console.log(`Executor sees ${executorSections.length} sections:\n`);

  executorSections.forEach((section, i) => displaySection(section, i));

  console.log('🔒 EXECUTOR CANNOT SEE:');
  console.log('------------------------');
  const executorCantSee = sections.filter(section =>
    !section.roles || !section.roles.includes('executor')
  );
  executorCantSee.forEach(section => {
    const roleText = section.roles ? `[${section.roles.join(', ')}]` : '[unassigned]';
    console.log(`❌ ${section.title} ${roleText}`);
  });

  // Shared and Unassigned
  console.log('\n\n🤝 SHARED CONTENT (Both Roles See):');
  console.log('===================================');
  const sharedSections = sections.filter(section =>
    section.roles &&
    section.roles.includes('coordinator') &&
    section.roles.includes('executor')
  );
  console.log(`${sharedSections.length} sections visible to both:\n`);

  sharedSections.forEach(section => {
    console.log(`✅ ${section.title}`);
  });

  console.log('\n\n👻 UNASSIGNED CONTENT (No Role Restrictions):');
  console.log('============================================');
  const unassignedSections = MarkdownReader.getUnassignedSections(sections);
  console.log(`${unassignedSections.length} sections with no role assignment:\n`);

  unassignedSections.forEach(section => {
    console.log(`🔓 ${section.title}`);
  });

  // Summary Statistics
  console.log('\n\n📊 SUMMARY STATISTICS:');
  console.log('======================');
  console.log(`Total sections: ${sections.length}`);
  console.log(`Coordinator-only: ${coordinatorSections.length - sharedSections.length}`);
  console.log(`Executor-only: ${executorSections.length - sharedSections.length}`);
  console.log(`Shared (both roles): ${sharedSections.length}`);
  console.log(`Unassigned (public): ${unassignedSections.length}`);

  const coordinatorTotal = coordinatorSections.length + unassignedSections.length;
  const executorTotal = executorSections.length + unassignedSections.length;

  console.log(`\nCoordinator total access: ${coordinatorTotal}/${sections.length} sections (${Math.round(coordinatorTotal/sections.length*100)}%)`);
  console.log(`Executor total access: ${executorTotal}/${sections.length} sections (${Math.round(executorTotal/sections.length*100)}%)`);
}

demonstrateRoleViews();