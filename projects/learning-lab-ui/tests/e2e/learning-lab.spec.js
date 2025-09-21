import { test, expect } from '@playwright/test';

test.describe('Learning Lab - Main User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
  });

  test('should load the homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Claude Multi-Agent Learning Lab/);
    await expect(page.locator('h1')).toContainText('Claude Multi-Agent Learning Lab');
    await expect(page.locator('.hero h2')).toContainText('Master Multi-Agent Orchestration');
  });

  test('should display exercise cards', async ({ page }) => {
    await expect(page.locator('.exercise-card')).toHaveCount(1); // At least one exercise
    await expect(page.locator('.exercise-card h3')).toContainText('Claude Code Fundamentals');
    await expect(page.locator('.exercise-card .exercise-description')).toBeVisible();
    await expect(page.locator('.exercise-card .exercise-objectives')).toBeVisible();
  });

  test('should start an exercise', async ({ page }) => {
    // Click on the "Start Exercise" button
    await page.click('.exercise-card .btn-primary');

    // Should navigate to exercise view
    await expect(page.locator('.exercise-content')).toBeVisible();
    await expect(page.locator('.exercise-sidebar')).toBeVisible();
    await expect(page.locator('.section-content')).toBeVisible();

    // Should show progress indicator
    await expect(page.locator('.progress-indicator')).toBeVisible();
    await expect(page.locator('.progress-text')).toContainText('of');

    // Should show section navigation
    await expect(page.locator('.section-link')).toHaveCount.greaterThan(0);
  });

  test('should navigate between sections', async ({ page }) => {
    // Start an exercise
    await page.click('.exercise-card .btn-primary');

    // Wait for content to load
    await page.waitForSelector('.section-content', { state: 'visible' });

    // Navigate to next section
    const nextButton = page.locator('.section-navigation .btn-primary');
    if (await nextButton.isVisible()) {
      await nextButton.click();

      // Should update the active section in sidebar
      await expect(page.locator('.section-link.active')).toHaveCount(1);

      // Should update URL parameters
      await expect(page.url()).toContain('section=');
    }
  });

  test('should track progress correctly', async ({ page }) => {
    // Start an exercise
    await page.click('.exercise-card .btn-primary');
    await page.waitForSelector('.section-content', { state: 'visible' });

    // Navigate through sections and check progress updates
    const initialProgress = await page.locator('.progress-indicator span').textContent();

    // Move to next section if available
    const nextButton = page.locator('.section-navigation .btn-primary');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500); // Wait for progress update

      const updatedProgress = await page.locator('.progress-indicator span').textContent();
      // Progress should have changed
      expect(updatedProgress).not.toBe(initialProgress);
    }
  });

  test('should persist progress in localStorage', async ({ page }) => {
    // Start an exercise and navigate
    await page.click('.exercise-card .btn-primary');
    await page.waitForSelector('.section-content', { state: 'visible' });

    // Navigate to next section if available
    const nextButton = page.locator('.section-navigation .btn-primary');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }

    // Check that progress is saved to localStorage
    const progress = await page.evaluate(() => {
      return localStorage.getItem('learning-lab-progress');
    });

    expect(progress).toBeTruthy();
    const progressData = JSON.parse(progress);
    expect(progressData).toHaveProperty('01-fundamentals');
  });

  test('should resume from where user left off', async ({ page }) => {
    // Set up initial progress in localStorage
    await page.evaluate(() => {
      const progress = {
        '01-fundamentals': {
          sections: {
            'overview': {
              viewed: true,
              viewedAt: '2025-01-01T00:00:00.000Z',
              completed: true,
              completedAt: '2025-01-01T00:01:00.000Z'
            }
          },
          lastViewed: 'setup'
        }
      };
      localStorage.setItem('learning-lab-progress', JSON.stringify(progress));
    });

    // Reload the page
    await page.reload();

    // Start the exercise
    await page.click('.exercise-card .btn-primary');
    await page.waitForSelector('.section-content', { state: 'visible' });

    // Should show that overview section is completed
    await expect(page.locator('.section-link').first()).toHaveClass(/completed/);
  });
});

