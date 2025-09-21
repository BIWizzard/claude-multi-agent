import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { NavigationState, Exercise, Section } from '../../types';

// Navigation Context
const NavigationContext = createContext<{
  navigationState: NavigationState;
  exercises: Exercise[];
  updateNavigation: (updates: Partial<NavigationState>) => void;
  navigateToExercise: (exerciseId: string) => void;
  navigateToSection: (sectionId: string) => void;
  getCurrentExercise: () => Exercise | null;
  getCurrentSection: () => Section | null;
  canNavigateNext: () => boolean;
  canNavigatePrevious: () => boolean;
  navigateNext: () => void;
  navigatePrevious: () => void;
} | null>(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: React.ReactNode;
  exercises: Exercise[];
  initialState?: Partial<NavigationState>;
  onNavigationChange?: (state: NavigationState) => void;
}

/**
 * NavigationProvider - React Context Provider
 *
 * Manages global navigation state for the learning lab application.
 * Provides centralized navigation logic and state management.
 */
export function NavigationProvider({
  children,
  exercises,
  initialState = {},
  onNavigationChange
}: NavigationProviderProps) {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentExercise: null,
    currentSection: null,
    showOverview: true,
    showJourney: false,
    showBehindScenes: false,
    ...initialState
  });

  // Update navigation state
  const updateNavigation = useCallback((updates: Partial<NavigationState>) => {
    setNavigationState(prev => {
      const newState = { ...prev, ...updates };
      return newState;
    });
  }, []);

  // Notify parent of navigation changes
  useEffect(() => {
    onNavigationChange?.(navigationState);
  }, [navigationState, onNavigationChange]);

  // Update URL when navigation changes
  useEffect(() => {
    const params = new URLSearchParams();

    if (navigationState.currentExercise) {
      params.set('exercise', navigationState.currentExercise);

      if (navigationState.currentSection) {
        params.set('section', navigationState.currentSection);
      }
    }

    const newURL = params.toString() ? `?${params.toString()}` : '/';
    window.history.replaceState({}, '', newURL);
  }, [navigationState.currentExercise, navigationState.currentSection]);

  // Navigate to exercise
  const navigateToExercise = useCallback((exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    updateNavigation({
      currentExercise: exerciseId,
      currentSection: exercise.sections[0]?.id || null,
      showOverview: false,
      showJourney: false,
      showBehindScenes: false
    });
  }, [exercises, updateNavigation]);

  // Navigate to section
  const navigateToSection = useCallback((sectionId: string) => {
    if (!navigationState.currentExercise) return;

    const exercise = exercises.find(ex => ex.id === navigationState.currentExercise);
    const section = exercise?.sections.find(s => s.id === sectionId);

    if (!section) return;

    updateNavigation({
      currentSection: sectionId,
      showOverview: false,
      showJourney: false,
      showBehindScenes: false
    });
  }, [exercises, navigationState.currentExercise, updateNavigation]);

  // Get current exercise
  const getCurrentExercise = useCallback((): Exercise | null => {
    if (!navigationState.currentExercise) return null;
    return exercises.find(ex => ex.id === navigationState.currentExercise) || null;
  }, [exercises, navigationState.currentExercise]);

  // Get current section
  const getCurrentSection = useCallback((): Section | null => {
    const exercise = getCurrentExercise();
    if (!exercise || !navigationState.currentSection) return null;
    return exercise.sections.find(s => s.id === navigationState.currentSection) || null;
  }, [getCurrentExercise, navigationState.currentSection]);

  // Check if can navigate next
  const canNavigateNext = useCallback((): boolean => {
    const exercise = getCurrentExercise();
    if (!exercise || !navigationState.currentSection) return false;

    const currentIndex = exercise.sections.findIndex(s => s.id === navigationState.currentSection);
    return currentIndex < exercise.sections.length - 1;
  }, [getCurrentExercise, navigationState.currentSection]);

  // Check if can navigate previous
  const canNavigatePrevious = useCallback((): boolean => {
    const exercise = getCurrentExercise();
    if (!exercise || !navigationState.currentSection) return false;

    const currentIndex = exercise.sections.findIndex(s => s.id === navigationState.currentSection);
    return currentIndex > 0;
  }, [getCurrentExercise, navigationState.currentSection]);

  // Navigate to next section
  const navigateNext = useCallback(() => {
    const exercise = getCurrentExercise();
    if (!exercise || !navigationState.currentSection) return;

    const currentIndex = exercise.sections.findIndex(s => s.id === navigationState.currentSection);
    if (currentIndex < exercise.sections.length - 1) {
      const nextSection = exercise.sections[currentIndex + 1];
      navigateToSection(nextSection.id);
    }
  }, [getCurrentExercise, navigationState.currentSection, navigateToSection]);

  // Navigate to previous section
  const navigatePrevious = useCallback(() => {
    const exercise = getCurrentExercise();
    if (!exercise || !navigationState.currentSection) return;

    const currentIndex = exercise.sections.findIndex(s => s.id === navigationState.currentSection);
    if (currentIndex > 0) {
      const prevSection = exercise.sections[currentIndex - 1];
      navigateToSection(prevSection.id);
    }
  }, [getCurrentExercise, navigationState.currentSection, navigateToSection]);

  const contextValue = {
    navigationState,
    exercises,
    updateNavigation,
    navigateToExercise,
    navigateToSection,
    getCurrentExercise,
    getCurrentSection,
    canNavigateNext,
    canNavigatePrevious,
    navigateNext,
    navigatePrevious
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

/**
 * NavigationControls - React Island Component
 *
 * Provides navigation controls that can be placed anywhere in the application.
 */
interface NavigationControlsProps {
  className?: string;
  showLabels?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export function NavigationControls({
  className = '',
  showLabels = true,
  orientation = 'horizontal'
}: NavigationControlsProps) {
  const {
    canNavigateNext,
    canNavigatePrevious,
    navigateNext,
    navigatePrevious,
    getCurrentSection
  } = useNavigation();

  const currentSection = getCurrentSection();

  const getControlClasses = () => {
    const baseClasses = 'navigation-controls';
    const orientationClass = `navigation-controls--${orientation}`;

    return [baseClasses, orientationClass, className]
      .filter(Boolean)
      .join(' ');
  };

  return (
    <div className={getControlClasses()}>
      <button
        onClick={navigatePrevious}
        disabled={!canNavigatePrevious()}
        className="nav-btn nav-btn--previous"
        aria-label="Go to previous section"
      >
        <span className="nav-btn__icon">←</span>
        {showLabels && <span className="nav-btn__text">Previous</span>}
      </button>

      {currentSection && (
        <span className="nav-current-section">
          {currentSection.title}
        </span>
      )}

      <button
        onClick={navigateNext}
        disabled={!canNavigateNext()}
        className="nav-btn nav-btn--next"
        aria-label="Go to next section"
      >
        {showLabels && <span className="nav-btn__text">Next</span>}
        <span className="nav-btn__icon">→</span>
      </button>
    </div>
  );
}

/**
 * BreadcrumbNavigation - React Island Component
 *
 * Shows the current location in the exercise hierarchy.
 */
interface BreadcrumbNavigationProps {
  className?: string;
  showIcons?: boolean;
}

export function BreadcrumbNavigation({
  className = '',
  showIcons = true
}: BreadcrumbNavigationProps) {
  const {
    navigationState,
    getCurrentExercise,
    getCurrentSection,
    updateNavigation
  } = useNavigation();

  const currentExercise = getCurrentExercise();
  const currentSection = getCurrentSection();

  const showOverview = () => {
    updateNavigation({ showOverview: true });
  };

  return (
    <nav className={`breadcrumb-navigation ${className}`} aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <button
            onClick={showOverview}
            className="breadcrumb-link"
            aria-label="Go to exercise overview"
          >
            {showIcons && <span className="breadcrumb-icon">🏠</span>}
            <span>Overview</span>
          </button>
        </li>

        {currentExercise && (
          <li className="breadcrumb-item">
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">
              {showIcons && <span className="breadcrumb-icon">📚</span>}
              <span>{currentExercise.title}</span>
            </span>
          </li>
        )}

        {currentSection && (
          <li className="breadcrumb-item">
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">
              {showIcons && <span className="breadcrumb-icon">📖</span>}
              <span>{currentSection.title}</span>
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}

// CSS Module styles
export const styles = `
.navigation-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navigation-controls--vertical {
  flex-direction: column;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 0.375rem;
  color: var(--text-primary, #1a202c);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.nav-btn:hover:not(:disabled) {
  background: var(--bg-hover, #f7fafc);
  border-color: var(--border-hover, #cbd5e0);
  transform: translateY(-1px);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.nav-btn--previous .nav-btn__icon,
.nav-btn--next .nav-btn__icon {
  font-size: 1.2rem;
  line-height: 1;
}

.nav-current-section {
  font-weight: 600;
  color: var(--text-primary, #1a202c);
  text-align: center;
  padding: 0 1rem;
}

.breadcrumb-navigation {
  margin-bottom: 1rem;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.875rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-link {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: none;
  border: none;
  color: var(--primary-color, #3182ce);
  cursor: pointer;
  text-decoration: none;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.breadcrumb-link:hover {
  background: var(--primary-light, #ebf8ff);
}

.breadcrumb-separator {
  margin: 0 0.5rem;
  color: var(--text-secondary, #4a5568);
}

.breadcrumb-current {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-primary, #1a202c);
  font-weight: 600;
}

.breadcrumb-icon {
  font-size: 1rem;
  line-height: 1;
}

/* Responsive design */
@media (max-width: 640px) {
  .navigation-controls {
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-btn {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }

  .nav-current-section {
    width: 100%;
    order: -1;
    margin-bottom: 0.5rem;
  }

  .breadcrumb-list {
    flex-wrap: wrap;
  }

  .breadcrumb-item {
    font-size: 0.75rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .nav-btn {
    --bg-primary: #2d3748;
    --border-color: #4a5568;
    --text-primary: #f7fafc;
  }

  .nav-btn:hover:not(:disabled) {
    --bg-hover: #4a5568;
    --border-hover: #718096;
  }

  .breadcrumb-link {
    --primary-color: #63b3ed;
  }

  .breadcrumb-link:hover {
    --primary-light: #2d3748;
  }
}
`;