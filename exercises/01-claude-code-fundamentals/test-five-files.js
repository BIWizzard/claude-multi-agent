const fs = require('fs').promises;
const path = require('path');

// Section 4: Five-file test for context management
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

async function testFiveFiles() {
  console.log('=== Exercise 1 - Section 4: Five-File Test ===\n');

  try {
    const files = await MarkdownReader.readDirectory('./test-docs');
    console.log(`✅ Successfully found ${files.length} markdown files\n`);

    let totalSections = 0;
    files.forEach(file => {
      console.log(`📄 ${file.fileName} - ${file.sections.length} sections`);
      totalSections += file.sections.length;
    });

    console.log(`\n📊 Success Metrics:`);
    console.log(`   Files processed: ${files.length}`);
    console.log(`   Total sections: ${totalSections}`);
    console.log(`   Average sections per file: ${(totalSections / files.length).toFixed(1)}`);

    console.log('\n--- Merged Hierarchy Preview ---');
    const merged = MarkdownReader.mergeFiles(files);
    merged.slice(0, 15).forEach((section, i) => {
      const indent = '  '.repeat(Math.max(0, section.level - 1));
      console.log(`${i + 1}. ${indent}${section.title} (L${section.level})`);
    });

    if (merged.length > 15) {
      console.log(`... and ${merged.length - 15} more sections`);
    }

    console.log(`\n✅ Five-file test completed successfully!`);

  } catch (error) {
    console.error('❌ Error in five-file test:', error);
  }
}

testFiveFiles();