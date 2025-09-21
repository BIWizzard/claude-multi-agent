const fs = require('fs').promises;
const path = require('path');

// Section 4: Context Management Implementation
// Testing multi-file markdown reading and merging

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

  static async readDirectory(dirPath) {
    const files = await fs.readdir(dirPath);
    const markdownFiles = files.filter(file => file.endsWith('.md'));

    const results = [];

    for (const file of markdownFiles) {
      const filePath = path.join(dirPath, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const sections = this.parseFile(content);

      sections.forEach(section => {
        section.fileName = file;
      });

      results.push({
        fileName: file,
        sections
      });
    }

    return results;
  }

  static mergeFiles(files) {
    const allSections = [];

    files.forEach(file => {
      allSections.push({
        level: 1,
        title: `📄 ${file.fileName}`,
        content: `Contents from ${file.fileName}`,
        startLine: 0,
        endLine: 0,
        fileName: file.fileName
      });

      file.sections.forEach(section => {
        allSections.push({
          ...section,
          level: section.level + 1
        });
      });
    });

    return allSections;
  }
}

async function testSection4MultiFile() {
  console.log('=== Exercise 1 - Section 4: Context Management Implementation ===\n');
  console.log('Testing multi-file markdown reading and merging...\n');

  try {
    const files = await MarkdownReader.readDirectory('./test-docs');
    console.log(`Found ${files.length} markdown files:\n`);

    files.forEach(file => {
      console.log(`📄 ${file.fileName} (${file.sections.length} sections)`);
    });

    console.log('\n--- Merged Structure ---\n');
    const merged = MarkdownReader.mergeFiles(files);

    merged.forEach((section, i) => {
      const indent = '  '.repeat(Math.max(0, section.level - 1));
      console.log(`${i + 1}. ${indent}${section.title} (Level ${section.level})`);
    });

    console.log('\n--- First File Detail ---\n');
    if (files[0]) {
      console.log(`File: ${files[0].fileName}`);
      files[0].sections.forEach(section => {
        console.log(`  • ${section.title}: ${section.content.substring(0, 50)}...`);
      });
    }

  } catch (error) {
    console.error('Error in Section 4 test:', error);
  }
}

testSection4MultiFile();