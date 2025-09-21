const fs = require('fs').promises;

// Section 4: Edge case testing for role-based filtering
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
      roles.push(...splitRoles.filter(role => role.length > 0)); // Filter out empty roles
    });

    return [...new Set(roles)];
  }

  static extractRolesFromComment(line) {
    const commentMatch = line.match(/<!--\s*roles?:\s*([^-]+)\s*-->/i);
    if (!commentMatch) return [];

    return commentMatch[1].split(',').map(role => role.trim().toLowerCase()).filter(role => role.length > 0);
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

  static getSharedSections(sections) {
    return sections.filter(section =>
      section.roles &&
      section.roles.includes('coordinator') &&
      section.roles.includes('executor')
    );
  }

  static getUnknownRoleSections(sections) {
    return sections.filter(section =>
      section.roles &&
      !section.roles.includes('coordinator') &&
      !section.roles.includes('executor')
    );
  }
}

async function testEdgeCases() {
  console.log('=== Exercise 1 - Section 4: Edge Case Testing ===\n');

  const sections = await MarkdownReader.readFile('./test-docs/edge-cases.md');

  console.log('📋 ALL SECTIONS WITH ROLE ANALYSIS:');
  console.log('===================================');
  sections.forEach((section, i) => {
    const roleText = section.roles ? `[${section.roles.join(', ')}]` : '[NO ROLES]';
    const indent = '  '.repeat(Math.max(0, section.level - 1));
    console.log(`${i + 1}. ${indent}${section.title} ${roleText}`);
  });

  console.log('\n🧪 EDGE CASE 1: Unmarked Sections');
  console.log('=================================');
  const unmarkedSections = MarkdownReader.getUnassignedSections(sections);
  console.log(`Found ${unmarkedSections.length} sections with no role assignments:\n`);

  unmarkedSections.forEach((section, i) => {
    console.log(`${i + 1}. ${section.title}`);
    console.log(`   Status: Visible to ALL users (not filtered by role)`);
    console.log(`   Access: General public access\n`);
  });

  console.log('🧪 EDGE CASE 2: Sections for Both Roles');
  console.log('=======================================');
  const sharedSections = MarkdownReader.getSharedSections(sections);
  console.log(`Found ${sharedSections.length} sections explicitly marked for BOTH roles:\n`);

  sharedSections.forEach((section, i) => {
    console.log(`${i + 1}. ${section.title}`);
    console.log(`   Roles: [${section.roles.join(', ')}]`);
    console.log(`   Access: Both coordinator AND executor can see this\n`);
  });

  console.log('🧪 EDGE CASE 3: Unknown/Invalid Roles');
  console.log('=====================================');
  const unknownRoleSections = MarkdownReader.getUnknownRoleSections(sections);
  console.log(`Found ${unknownRoleSections.length} sections with non-standard roles:\n`);

  unknownRoleSections.forEach((section, i) => {
    console.log(`${i + 1}. ${section.title}`);
    console.log(`   Roles: [${section.roles.join(', ')}]`);
    console.log(`   Status: NOT visible to coordinator or executor filters`);
    console.log(`   Effect: Acts like unmarked section for standard roles\n`);
  });

  console.log('🧪 EDGE CASE 4: Filter Behavior Test');
  console.log('====================================');

  const coordinatorSections = MarkdownReader.filterCoordinatorSections(sections);
  const executorSections = MarkdownReader.filterExecutorSections(sections);

  console.log(`Coordinator filter finds: ${coordinatorSections.length} sections`);
  console.log(`Executor filter finds: ${executorSections.length} sections`);
  console.log(`Unmarked sections: ${unmarkedSections.length} (invisible to role filters)`);
  console.log(`Unknown role sections: ${unknownRoleSections.length} (invisible to role filters)`);

  console.log('\n📊 WHAT EACH ROLE ACTUALLY SEES:');
  console.log('=================================');

  console.log('\n👥 COORDINATOR VIEW:');
  console.log('-------------------');
  coordinatorSections.forEach((section, i) => {
    console.log(`${i + 1}. ${section.title} [${section.roles.join(', ')}]`);
  });

  console.log('\n⚙️ EXECUTOR VIEW:');
  console.log('----------------');
  executorSections.forEach((section, i) => {
    console.log(`${i + 1}. ${section.title} [${section.roles.join(', ')}]`);
  });

  console.log('\n🔓 GENERAL/PUBLIC VIEW (Unmarked + Unknown roles):');
  console.log('==================================================');
  const publicSections = [...unmarkedSections, ...unknownRoleSections];
  publicSections.forEach((section, i) => {
    const roleText = section.roles ? `[${section.roles.join(', ')}]` : '[no roles]';
    console.log(`${i + 1}. ${section.title} ${roleText}`);
  });

  console.log('\n🧪 EDGE CASE 5: Case Sensitivity Test');
  console.log('=====================================');
  const caseSensitiveSection = sections.find(s => s.title === 'Case Sensitivity Test');
  if (caseSensitiveSection) {
    console.log(`Section: "${caseSensitiveSection.title}"`);
    console.log(`Detected roles: [${caseSensitiveSection.roles.join(', ')}]`);
    console.log(`Result: Case-insensitive matching ${caseSensitiveSection.roles.includes('coordinator') ? 'WORKS' : 'FAILED'}`);
  }

  console.log('\n📈 FINAL STATISTICS:');
  console.log('====================');
  console.log(`Total sections: ${sections.length}`);
  console.log(`Coordinator-accessible: ${coordinatorSections.length}`);
  console.log(`Executor-accessible: ${executorSections.length}`);
  console.log(`Shared (both roles): ${sharedSections.length}`);
  console.log(`Unmarked (public): ${unmarkedSections.length}`);
  console.log(`Unknown roles: ${unknownRoleSections.length}`);

  console.log('\n✅ Edge case testing completed!');
}

testEdgeCases();