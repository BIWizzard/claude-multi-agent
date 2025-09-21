import { vi } from 'vitest';

/**
 * Creates a mock exercise for testing
 */
export function createMockExercise(overrides = {}) {
  return {
    id: '01-fundamentals',
    title: 'Test Exercise',
    description: 'A test exercise',
    duration: '1 hour',
    difficulty: 'Beginner',
    objectives: ['Test objective 1', 'Test objective 2'],
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        type: 'reading',
        content: '# Overview\nThis is a test overview.'
      },
      {
        id: 'setup',
        title: 'Setup',
        type: 'action',
        content: '# Setup\nThis is a test setup.'
      }
    ],
    ...overrides
  };
}

/**
 * Creates mock progress data for testing
 */
export function createMockProgress(exerciseId = '01-fundamentals') {
  return {
    [exerciseId]: {
      sections: {
        'overview': {
          viewed: true,
          viewedAt: '2025-01-01T00:00:00.000Z',
          completed: true,
          completedAt: '2025-01-01T00:01:00.000Z'
        },
        'setup': {
          viewed: true,
          viewedAt: '2025-01-01T00:02:00.000Z',
          completed: false
        }
      },
      lastViewed: 'setup'
    }
  };
}

/**
 * Sets up localStorage mock with data
 */
export function setupLocalStorageMock(data = {}) {
  localStorage.getItem.mockImplementation((key) => {
    if (key === 'learning-lab-progress') {
      return JSON.stringify(data);
    }
    return null;
  });
}

/**
 * Sets up fetch mock for exercise loading
 */
export function setupFetchMock(responses = {}) {
  fetch.mockImplementation((url) => {
    if (responses[url]) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses[url]),
        text: () => Promise.resolve(responses[url])
      });
    }

    // Default responses
    if (url.includes('/exercises/manifest.json')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          exercises: [createMockExercise()]
        })
      });
    }

    if (url.includes('.md')) {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve('# Test Content\nThis is test content.')
      });
    }

    return Promise.reject(new Error(`Unmocked fetch: ${url}`));
  });
}

/**
 * Creates a mock Alpine.js component instance
 */
export function createMockAlpineComponent(initialData = {}) {
  const data = {
    exercises: [createMockExercise()],
    currentExercise: null,
    currentSection: null,
    currentExerciseData: null,
    currentSectionContent: '',
    showOverview: false,
    showBehindScenes: false,
    showJourney: false,
    behindScenesContent: '',
    progress: {},
    journeyData: {
      filesModified: '',
      biggestChallenge: '',
      keyCodeSnippet: '',
      patternsDiscovered: '',
      wouldDoDifferently: '',
      rating: 0,
      timeline: []
    },
    showCopySuccess: false,
    ...initialData
  };

  return {
    ...data,
    // Mock methods will be added in individual test files as needed
    $nextTick: vi.fn(callback => Promise.resolve().then(callback))
  };
}

/**
 * Waits for DOM updates
 */
export function waitForDOM() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Creates a mock DOM element
 */
export function createMockElement(tag = 'div', attributes = {}, content = '') {
  const element = document.createElement(tag);

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  if (content) {
    element.innerHTML = content;
  }

  return element;
}

/**
 * Mock journey data for testing
 */
export function createMockJourneyData() {
  return {
    filesModified: 'src/main.js, tests/unit.test.js',
    biggestChallenge: 'Setting up the testing framework',
    keyCodeSnippet: 'const test = () => assert(true);',
    patternsDiscovered: 'Modular testing approach',
    wouldDoDifferently: 'Start with TDD',
    rating: 4,
    timeline: [
      {
        timestamp: '2025-01-01T00:00:00.000Z',
        section: 'Overview',
        action: 'Started section'
      },
      {
        timestamp: '2025-01-01T00:05:00.000Z',
        section: 'Overview',
        action: 'Completed section'
      }
    ]
  };
}