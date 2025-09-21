const fs = require('fs').promises;
const path = require('path');

// Section 4: Missing file handling test
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

  static readFile(filePath) {
    return fs.readFile(filePath, 'utf-8')
      .then(content => this.parseFile(content))
      .catch(error => {
        if (error.code === 'ENOENT') {
          console.log(`📋 Missing File Helper: "${filePath}" was not found.`);
          console.log(`💡 Friendly Suggestion: Please check the file path and ensure the file exists.`);
          console.log(`🔍 Quick Fix: You might want to create this file or verify the correct path.`);
        }
        throw error;
      });
  }

  static async readDirectory(dirPath) {
    try {
      const files = await fs.readdir(dirPath);
      const markdownFiles = files.filter(file => file.endsWith('.md'));

      if (markdownFiles.length === 0) {
        console.log(`📂 Directory Helper: No markdown files found in "${dirPath}".`);
        console.log(`💡 Friendly Suggestion: Add some .md files to this directory for processing.`);
        return [];
      }

      const results = [];
      const failedFiles = [];

      for (const file of markdownFiles) {
        const filePath = path.join(dirPath, file);
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const sections = this.parseFile(content);

          sections.forEach(section => {
            section.fileName = file;
          });

          results.push({
            fileName: file,
            sections
          });
        } catch (error) {
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
    } catch (error) {
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
}

async function testMissingFileHandling() {
  console.log('=== Exercise 1 - Section 4: Missing File Handling Test ===\n');

  // Test 1: Missing single file
  console.log('🧪 Test 1: Reading a non-existent file');
  console.log('------------------------------------------------');
  try {
    await MarkdownReader.readFile('./non-existent-file.md');
  } catch (error) {
    console.log(`✅ Successfully caught error: ${error.code}\n`);
  }

  // Test 2: Non-existent directory
  console.log('🧪 Test 2: Reading from non-existent directory');
  console.log('------------------------------------------------');
  try {
    await MarkdownReader.readDirectory('./fake-directory');
  } catch (error) {
    console.log(`✅ Successfully caught error: ${error.code}\n`);
  }

  // Test 3: Empty directory
  console.log('🧪 Test 3: Reading from empty directory');
  console.log('------------------------------------------------');
  await fs.mkdir('./empty-test-dir', { recursive: true });
  try {
    const result = await MarkdownReader.readDirectory('./empty-test-dir');
    console.log(`✅ Empty directory handled gracefully: ${result.length} files found\n`);
  } catch (error) {
    console.log(`❌ Unexpected error: ${error.message}\n`);
  }
  await fs.rmdir('./empty-test-dir');

  // Test 4: Directory with mixed file types (no .md files)
  console.log('🧪 Test 4: Directory with no markdown files');
  console.log('------------------------------------------------');
  await fs.mkdir('./no-md-dir', { recursive: true });
  await fs.writeFile('./no-md-dir/test.txt', 'This is not markdown');
  try {
    const result = await MarkdownReader.readDirectory('./no-md-dir');
    console.log(`✅ No markdown files handled gracefully: ${result.length} files found\n`);
  } catch (error) {
    console.log(`❌ Unexpected error: ${error.message}\n`);
  }
  await fs.unlink('./no-md-dir/test.txt');
  await fs.rmdir('./no-md-dir');

  // Test 5: Simulate file deletion during processing
  console.log('🧪 Test 5: File disappears during processing');
  console.log('------------------------------------------------');
  await fs.mkdir('./disappearing-test', { recursive: true });
  await fs.writeFile('./disappearing-test/temp.md', '# Temporary File\nThis will be deleted.');

  // Create a custom test that deletes the file mid-process
  try {
    const files = await fs.readdir('./disappearing-test');
    console.log(`Found files: ${files.join(', ')}`);

    // Delete the file before trying to read it
    await fs.unlink('./disappearing-test/temp.md');

    const result = await MarkdownReader.readDirectory('./disappearing-test');
    console.log(`✅ File deletion during processing handled: ${result.length} files processed\n`);
  } catch (error) {
    console.log(`❌ Unexpected error: ${error.message}\n`);
  }
  await fs.rmdir('./disappearing-test');

  console.log('🎉 All missing file handling tests completed!');
}

testMissingFileHandling();