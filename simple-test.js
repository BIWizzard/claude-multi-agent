const fs = require('fs').promises;

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

        currentSection = {
          level: headerMatch[1].length,
          title: headerMatch[2].trim(),
          content: '',
          startLine: index
        };
      } else if (currentSection) {
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

  static async readFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    return this.parseFile(content);
  }
}

// Simple test function
async function runTest() {
  console.log('Testing Markdown Reader with example.md\n');

  const sections = await MarkdownReader.readFile('./example.md');

  console.log(`Found ${sections.length} sections:\n`);

  sections.forEach((section, i) => {
    console.log(`${i + 1}. ${'  '.repeat(section.level - 1)}${section.title} (Level ${section.level})`);
  });

  console.log('\nDetailed view of first section:');
  if (sections[0]) {
    console.log(`Title: ${sections[0].title}`);
    console.log(`Content: ${sections[0].content.trim()}`);
  }
}

runTest().catch(console.error);