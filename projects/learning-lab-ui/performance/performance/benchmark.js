#!/usr/bin/env node

/**
 * Performance Benchmarking Tool
 * Compares Alpine.js vs Astro implementations
 */

import { chromium } from 'playwright';
import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const BENCHMARK_CONFIG = {
  urls: {
    alpine: 'http://localhost:3000', // Original Alpine.js implementation
    astro: 'http://localhost:4321'   // New Astro implementation
  },
  iterations: 5,
  timeout: 30000,
  devices: [
    { name: 'Desktop', viewport: { width: 1920, height: 1080 } },
    { name: 'Tablet', viewport: { width: 768, height: 1024 } },
    { name: 'Mobile', viewport: { width: 375, height: 667 } }
  ]
};

class PerformanceBenchmark {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      config: BENCHMARK_CONFIG,
      alpine: {},
      astro: {},
      comparison: {}
    };
  }

  async run() {
    console.log('🚀 Starting Performance Benchmark...');
    console.log(`Iterations: ${BENCHMARK_CONFIG.iterations}`);
    console.log(`Devices: ${BENCHMARK_CONFIG.devices.map(d => d.name).join(', ')}`);

    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      // Benchmark Alpine.js implementation
      console.log('\n📊 Benchmarking Alpine.js implementation...');
      this.results.alpine = await this.benchmarkImplementation(
        browser,
        BENCHMARK_CONFIG.urls.alpine,
        'alpine'
      );

      // Benchmark Astro implementation
      console.log('\n📊 Benchmarking Astro implementation...');
      this.results.astro = await this.benchmarkImplementation(
        browser,
        BENCHMARK_CONFIG.urls.astro,
        'astro'
      );

      // Generate comparison
      this.generateComparison();

      // Save results
      this.saveResults();

      // Display summary
      this.displaySummary();

    } catch (error) {
      console.error('Benchmark failed:', error);
    } finally {
      await browser.close();
    }
  }

  async benchmarkImplementation(browser, url, name) {
    const results = {
      name,
      url,
      devices: {}
    };

    for (const device of BENCHMARK_CONFIG.devices) {
      console.log(`  📱 Testing ${device.name}...`);

      const deviceResults = {
        device: device.name,
        viewport: device.viewport,
        iterations: []
      };

      for (let i = 0; i < BENCHMARK_CONFIG.iterations; i++) {
        console.log(`    Iteration ${i + 1}/${BENCHMARK_CONFIG.iterations}`);

        const page = await browser.newPage();
        await page.setViewportSize(device.viewport);

        try {
          const metrics = await this.measurePagePerformance(page, url);
          deviceResults.iterations.push(metrics);
        } catch (error) {
          console.error(`    Failed iteration ${i + 1}:`, error.message);
          deviceResults.iterations.push({ error: error.message });
        } finally {
          await page.close();
        }
      }

      // Calculate averages for this device
      deviceResults.averages = this.calculateAverages(deviceResults.iterations);
      results.devices[device.name] = deviceResults;
    }

    return results;
  }

  async measurePagePerformance(page, url) {
    const startTime = Date.now();

    // Navigate and wait for load
    await page.goto(url, { waitUntil: 'networkidle' });

    // Inject Web Vitals measurement
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const metrics = {};

        // Performance observer for paint metrics
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.name === 'first-contentful-paint') {
                metrics.fcp = entry.startTime;
              }
              if (entry.entryType === 'largest-contentful-paint') {
                metrics.lcp = entry.startTime;
              }
            }
          });

          observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        }

        // Navigation timing
        const navigation = performance.getEntriesByType('navigation')[0];
        metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
        metrics.loadComplete = navigation.loadEventEnd - navigation.fetchStart;
        metrics.ttfb = navigation.responseStart - navigation.fetchStart;

        // Resource timing
        const resources = performance.getEntriesByType('resource');
        const totalSize = resources.reduce((sum, resource) => {
          return sum + (resource.transferSize || 0);
        }, 0);
        metrics.totalTransferSize = totalSize;
        metrics.resourceCount = resources.length;

        // Memory info (if available)
        if (performance.memory) {
          metrics.memoryUsed = performance.memory.usedJSHeapSize;
          metrics.memoryTotal = performance.memory.totalJSHeapSize;
        }

        setTimeout(() => resolve(metrics), 1000);
      });
    });

    // Lighthouse metrics simulation
    const lighthouseMetrics = await page.evaluate(() => {
      const score = {
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0
      };

      // Basic performance scoring
      const navigation = performance.getEntriesByType('navigation')[0];
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;

      if (loadTime < 1000) score.performance = 100;
      else if (loadTime < 2000) score.performance = 90;
      else if (loadTime < 3000) score.performance = 75;
      else score.performance = 50;

      // Basic accessibility scoring (simplified)
      const hasAltTags = document.querySelectorAll('img[alt]').length;
      const totalImages = document.querySelectorAll('img').length;
      score.accessibility = totalImages > 0 ? (hasAltTags / totalImages) * 100 : 100;

      // Basic SEO scoring
      const hasTitle = !!document.title;
      const hasMetaDescription = !!document.querySelector('meta[name="description"]');
      const hasH1 = !!document.querySelector('h1');
      score.seo = (hasTitle + hasMetaDescription + hasH1) / 3 * 100;

      // Best practices (simplified)
      const hasHttps = location.protocol === 'https:';
      const hasViewport = !!document.querySelector('meta[name="viewport"]');
      score.bestPractices = (hasHttps + hasViewport) / 2 * 100;

      return score;
    });

    // Cumulative Layout Shift measurement
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;

        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
          });

          observer.observe({ entryTypes: ['layout-shift'] });
          setTimeout(() => resolve(clsValue), 2000);
        } else {
          resolve(0);
        }
      });
    });

    const endTime = Date.now();

    return {
      timestamp: new Date().toISOString(),
      url,
      totalTime: endTime - startTime,
      webVitals: {
        ...webVitals,
        cls
      },
      lighthouse: lighthouseMetrics,
      bundleAnalysis: await this.analyzeBundleSize(page)
    };
  }

  async analyzeBundleSize(page) {
    return await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');

      const analysis = {
        total: 0,
        javascript: 0,
        css: 0,
        images: 0,
        fonts: 0,
        other: 0,
        files: []
      };

      resources.forEach(resource => {
        const size = resource.transferSize || 0;
        analysis.total += size;

        const url = resource.name;
        const extension = url.split('.').pop()?.toLowerCase();

        if (extension === 'js') {
          analysis.javascript += size;
        } else if (extension === 'css') {
          analysis.css += size;
        } else if (['png', 'jpg', 'jpeg', 'webp', 'avif', 'svg'].includes(extension)) {
          analysis.images += size;
        } else if (['woff', 'woff2', 'ttf', 'otf'].includes(extension)) {
          analysis.fonts += size;
        } else {
          analysis.other += size;
        }

        analysis.files.push({
          url: url.split('/').pop(),
          size,
          type: extension || 'unknown'
        });
      });

      return analysis;
    });
  }

  calculateAverages(iterations) {
    const validIterations = iterations.filter(iter => !iter.error);

    if (validIterations.length === 0) {
      return { error: 'No valid iterations' };
    }

    const averages = {
      count: validIterations.length,
      totalTime: 0,
      webVitals: {
        fcp: 0,
        lcp: 0,
        cls: 0,
        domContentLoaded: 0,
        loadComplete: 0,
        ttfb: 0,
        totalTransferSize: 0
      },
      lighthouse: {
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0
      },
      bundleAnalysis: {
        total: 0,
        javascript: 0,
        css: 0,
        images: 0
      }
    };

    validIterations.forEach(iteration => {
      averages.totalTime += iteration.totalTime;

      Object.keys(averages.webVitals).forEach(key => {
        averages.webVitals[key] += iteration.webVitals[key] || 0;
      });

      Object.keys(averages.lighthouse).forEach(key => {
        averages.lighthouse[key] += iteration.lighthouse[key] || 0;
      });

      Object.keys(averages.bundleAnalysis).forEach(key => {
        averages.bundleAnalysis[key] += iteration.bundleAnalysis[key] || 0;
      });
    });

    // Calculate averages
    const count = validIterations.length;
    averages.totalTime /= count;

    Object.keys(averages.webVitals).forEach(key => {
      averages.webVitals[key] /= count;
    });

    Object.keys(averages.lighthouse).forEach(key => {
      averages.lighthouse[key] /= count;
    });

    Object.keys(averages.bundleAnalysis).forEach(key => {
      averages.bundleAnalysis[key] /= count;
    });

    return averages;
  }

  generateComparison() {
    this.results.comparison = {
      improvements: {},
      summary: {}
    };

    BENCHMARK_CONFIG.devices.forEach(device => {
      const deviceName = device.name;
      const alpineData = this.results.alpine.devices[deviceName]?.averages;
      const astroData = this.results.astro.devices[deviceName]?.averages;

      if (!alpineData || !astroData) return;

      const improvements = {
        totalTime: this.calculateImprovement(alpineData.totalTime, astroData.totalTime),
        bundleSize: this.calculateImprovement(alpineData.bundleAnalysis.total, astroData.bundleAnalysis.total),
        fcp: this.calculateImprovement(alpineData.webVitals.fcp, astroData.webVitals.fcp),
        lcp: this.calculateImprovement(alpineData.webVitals.lcp, astroData.webVitals.lcp),
        lighthouse: this.calculateImprovement(alpineData.lighthouse.performance, astroData.lighthouse.performance, true)
      };

      this.results.comparison.improvements[deviceName] = improvements;
    });

    // Overall summary
    const overallImprovements = Object.values(this.results.comparison.improvements);
    this.results.comparison.summary = {
      avgBundleSizeReduction: this.average(overallImprovements.map(i => i.bundleSize.percentage)),
      avgLoadTimeImprovement: this.average(overallImprovements.map(i => i.totalTime.percentage)),
      avgLighthouseImprovement: this.average(overallImprovements.map(i => i.lighthouse.percentage))
    };
  }

  calculateImprovement(baseline, optimized, higherIsBetter = false) {
    const improvement = higherIsBetter
      ? ((optimized - baseline) / baseline) * 100
      : ((baseline - optimized) / baseline) * 100;

    return {
      baseline,
      optimized,
      absolute: baseline - optimized,
      percentage: improvement,
      status: improvement > 0 ? 'improved' : 'regressed'
    };
  }

  average(numbers) {
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  saveResults() {
    const fileName = `benchmark-results-${Date.now()}.json`;
    const filePath = join(__dirname, fileName);

    writeFileSync(filePath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Results saved to: ${fileName}`);

    // Also save a summary CSV
    this.saveCsvSummary();
  }

  saveCsvSummary() {
    const csvLines = ['Device,Implementation,Load Time (ms),Bundle Size (KB),FCP (ms),LCP (ms),Lighthouse Score'];

    BENCHMARK_CONFIG.devices.forEach(device => {
      const deviceName = device.name;

      // Alpine.js data
      const alpineData = this.results.alpine.devices[deviceName]?.averages;
      if (alpineData) {
        csvLines.push([
          deviceName,
          'Alpine.js',
          Math.round(alpineData.totalTime),
          Math.round(alpineData.bundleAnalysis.total / 1024),
          Math.round(alpineData.webVitals.fcp),
          Math.round(alpineData.webVitals.lcp),
          Math.round(alpineData.lighthouse.performance)
        ].join(','));
      }

      // Astro data
      const astroData = this.results.astro.devices[deviceName]?.averages;
      if (astroData) {
        csvLines.push([
          deviceName,
          'Astro',
          Math.round(astroData.totalTime),
          Math.round(astroData.bundleAnalysis.total / 1024),
          Math.round(astroData.webVitals.fcp),
          Math.round(astroData.webVitals.lcp),
          Math.round(astroData.lighthouse.performance)
        ].join(','));
      }
    });

    const csvContent = csvLines.join('\n');
    const csvFileName = `benchmark-summary-${Date.now()}.csv`;
    const csvPath = join(__dirname, csvFileName);

    writeFileSync(csvPath, csvContent);
    console.log(`📊 CSV summary saved to: ${csvFileName}`);
  }

  displaySummary() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 PERFORMANCE BENCHMARK SUMMARY');
    console.log('='.repeat(60));

    const summary = this.results.comparison.summary;

    console.log(`\n📈 Overall Improvements:`);
    console.log(`  Bundle Size Reduction: ${summary.avgBundleSizeReduction.toFixed(1)}%`);
    console.log(`  Load Time Improvement: ${summary.avgLoadTimeImprovement.toFixed(1)}%`);
    console.log(`  Lighthouse Score Boost: ${summary.avgLighthouseImprovement.toFixed(1)}%`);

    console.log(`\n📱 Device-specific Results:`);

    BENCHMARK_CONFIG.devices.forEach(device => {
      const deviceName = device.name;
      const improvements = this.results.comparison.improvements[deviceName];

      if (!improvements) return;

      console.log(`\n  ${deviceName}:`);
      console.log(`    Bundle Size: ${improvements.bundleSize.percentage.toFixed(1)}% reduction`);
      console.log(`    Load Time: ${improvements.totalTime.percentage.toFixed(1)}% faster`);
      console.log(`    FCP: ${improvements.fcp.percentage.toFixed(1)}% improvement`);
      console.log(`    LCP: ${improvements.lcp.percentage.toFixed(1)}% improvement`);
      console.log(`    Lighthouse: ${improvements.lighthouse.percentage.toFixed(1)}% increase`);
    });

    console.log('\n✅ Benchmark completed successfully!');
    console.log('Check the generated files for detailed results.');
  }
}

// Run benchmark if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const benchmark = new PerformanceBenchmark();
  benchmark.run().catch(console.error);
}

export default PerformanceBenchmark;