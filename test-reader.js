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

async function testMarkdownReader() {
  try {
    const sections = await MarkdownReader.readFile('./test-sample.md');

    console.log('Parsed sections:');
    sections.forEach((section, index) => {
      console.log(`\n${index + 1}. Level ${section.level}: "${section.title}"`);
      console.log(`   Lines ${section.startLine}-${section.endLine}`);
      console.log(`   Content preview: ${section.content.substring(0, 50)}...`);
    });
  } catch (error) {
    console.error('Error reading markdown file:', error);
  }
}

testMarkdownReader();