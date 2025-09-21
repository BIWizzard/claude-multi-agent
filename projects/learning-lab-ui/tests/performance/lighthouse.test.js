import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test.describe('Lighthouse Audits', () => {
    test('should meet performance benchmarks on homepage', async ({ page, context }) => {
      // Enable performance metrics collection
      await context.addInitScript(() => {
        window.performance.mark('test-start');
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Measure Core Web Vitals
      const webVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const metrics = {};

          // Largest Contentful Paint
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // First Input Delay (simulated)
          metrics.fid = 0; // Will be 0 in tests since there's no real user interaction delay

          // Cumulative Layout Shift
          let cumulativeLayoutShift = 0;
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!entry.hadRecentInput) {
                cumulativeLayoutShift += entry.value;
              }
            }
            metrics.cls = cumulativeLayoutShift;
          }).observe({ entryTypes: ['layout-shift'] });

          // Navigation timing
          const navigation = performance.getEntriesByType('navigation')[0];
          metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
          metrics.loadComplete = navigation.loadEventEnd - navigation.loadEventStart;
          metrics.ttfb = navigation.responseStart - navigation.requestStart;

          // Give metrics time to collect
          setTimeout(() => {
            resolve(metrics);
          }, 2000);
        });
      });

      // Assert performance benchmarks
      expect(webVitals.lcp).toBeLessThan(2500); // LCP should be under 2.5s
      expect(webVitals.cls).toBeLessThan(0.1); // CLS should be under 0.1
      expect(webVitals.ttfb).toBeLessThan(800); // TTFB should be under 800ms
      expect(webVitals.domContentLoaded).toBeLessThan(1500); // DOM ready under 1.5s

      console.log('Performance Metrics:', {
        'LCP (Largest Contentful Paint)': `${webVitals.lcp}ms`,
        'CLS (Cumulative Layout Shift)': webVitals.cls,
        'TTFB (Time to First Byte)': `${webVitals.ttfb}ms`,
        'DOM Content Loaded': `${webVitals.domContentLoaded}ms`,
        'Load Complete': `${webVitals.loadComplete}ms`
      });
    });

    test('should meet performance benchmarks on exercise page', async ({ page }) => {
      await page.goto('/');
      await page.click('.exercise-card .btn-primary');
      await page.waitForSelector('.section-content', { state: 'visible' });
      await page.waitForLoadState('networkidle');

      const metrics = await page.evaluate(() => {
        return {
          // Measure render time for section content
          sectionRenderStart: performance.now(),
          // Memory usage (if available)
          memoryUsage: performance.memory ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          } : null,
          // Resource timing
          resources: performance.getEntriesByType('resource').length
        };
      });

      // Memory usage should be reasonable
      if (metrics.memoryUsage) {
        const memoryUsageMB = metrics.memoryUsage.usedJSHeapSize / 1024 / 1024;
        expect(memoryUsageMB).toBeLessThan(50); // Should use less than 50MB
      }

      // Should not load excessive resources
      expect(metrics.resources).toBeLessThan(20);

      console.log('Exercise Page Metrics:', {
        'Memory Usage': metrics.memoryUsage ? `${(metrics.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB` : 'Not available',
        'Resources Loaded': metrics.resources
      });
    });
  });

  test.describe('Load Testing', () => {
    test('should handle rapid navigation', async ({ page }) => {
      await page.goto('/');

      const startTime = performance.now();

      // Rapidly navigate between sections
      for (let i = 0; i < 5; i++) {
        await page.click('.exercise-card .btn-primary');
        await page.waitForSelector('.section-content', { state: 'visible' });

        // Navigate through sections
        const nextButton = page.locator('.section-navigation .btn-primary');
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(100);
        }

        await page.click('button:has-text("Overview")');
        await page.waitForTimeout(100);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete rapid navigation in reasonable time
      expect(totalTime).toBeLessThan(10000); // Under 10 seconds

      console.log(`Rapid navigation completed in ${totalTime.toFixed(2)}ms`);
    });

    test('should handle multiple localStorage operations', async ({ page }) => {
      await page.goto('/');
      await page.click('.exercise-card .btn-primary');
      await page.waitForSelector('.section-content', { state: 'visible' });

      const startTime = performance.now();

      // Perform multiple progress updates
      await page.evaluate(() => {
        for (let i = 0; i < 100; i++) {
          const progress = {
            [`test-exercise-${i}`]: {
              sections: {
                [`section-${i}`]: {
                  viewed: true,
                  viewedAt: new Date().toISOString(),
                  completed: i % 2 === 0,
                  completedAt: i % 2 === 0 ? new Date().toISOString() : null
                }
              },
              lastViewed: `section-${i}`
            }
          };
          localStorage.setItem(`test-progress-${i}`, JSON.stringify(progress));
        }
      });

      const endTime = performance.now();
      const storageTime = endTime - startTime;

      // Should handle localStorage operations efficiently
      expect(storageTime).toBeLessThan(1000); // Under 1 second

      console.log(`100 localStorage operations completed in ${storageTime.toFixed(2)}ms`);
    });
  });

  test.describe('Bundle Size Analysis', () => {
    test('should not load excessive JavaScript', async ({ page }) => {
      // Track all JavaScript files loaded
      const jsFiles = [];
      page.on('response', response => {
        if (response.url().includes('.js') && response.status() === 200) {
          jsFiles.push({
            url: response.url(),
            size: response.headers()['content-length']
          });
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Calculate total JS size
      let totalJSSize = 0;
      jsFiles.forEach(file => {
        if (file.size) {
          totalJSSize += parseInt(file.size);
        }
      });

      // Should keep JavaScript bundle under reasonable size
      const totalSizeKB = totalJSSize / 1024;
      expect(totalSizeKB).toBeLessThan(500); // Under 500KB total

      console.log('JavaScript Bundle Analysis:', {
        'Total Files': jsFiles.length,
        'Total Size': `${totalSizeKB.toFixed(2)}KB`,
        'Files': jsFiles.map(f => ({ url: f.url.split('/').pop(), size: f.size }))
      });
    });

    test('should not load excessive CSS', async ({ page }) => {
      const cssFiles = [];
      page.on('response', response => {
        if (response.url().includes('.css') && response.status() === 200) {
          cssFiles.push({
            url: response.url(),
            size: response.headers()['content-length']
          });
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      let totalCSSSize = 0;
      cssFiles.forEach(file => {
        if (file.size) {
          totalCSSSize += parseInt(file.size);
        }
      });

      const totalSizeKB = totalCSSSize / 1024;
      expect(totalSizeKB).toBeLessThan(100); // Under 100KB total CSS

      console.log('CSS Bundle Analysis:', {
        'Total Files': cssFiles.length,
        'Total Size': `${totalSizeKB.toFixed(2)}KB`
      });
    });
  });

  test.describe('Memory Leak Detection', () => {
    test('should not leak memory during exercise navigation', async ({ page }) => {
      if (!await page.evaluate(() => 'performance' in window && 'memory' in performance)) {
        test.skip('Performance memory API not available');
      }

      await page.goto('/');

      const initialMemory = await page.evaluate(() => performance.memory.usedJSHeapSize);

      // Navigate through exercises multiple times
      for (let i = 0; i < 10; i++) {
        await page.click('.exercise-card .btn-primary');
        await page.waitForSelector('.section-content', { state: 'visible' });

        // Navigate between sections
        const nextButton = page.locator('.section-navigation .btn-primary');
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(100);
        }

        await page.click('button:has-text("Overview")');
        await page.waitForTimeout(100);

        // Force garbage collection if available
        await page.evaluate(() => {
          if (window.gc) {
            window.gc();
          }
        });
      }

      const finalMemory = await page.evaluate(() => performance.memory.usedJSHeapSize);
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

      // Memory increase should be minimal
      expect(memoryIncreaseMB).toBeLessThan(10); // Less than 10MB increase

      console.log('Memory Usage:', {
        'Initial': `${(initialMemory / 1024 / 1024).toFixed(2)}MB`,
        'Final': `${(finalMemory / 1024 / 1024).toFixed(2)}MB`,
        'Increase': `${memoryIncreaseMB.toFixed(2)}MB`
      });
    });
  });

  test.describe('Image Optimization', () => {
    test('should not load excessive images', async ({ page }) => {
      const imageRequests = [];
      page.on('response', response => {
        const url = response.url();
        if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
          imageRequests.push({
            url,
            size: response.headers()['content-length'],
            status: response.status()
          });
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Should not load too many images
      expect(imageRequests.length).toBeLessThan(10);

      let totalImageSize = 0;
      imageRequests.forEach(img => {
        if (img.size) {
          totalImageSize += parseInt(img.size);
        }
      });

      const totalSizeKB = totalImageSize / 1024;
      expect(totalSizeKB).toBeLessThan(500); // Under 500KB total images

      console.log('Image Loading Analysis:', {
        'Total Images': imageRequests.length,
        'Total Size': `${totalSizeKB.toFixed(2)}KB`,
        'Failed Requests': imageRequests.filter(img => img.status !== 200).length
      });
    });
  });
});