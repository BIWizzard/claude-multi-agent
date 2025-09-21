import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend expect with axe matchers
expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
      url: 'http://localhost',
      pretendToBeVisual: true,
      resources: 'usable'
    });
    document = dom.window.document;
    global.document = document;
    global.window = dom.window;
  });

  describe('Exercise Card Component', () => {
    it('should be accessible', async () => {
      document.body.innerHTML = `
        <div class="exercise-card">
          <div class="exercise-header">
            <h3>Claude Code Fundamentals</h3>
            <div class="exercise-meta">
              <span class="duration">2 hours</span>
              <span class="difficulty">Beginner</span>
            </div>
          </div>

          <p class="exercise-description">
            Master project structure and context management for multi-agent workflows
          </p>

          <div class="exercise-objectives">
            <h4>Learning Objectives:</h4>
            <ul>
              <li>Understand hierarchical context management</li>
              <li>Create agent isolation patterns</li>
              <li>Implement session handoff procedures</li>
            </ul>
          </div>

          <div class="exercise-actions">
            <button class="btn btn-primary" type="button">
              Start Exercise
            </button>
          </div>
        </div>
      `;

      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading hierarchy', async () => {
      document.body.innerHTML = `
        <div class="exercise-card">
          <div class="exercise-header">
            <h2>Claude Code Fundamentals</h2>
          </div>
          <div class="exercise-objectives">
            <h3>Learning Objectives:</h3>
            <ul>
              <li>Test objective</li>
            </ul>
          </div>
        </div>
      `;

      const results = await axe(document.body, {
        rules: {
          'heading-order': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });

    it('should have accessible buttons', async () => {
      document.body.innerHTML = `
        <div class="exercise-actions">
          <button class="btn btn-primary" type="button" aria-label="Start Claude Code Fundamentals exercise">
            Start Exercise
          </button>
          <button class="btn btn-outline btn-small" type="button" aria-label="Reset progress and start over">
            🔄 Start Over
          </button>
        </div>
      `;

      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Progress Indicator Component', () => {
    it('should be accessible', async () => {
      document.body.innerHTML = `
        <div class="progress-indicator" role="progressbar" aria-valuenow="3" aria-valuemin="0" aria-valuemax="5" aria-label="Exercise progress: 3 of 5 sections completed">
          <span aria-hidden="true">3 of 5 sections</span>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 60%" aria-hidden="true"></div>
          </div>
        </div>
      `;

      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes', async () => {
      document.body.innerHTML = `
        <div class="progress-indicator"
             role="progressbar"
             aria-valuenow="5"
             aria-valuemin="0"
             aria-valuemax="5"
             aria-label="Exercise completed: 5 of 5 sections">
          <span aria-hidden="true">5 of 5 sections (100%)</span>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 100%" aria-hidden="true"></div>
          </div>
        </div>
      `;

      const results = await axe(document.body, {
        rules: {
          'aria-valid-attr': { enabled: true },
          'aria-valid-attr-value': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('Copy Button Component', () => {
    it('should be accessible', async () => {
      document.body.innerHTML = `
        <div class="starter-prompt-container">
          <button class="copy-button" type="button" aria-label="Copy starter prompt to clipboard">
            📋 Copy
          </button>
        </div>
      `;

      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });

    it('should provide feedback for screen readers', async () => {
      document.body.innerHTML = `
        <div class="copy-container">
          <button class="copy-button" type="button" aria-label="Copy text to clipboard">
            📋 Copy
          </button>
          <div class="sr-only" id="copy-status" aria-live="polite" aria-atomic="true">
            Text copied to clipboard
          </div>
        </div>
      `;

      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Navigation Components', () => {
    it('should have accessible section navigation', async () => {
      document.body.innerHTML = `
        <nav class="exercise-nav" aria-label="Exercise sections">
          <h4 id="sections-heading">Sections</h4>
          <ul role="list" aria-labelledby="sections-heading">
            <li>
              <a href="#overview" class="section-link active" aria-current="page">
                <span class="section-icon" aria-hidden="true">▶️</span>
                <span>Overview</span>
              </a>
            </li>
            <li>
              <a href="#setup" class="section-link completed">
                <span class="section-icon" aria-hidden="true">✅</span>
                <span>Setup</span>
              </a>
            </li>
            <li>
              <a href="#testing" class="section-link">
                <span class="section-icon" aria-hidden="true">○</span>
                <span>Testing</span>
              </a>
            </li>
          </ul>
        </nav>
      `;

      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible section pagination', async () => {
      document.body.innerHTML = `
        <nav class="section-navigation" aria-label="Section navigation">
          <button class="btn btn-outline" type="button" aria-label="Go to previous section">
            ← Previous
          </button>
          <button class="btn btn-primary" type="button" aria-label="Go to next section">
            Next →
          </button>
        </nav>
      `;

      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Form Components', () => {
    it('should have accessible journey form', async () => {
      document.body.innerHTML = `
        <form class="implementation-form">
          <div class="form-group">
            <label for="files-modified">Key Files Created/Modified:</label>
            <textarea
              id="files-modified"
              name="filesModified"
              placeholder="List the main files you worked on"
              rows="3"
              aria-describedby="files-help"
            ></textarea>
            <div id="files-help" class="form-help">
              Example: src/main.js, tests/unit.test.js
            </div>
          </div>

          <div class="form-group">
            <label for="challenge">Biggest Challenge Overcome:</label>
            <textarea
              id="challenge"
              name="biggestChallenge"
              placeholder="What was the most difficult part and how did you solve it?"
              rows="3"
            ></textarea>
          </div>

          <fieldset class="form-group">
            <legend>Implementation Rating:</legend>
            <div class="rating-group" role="radiogroup" aria-labelledby="rating-legend">
              <input type="radio" id="rating-1" name="rating" value="1">
              <label for="rating-1">⭐ (1 star)</label>

              <input type="radio" id="rating-2" name="rating" value="2">
              <label for="rating-2">⭐⭐ (2 stars)</label>

              <input type="radio" id="rating-3" name="rating" value="3">
              <label for="rating-3">⭐⭐⭐ (3 stars)</label>

              <input type="radio" id="rating-4" name="rating" value="4">
              <label for="rating-4">⭐⭐⭐⭐ (4 stars)</label>

              <input type="radio" id="rating-5" name="rating" value="5">
              <label for="rating-5">⭐⭐⭐⭐⭐ (5 stars)</label>
            </div>
          </fieldset>

          <div class="form-actions">
            <button type="button" class="btn btn-primary">💾 Save Journey</button>
            <button type="button" class="btn btn-outline">📄 Export Summary</button>
          </div>
        </form>
      `;

      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Modal and Overlay Components', () => {
    it('should have accessible modal', async () => {
      document.body.innerHTML = `
        <div class="modal-overlay" role="dialog" aria-labelledby="modal-title" aria-modal="true">
          <div class="modal-content">
            <div class="modal-header">
              <h2 id="modal-title">Behind the Scenes</h2>
              <button class="modal-close" type="button" aria-label="Close dialog">
                ×
              </button>
            </div>
            <div class="modal-body">
              <p>Modal content goes here...</p>
            </div>
          </div>
        </div>
      `;

      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Color Contrast', () => {
    it('should pass color contrast requirements', async () => {
      document.body.innerHTML = `
        <style>
          .test-text { color: #374151; background: #ffffff; }
          .test-link { color: #3b82f6; }
          .test-button { color: #ffffff; background: #3b82f6; }
        </style>

        <div>
          <p class="test-text">This text should have sufficient contrast</p>
          <a href="#" class="test-link">This link should be accessible</a>
          <button class="test-button" type="button">This button should be accessible</button>
        </div>
      `;

      const results = await axe(document.body, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have proper focus management', async () => {
      document.body.innerHTML = `
        <div class="app">
          <button type="button" tabindex="0">First button</button>
          <input type="text" tabindex="0" aria-label="Text input">
          <button type="button" tabindex="0">Second button</button>
          <a href="#section" tabindex="0">Link to section</a>
        </div>
      `;

      const results = await axe(document.body, {
        rules: {
          'tabindex': { enabled: true },
          'focus-order-semantics': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });
  });
});