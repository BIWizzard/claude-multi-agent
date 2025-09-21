import { vi } from 'vitest';
import 'jsdom-global/register';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
    readText: vi.fn(() => Promise.resolve('')),
  },
});

// Mock fetch
global.fetch = vi.fn();

// Mock alert and confirm
global.alert = vi.fn();
global.confirm = vi.fn(() => true);

// Mock URL methods
global.URL.createObjectURL = vi.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = vi.fn();

// Mock Alpine.js nextTick
global.Alpine = {
  nextTick: vi.fn(callback => Promise.resolve().then(callback))
};

// Mock marked and DOMPurify globals for tests
global.marked = vi.fn((content) => `<p>${content}</p>`);
global.DOMPurify = {
  sanitize: vi.fn((content) => content)
};

// Setup DOM testing utilities
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();

  // Reset localStorage mock
  localStorageMock.getItem.mockReturnValue(null);

  // Clear document body
  document.body.innerHTML = '';

  // Reset URL
  window.history.replaceState({}, '', '/');
});