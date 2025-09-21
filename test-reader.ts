import { MarkdownReader } from './src/markdown-reader.js';

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