test.describe('Learning Lab - Journey Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');

    // Start an exercise
    await page.click('.exercise-card .btn-primary');
    await page.waitForSelector('.section-content', { state: 'visible' });
  });

  test('should open journey tracking panel', async ({ page }) => {
    await page.click('button:has-text("My Journey")');
    await expect(page.locator('.journey-section')).toBeVisible();
    await expect(page.locator('h2:has-text("My Implementation Journey")')).toBeVisible();
  });

  test('should save journey data', async ({ page }) => {
    // Open journey panel
    await page.click('button:has-text("My Journey")');
    await page.waitForSelector('.journey-section', { state: 'visible' });

    // Fill in journey data
    await page.fill('textarea[x-model="journeyData.filesModified"]', 'src/main.js, tests/unit.test.js');
    await page.fill('textarea[x-model="journeyData.biggestChallenge"]', 'Setting up testing framework');
    await page.fill('textarea[x-model="journeyData.keyCodeSnippet"]', 'const test = () => assert(true);');

    // Set rating
    await page.click('.rating-star:nth-child(4)'); // 4 stars

    // Save journey
    await page.click('button:has-text("Save Journey")');

    // Should show success message
    await expect(page.locator('text=Journey saved successfully')).toBeVisible();

    // Check localStorage
    const journeyData = await page.evaluate(() => {
      return localStorage.getItem('journey-01-fundamentals');
    });

    expect(journeyData).toBeTruthy();
    const data = JSON.parse(journeyData);
    expect(data.filesModified).toBe('src/main.js, tests/unit.test.js');
    expect(data.rating).toBe(4);
  });

  test('should export journey summary', async ({ page }) => {
    // Open journey panel and fill data
    await page.click('button:has-text("My Journey")');
    await page.waitForSelector('.journey-section', { state: 'visible' });

    await page.fill('textarea[x-model="journeyData.filesModified"]', 'test-files.js');

    // Set up download handling
    const downloadPromise = page.waitForEvent('download');

    await page.click('button:has-text("Export Summary")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('journey-01-fundamentals.md');
  });
});

test.describe('Learning Lab - Copy Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');

    // Start an exercise
    await page.click('.exercise-card .btn-primary');
    await page.waitForSelector('.section-content', { state: 'visible' });
  });

  test('should copy starter prompts', async ({ page }) => {
    // Look for copy buttons in the content
    const copyButtons = page.locator('.copy-button');

    if (await copyButtons.count() > 0) {
      // Grant clipboard permissions
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

      // Click the first copy button
      await copyButtons.first().click();

      // Should show success feedback
      await expect(page.locator('text=copied to clipboard')).toBeVisible();

      // Verify clipboard content
      const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardContent).toBeTruthy();
    }
  });
});

test.describe('Learning Lab - Behind the Scenes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show behind the scenes content', async ({ page }) => {
    await page.click('button:has-text("Behind the Scenes")');
    await expect(page.locator('.behind-scenes-section')).toBeVisible();
    await expect(page.locator('h2:has-text("Behind the Scenes")')).toBeVisible();
  });

  test('should close behind the scenes panel', async ({ page }) => {
    await page.click('button:has-text("Behind the Scenes")');
    await page.waitForSelector('.behind-scenes-section', { state: 'visible' });

    await page.click('button:has-text("Close")');
    await expect(page.locator('.behind-scenes-section')).not.toBeVisible();
  });
});

test.describe('Learning Lab - Responsive Design', () => {
  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    await page.goto('/');

    // Should display properly on mobile
    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator('.exercise-card')).toBeVisible();

    // Exercise cards should stack vertically
    const exerciseCard = page.locator('.exercise-card').first();
    const cardBox = await exerciseCard.boundingBox();
    expect(cardBox.width).toBeLessThan(400); // Should be narrow on mobile
  });

  test('should work on tablet devices', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
    await page.goto('/');

    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator('.exercise-card')).toBeVisible();

    // Start an exercise and check sidebar
    await page.click('.exercise-card .btn-primary');
    await page.waitForSelector('.exercise-content', { state: 'visible' });

    await expect(page.locator('.exercise-sidebar')).toBeVisible();
    await expect(page.locator('.exercise-main')).toBeVisible();
  });
});

test.describe('Learning Lab - Error Handling', () => {
  test('should handle missing exercise content gracefully', async ({ page }) => {
    // Intercept fetch requests and return errors for content
    await page.route('**/exercises/**/*.md', route => {
      route.fulfill({
        status: 404,
        body: 'Not found'
      });
    });

    await page.goto('/');

    // Start an exercise
    await page.click('.exercise-card .btn-primary');
    await page.waitForSelector('.section-content', { state: 'visible' });

    // Should display fallback content
    await expect(page.locator('.section-content')).toContainText('Content for this section is being loaded');
  });

  test('should handle failed manifest loading', async ({ page }) => {
    // Intercept manifest request
    await page.route('**/exercises/manifest.json', route => {
      route.fulfill({
        status: 404,
        body: 'Not found'
      });
    });

    await page.goto('/');

    // Should show demo exercise data
    await expect(page.locator('.exercise-card')).toHaveCount.greaterThanOrEqual(1);
  });
});