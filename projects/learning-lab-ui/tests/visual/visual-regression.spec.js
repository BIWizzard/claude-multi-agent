import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and set consistent viewport
    await page.evaluate(() => localStorage.clear());
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test.describe('Homepage Views', () => {
    test('should match homepage screenshot', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Wait for any animations to complete
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('homepage.png', {
        fullPage: true,
        threshold: 0.2, // Allow for small differences
        animations: 'disabled'
      });
    });

    test('should match homepage mobile view', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('homepage-mobile.png', {
        fullPage: true,
        threshold: 0.2,
        animations: 'disabled'
      });
    });

    test('should match homepage tablet view', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('homepage-tablet.png', {
        fullPage: true,
        threshold: 0.2,
        animations: 'disabled'
      });
    });
  });

  test.describe('Exercise Card States', () => {
    test('should match exercise card not-started state', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const exerciseCard = page.locator('.exercise-card').first();
      await expect(exerciseCard).toHaveScreenshot('exercise-card-not-started.png', {
        threshold: 0.2,
        animations: 'disabled'
      });
    });

    test('should match exercise card in-progress state', async ({ page }) => {
      // Set up progress data
      await page.evaluate(() => {
        const progress = {
          '01-fundamentals': {
            sections: {
              'overview': {
                viewed: true,
                completed: true,
                completedAt: '2025-01-01T00:01:00.000Z'
              }
            },
            lastViewed: 'setup'
          }
        };
        localStorage.setItem('learning-lab-progress', JSON.stringify(progress));
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const exerciseCard = page.locator('.exercise-card').first();
      await expect(exerciseCard).toHaveScreenshot('exercise-card-in-progress.png', {
        threshold: 0.2,
        animations: 'disabled'
      });
    });

    test('should match exercise card completed state', async ({ page }) => {
      // Set up completed progress data
      await page.evaluate(() => {
        const progress = {
          '01-fundamentals': {
            completed: true,
            completedAt: '2025-01-01T00:10:00.000Z',
            sections: {
              'overview': { viewed: true, completed: true },
              'setup': { viewed: true, completed: true },
              'context-management': { viewed: true, completed: true },
              'testing': { viewed: true, completed: true },
              'reflection': { viewed: true, completed: true }
            }
          }
        };
        localStorage.setItem('learning-lab-progress', JSON.stringify(progress));
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const exerciseCard = page.locator('.exercise-card').first();
      await expect(exerciseCard).toHaveScreenshot('exercise-card-completed.png', {
        threshold: 0.2,
        animations: 'disabled'
      });
    });
  });

  test.describe('Exercise Content Views', () => {
    test('should match exercise overview section', async ({ page }) => {
      await page.goto('/');
      await page.click('.exercise-card .btn-primary');
      await page.waitForSelector('.section-content', { state: 'visible' });
      await page.waitForLoadState('networkidle');

      // Wait for markdown content to render
      await page.waitForTimeout(1000);

      await expect(page.locator('.exercise-content')).toHaveScreenshot('exercise-overview.png', {
        threshold: 0.2,
        animations: 'disabled'
      });
    });

    test('should match exercise sidebar navigation', async ({ page }) => {
      await page.goto('/');
      await page.click('.exercise-card .btn-primary');
      await page.waitForSelector('.exercise-sidebar', { state: 'visible' });

      const sidebar = page.locator('.exercise-sidebar');
      await expect(sidebar).toHaveScreenshot('exercise-sidebar.png', {
        threshold: 0.2,
        animations: 'disabled'
      });
    });

    test('should match section navigation buttons', async ({ page }) => {
      await page.goto('/');
      await page.click('.exercise-card .btn-primary');
      await page.waitForSelector('.section-navigation', { state: 'visible' });

      const navigation = page.locator('.section-navigation');
      await expect(navigation).toHaveScreenshot('section-navigation.png', {
        threshold: 0.2,
        animations: 'disabled'
      });
    });
  });

  test.describe('Progress Indicators', () => {
    test('should match progress indicator states', async ({ page }) => {
      await page.goto('/');
      await page.click('.exercise-card .btn-primary');
      await page.waitForSelector('.progress-indicator', { state: 'visible' });

      const progressIndicator = page.locator('.progress-indicator');
      await expect(progressIndicator).toHaveScreenshot('progress-indicator-0-percent.png', {
        threshold: 0.2,
        animations: 'disabled'
      });
    });

    test('should match progress indicator with progress', async ({ page }) => {
      // Set up partial progress
      await page.evaluate(() => {
        const progress = {
          '01-fundamentals': {
            sections: {
              'overview': { viewed: true, completed: true },
              'setup': { viewed: true, completed: true }
            },
            lastViewed: 'context-management'
          }
        };
        localStorage.setItem('learning-lab-progress', JSON.stringify(progress));
      });

      await page.goto('/');
      await page.click('.exercise-card .btn-primary');
      await page.waitForSelector('.progress-indicator', { state: 'visible' });

      const progressIndicator = page.locator('.progress-indicator');
      await expect(progressIndicator).toHaveScreenshot('progress-indicator-partial.png', {
        threshold: 0.2,
        animations: 'disabled'
      });
    });
  });

  test.describe('Journey Tracking Views', () => {
    test('should match journey tracking panel', async ({ page }) => {
      await page.goto('/');
      await page.click('.exercise-card .btn-primary');
      await page.waitForSelector('.exercise-content', { state: 'visible' });

      await page.click('button:has-text("My Journey")');
      await page.waitForSelector('.journey-section', { state: 'visible' });

      await expect(page.locator('.journey-section')).toHaveScreenshot('journey-panel.png', {
        threshold: 0.2,
        animations: 'disabled'
      });
    });

    test('should match journey form with data', async ({ page }) => {
      await page.goto('/');
      await page.click('.exercise-card .btn-primary');
      await page.waitForSelector('.exercise-content', { state: 'visible' });

      await page.click('button:has-text("My Journey")');
      await page.waitForSelector('.journey-section', { state: 'visible' });

      // Fill in some sample data
      await page.fill('textarea[x-model="journeyData.filesModified"]', 'src/main.js, tests/unit.test.js');
      await page.fill('textarea[x-model="journeyData.biggestChallenge"]', 'Setting up the testing framework');
      await page.click('.rating-star:nth-child(4)'); // 4 stars

      const journeyForm = page.locator('.journey-implementation');
      await expect(journeyForm).toHaveScreenshot('journey-form-filled.png', {
        threshold: 0.2,
        animations: 'disabled'
      });
    });
  });

  test.describe('Behind the Scenes Views', () => {
    test('should match behind the scenes panel', async ({ page }) => {
      await page.goto('/');
      await page.click('button:has-text("Behind the Scenes")');
      await page.waitForSelector('.behind-scenes-section', { state: 'visible' });

      await expect(page.locator('.behind-scenes-section')).toHaveScreenshot('behind-scenes-panel.png', {
        threshold: 0.2,
        animations: 'disabled'
      });
    });
  });

  test.describe('Copy Button States', () => {
    test('should match copy button default state', async ({ page }) => {
      await page.goto('/');
      await page.click('.exercise-card .btn-primary');
      await page.waitForSelector('.section-content', { state: 'visible' });

      // Look for copy buttons that might have been added
      const copyButtons = page.locator('.copy-button');

      if (await copyButtons.count() > 0) {
        const firstCopyButton = copyButtons.first();
        await expect(firstCopyButton).toHaveScreenshot('copy-button-default.png', {
          threshold: 0.2,
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Dark Mode Support', () => {
    test('should match dark mode if supported', async ({ page }) => {
      // Enable dark mode preference
      await page.emulateMedia({ colorScheme: 'dark' });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
        fullPage: true,
        threshold: 0.2,
        animations: 'disabled'
      });
    });
  });

  test.describe('Loading States', () => {
    test('should match loading state', async ({ page }) => {
      // Slow down network to catch loading state
      await page.route('**/exercises/**', route => {
        setTimeout(() => route.continue(), 1000);
      });

      await page.goto('/');
      await page.click('.exercise-card .btn-primary');

      // Capture the loading state
      await expect(page.locator('.section-content')).toHaveScreenshot('loading-state.png', {
        threshold: 0.2,
        animations: 'disabled'
      });
    });
  });

  test.describe('Error States', () => {
    test('should match error state for failed content loading', async ({ page }) => {
      // Mock failed content loading
      await page.route('**/exercises/**/*.md', route => {
        route.fulfill({
          status: 404,
          body: 'Not found'
        });
      });

      await page.goto('/');
      await page.click('.exercise-card .btn-primary');
      await page.waitForSelector('.section-content', { state: 'visible' });

      await expect(page.locator('.section-content')).toHaveScreenshot('error-state-content.png', {
        threshold: 0.2,
        animations: 'disabled'
      });
    });
  });
});