const fs = require('fs').promises;
const path = require('path');

// Section 4: Caching test for markdown reader
class MarkdownReader {
  static cache = new Map();
  static cacheMaxAge = 5 * 60 * 1000; // 5 minutes

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
    try {
      const stats = await fs.stat(filePath);
      const lastModified = stats.mtime.getTime();
      const now = Date.now();

      const cached = this.cache.get(filePath);
      if (cached &&
          cached.lastModified === lastModified &&
          (now - cached.cachedAt) < this.cacheMaxAge) {
        console.log(`🔄 Cache Hit: Using cached data for "${filePath}"`);
        return cached.sections;
      }

      console.log(`📖 Reading: "${filePath}" ${cached ? '(cache expired/outdated)' : '(not cached)'}`);
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
      if (error.code === 'ENOENT') {
        console.log(`📋 Missing File Helper: "${filePath}" was not found.`);
      }
      throw error;
    }
  }

  static clearCache() {
    this.cache.clear();
    console.log(`🗑️ Cache cleared: All cached entries removed`);
  }

  static getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  static setCacheMaxAge(milliseconds) {
    this.cacheMaxAge = milliseconds;
    console.log(`⏰ Cache max age set to ${milliseconds}ms (${Math.round(milliseconds / 1000)}s)`);
  }
}

async function testCaching() {
  console.log('=== Exercise 1 - Section 4: Caching Test ===\n');

  // Test 1: First read (no cache)
  console.log('🧪 Test 1: First read (should read from disk)');
  console.log('------------------------------------------------');
  const start1 = Date.now();
  await MarkdownReader.readFile('./test-docs/project-overview.md');
  const time1 = Date.now() - start1;
  console.log(`⏱️ Time: ${time1}ms\n`);

  // Test 2: Second read (should use cache)
  console.log('🧪 Test 2: Second read (should use cache)');
  console.log('------------------------------------------------');
  const start2 = Date.now();
  await MarkdownReader.readFile('./test-docs/project-overview.md');
  const time2 = Date.now() - start2;
  console.log(`⏱️ Time: ${time2}ms\n`);

  // Test 3: Cache stats
  console.log('🧪 Test 3: Cache statistics');
  console.log('------------------------------------------------');
  const stats = MarkdownReader.getCacheStats();
  console.log(`📊 Cache size: ${stats.size}`);
  console.log(`📂 Cached files: ${stats.entries.join(', ')}\n`);

  // Test 4: Multiple files
  console.log('🧪 Test 4: Reading multiple files');
  console.log('------------------------------------------------');
  const multiStart = Date.now();
  await MarkdownReader.readFile('./test-docs/api-documentation.md');
  await MarkdownReader.readFile('./test-docs/configuration.md');
  await MarkdownReader.readFile('./test-docs/project-overview.md'); // Should be cached
  const multiTime = Date.now() - multiStart;
  console.log(`⏱️ Total time for 3 files: ${multiTime}ms\n`);

  const finalStats = MarkdownReader.getCacheStats();
  console.log(`📊 Final cache size: ${finalStats.size}`);

  // Test 5: Cache expiration
  console.log('\n🧪 Test 5: Cache expiration (setting 1 second max age)');
  console.log('------------------------------------------------');
  MarkdownReader.setCacheMaxAge(1000); // 1 second

  await new Promise(resolve => setTimeout(resolve, 1100)); // Wait 1.1 seconds

  console.log('After waiting 1.1 seconds:');
  await MarkdownReader.readFile('./test-docs/project-overview.md'); // Should re-read

  // Test 6: Cache clearing
  console.log('\n🧪 Test 6: Cache clearing');
  console.log('------------------------------------------------');
  MarkdownReader.clearCache();
  const emptyStats = MarkdownReader.getCacheStats();
  console.log(`📊 Cache size after clear: ${emptyStats.size}`);

  console.log('\n🎉 Caching tests completed!');
  console.log(`⚡ Performance improvement: ${Math.round((1 - time2/time1) * 100)}% faster on cache hit`);
}

testCaching();