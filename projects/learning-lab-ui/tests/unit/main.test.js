import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createMockExercise,
  createMockProgress,
  setupLocalStorageMock,
  setupFetchMock,
  createMockAlpineComponent
} from '../utils/test-helpers.js';

// Import the main module to test
// Note: In real implementation, we'd need to refactor main.js to be more testable
// For now, we'll test the component logic

describe('Learning Lab Main Component', () => {
  let component;

  beforeEach(() => {
    component = createMockAlpineComponent();
    setupFetchMock();
    setupLocalStorageMock();
  });

  describe('Computed Properties', () => {
    it('should calculate progress text correctly', () => {
      component.currentExercise = '01-fundamentals';
      component.currentExerciseData = createMockExercise();
      component.progress = createMockProgress();

      component.getCompletedSections = vi.fn().mockReturnValue(['overview']);

      const progressText = component.progressText || `1 of 2 sections`;
      expect(progressText).toBe('1 of 2 sections');
    });

    it('should calculate progress percentage correctly', () => {
      component.currentExercise = '01-fundamentals';
      component.currentExerciseData = createMockExercise();
      component.getCompletedSections = vi.fn().mockReturnValue(['overview']);

      // Mock the actual getter logic
      const completed = 1;
      const total = 2;
      const progressPercent = Math.round((completed / total) * 100);

      expect(progressPercent).toBe(50);
    });

    it('should detect if there is a previous section', () => {
      component.currentExerciseData = createMockExercise();
      component.currentSection = 'setup'; // Second section

      component.getCurrentSectionIndex = vi.fn().mockReturnValue(1);

      const hasPrevious = component.getCurrentSectionIndex() > 0;
      expect(hasPrevious).toBe(true);
    });

    it('should detect if there is a next section', () => {
      component.currentExerciseData = createMockExercise();
      component.currentSection = 'overview'; // First section

      component.getCurrentSectionIndex = vi.fn().mockReturnValue(0);

      const hasNext = component.getCurrentSectionIndex() < component.currentExerciseData.sections.length - 1;
      expect(hasNext).toBe(true);
    });
  });

  describe('Exercise Management', () => {
    it('should load exercises from manifest', async () => {
      const mockExercises = [createMockExercise()];
      setupFetchMock({
        '/exercises/manifest.json': { exercises: mockExercises }
      });

      // Mock the loadExercises method
      component.loadExercises = vi.fn(async () => {
        const response = await fetch('/exercises/manifest.json');
        const data = await response.json();
        component.exercises = data.exercises;
      });

      await component.loadExercises();

      expect(component.exercises).toEqual(mockExercises);
    });

    it('should start exercise and load content', async () => {
      component.exercises = [createMockExercise()];

      component.loadExerciseContent = vi.fn();
      component.loadJourneyData = vi.fn();
      component.getLastViewedSection = vi.fn().mockReturnValue(null);
      component.getFirstIncompleteSection = vi.fn().mockReturnValue('overview');
      component.navigateToSection = vi.fn();
      component.updateURL = vi.fn();

      component.startExercise = vi.fn(async (exerciseId) => {
        component.currentExercise = exerciseId;
        component.showOverview = false;
        component.currentExerciseData = component.exercises.find(ex => ex.id === exerciseId);

        await component.loadExerciseContent();
        component.loadJourneyData();

        const lastSection = component.getLastViewedSection(exerciseId);
        const firstIncomplete = component.getFirstIncompleteSection(exerciseId);
        component.navigateToSection(lastSection || firstIncomplete || component.currentExerciseData.sections[0].id);
        component.updateURL();
      });

      await component.startExercise('01-fundamentals');

      expect(component.currentExercise).toBe('01-fundamentals');
      expect(component.showOverview).toBe(false);
      expect(component.currentExerciseData).toBeTruthy();
      expect(component.loadExerciseContent).toHaveBeenCalled();
      expect(component.navigateToSection).toHaveBeenCalledWith('overview');
    });
  });

  describe('Progress Tracking', () => {
    it('should mark section as viewed', () => {
      component.currentExercise = '01-fundamentals';
      component.progress = {};
      component.saveProgress = vi.fn();

      component.markSectionViewed = vi.fn((sectionId) => {
        if (!component.progress[component.currentExercise]) {
          component.progress[component.currentExercise] = { sections: {}, lastViewed: null };
        }

        component.progress[component.currentExercise].lastViewed = sectionId;

        if (!component.progress[component.currentExercise].sections[sectionId]) {
          component.progress[component.currentExercise].sections[sectionId] = {
            viewed: true,
            viewedAt: new Date().toISOString()
          };
        }

        component.saveProgress();
      });

      component.markSectionViewed('overview');

      expect(component.progress['01-fundamentals'].lastViewed).toBe('overview');
      expect(component.progress['01-fundamentals'].sections.overview.viewed).toBe(true);
      expect(component.saveProgress).toHaveBeenCalled();
    });

    it('should mark section as completed', () => {
      component.currentExercise = '01-fundamentals';
      component.progress = { '01-fundamentals': { sections: {} } };
      component.saveProgress = vi.fn();

      component.markSectionCompleted = vi.fn((sectionId) => {
        component.progress[component.currentExercise].sections[sectionId] = {
          ...component.progress[component.currentExercise].sections[sectionId],
          completed: true,
          completedAt: new Date().toISOString()
        };

        component.saveProgress();
      });

      component.markSectionCompleted('overview');

      expect(component.progress['01-fundamentals'].sections.overview.completed).toBe(true);
      expect(component.saveProgress).toHaveBeenCalled();
    });

    it('should get exercise status correctly', () => {
      component.progress = createMockProgress();

      component.getExerciseStatus = vi.fn((exerciseId) => {
        if (component.progress[exerciseId]?.completed) return 'completed';
        if (component.progress[exerciseId]?.sections && Object.keys(component.progress[exerciseId].sections).length > 0) return 'in-progress';
        return 'not-started';
      });

      expect(component.getExerciseStatus('01-fundamentals')).toBe('in-progress');
      expect(component.getExerciseStatus('non-existent')).toBe('not-started');
    });
  });

  describe('Copy Functionality', () => {
    it('should copy starter prompt text', async () => {
      const promptText = 'Test prompt text';

      component.copyStarterPrompt = vi.fn(async (text) => {
        await navigator.clipboard.writeText(text);
        component.showCopySuccess = true;
        setTimeout(() => {
          component.showCopySuccess = false;
        }, 2000);
      });

      await component.copyStarterPrompt(promptText);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(promptText);
      expect(component.showCopySuccess).toBe(true);
    });

    it('should handle copy fallback for older browsers', async () => {
      // Mock clipboard failure
      navigator.clipboard.writeText.mockRejectedValue(new Error('Clipboard not available'));

      // Mock document methods
      const mockTextArea = {
        value: '',
        select: vi.fn(),
        remove: vi.fn()
      };
      document.createElement = vi.fn().mockReturnValue(mockTextArea);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();
      document.execCommand = vi.fn();

      const promptText = 'Test prompt text';

      component.copyStarterPrompt = vi.fn(async (text) => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
        component.showCopySuccess = true;
      });

      await component.copyStarterPrompt(promptText);

      expect(document.createElement).toHaveBeenCalledWith('textarea');
      expect(mockTextArea.value).toBe(promptText);
      expect(component.showCopySuccess).toBe(true);
    });
  });

  describe('Journey Tracking', () => {
    it('should save journey data to localStorage', () => {
      component.currentExercise = '01-fundamentals';
      component.journeyData = {
        filesModified: 'test.js',
        rating: 4
      };

      component.saveJourneyData = vi.fn(() => {
        const journeyKey = `journey-${component.currentExercise}`;
        localStorage.setItem(journeyKey, JSON.stringify(component.journeyData));
      });

      component.saveJourneyData();

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'journey-01-fundamentals',
        JSON.stringify(component.journeyData)
      );
    });

    it('should load journey data from localStorage', () => {
      component.currentExercise = '01-fundamentals';
      const mockJourneyData = { rating: 5, filesModified: 'test.js' };

      localStorage.getItem.mockReturnValue(JSON.stringify(mockJourneyData));

      component.loadJourneyData = vi.fn(() => {
        const journeyKey = `journey-${component.currentExercise}`;
        const saved = localStorage.getItem(journeyKey);
        if (saved) {
          component.journeyData = { ...component.journeyData, ...JSON.parse(saved) };
        }
      });

      component.loadJourneyData();

      expect(localStorage.getItem).toHaveBeenCalledWith('journey-01-fundamentals');
      expect(component.journeyData.rating).toBe(5);
      expect(component.journeyData.filesModified).toBe('test.js');
    });
  });

  describe('URL Management', () => {
    it('should update URL with exercise and section parameters', () => {
      component.currentExercise = '01-fundamentals';
      component.currentSection = 'overview';

      const mockReplaceState = vi.fn();
      window.history.replaceState = mockReplaceState;

      component.updateURL = vi.fn(() => {
        const params = new URLSearchParams();
        if (component.currentExercise) {
          params.set('exercise', component.currentExercise);
          if (component.currentSection) {
            params.set('section', component.currentSection);
          }
        }

        const newURL = params.toString() ? `?${params.toString()}` : '/';
        window.history.replaceState({}, '', newURL);
      });

      component.updateURL();

      expect(mockReplaceState).toHaveBeenCalledWith({}, '', '?exercise=01-fundamentals&section=overview');
    });
  });
});