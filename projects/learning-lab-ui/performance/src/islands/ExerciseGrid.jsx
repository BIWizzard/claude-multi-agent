import { useState, useEffect, useMemo, Suspense } from 'react';

// Optimized Exercise Grid component with performance enhancements
const ExerciseGrid = ({ exercises }) => {
  const [progress, setProgress] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({ difficulty: 'all', status: 'all' });
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);

  // Hydration optimization - prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
    // Load progress from localStorage after mount
    const savedProgress = localStorage.getItem('learning-lab-progress');
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch (error) {
        console.error('Failed to parse progress data:', error);
      }
    }
  }, []);

  // Memoized filtered exercises for performance
  const filteredExercises = useMemo(() => {
    if (!exercises) return [];

    return exercises.filter(exercise => {
      // Search filter
      if (searchTerm && !exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !exercise.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Difficulty filter
      if (selectedFilters.difficulty !== 'all' &&
          exercise.difficulty.toLowerCase() !== selectedFilters.difficulty) {
        return false;
      }

      // Status filter
      if (selectedFilters.status !== 'all') {
        const status = getExerciseStatus(exercise.id);
        if (status !== selectedFilters.status) {
          return false;
        }
      }

      return true;
    });
  }, [exercises, searchTerm, selectedFilters, progress]);

  // Optimized progress calculation
  const getExerciseProgress = (exerciseId) => {
    const exerciseProgress = progress[exerciseId];
    if (!exerciseProgress?.sections) return 0;

    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return 0;

    const completedSections = Object.values(exerciseProgress.sections)
      .filter(section => section.completed).length;
    const totalSections = exercise.sections.length;

    return totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
  };

  const getExerciseStatus = (exerciseId) => {
    if (progress[exerciseId]?.completed) return 'completed';
    if (progress[exerciseId]?.sections && Object.keys(progress[exerciseId].sections).length > 0) {
      return 'in-progress';
    }
    return 'not-started';
  };

  const getActionText = (exerciseId) => {
    const status = getExerciseStatus(exerciseId);
    switch (status) {
      case 'completed': return 'Review Exercise';
      case 'in-progress': return 'Continue';
      default: return 'Start Exercise';
    }
  };

  const startExercise = (exerciseId) => {
    // Use navigation with view transitions for smooth UX
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        window.location.href = `/exercises/${exerciseId}`;
      });
    } else {
      window.location.href = `/exercises/${exerciseId}`;
    }
  };

  const startOver = (exerciseId) => {
    if (confirm('🔄 Are you sure you want to start this exercise over? This will reset all progress.')) {
      // Clear progress data
      const newProgress = { ...progress };
      delete newProgress[exerciseId];
      setProgress(newProgress);
      localStorage.setItem('learning-lab-progress', JSON.stringify(newProgress));
    }
  };

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return <ExerciseGridSkeleton />;
  }

  return (
    <div className="exercise-grid-container">
      {/* Search and Filter Controls */}
      <div className="controls-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label="Search exercises"
          />
        </div>

        <div className="filters">
          <select
            value={selectedFilters.difficulty}
            onChange={(e) => setSelectedFilters(prev => ({ ...prev, difficulty: e.target.value }))}
            className="filter-select"
            aria-label="Filter by difficulty"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={selectedFilters.status}
            onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value }))}
            className="filter-select"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Exercise Cards Grid */}
      <div className="exercises-grid">
        {filteredExercises.map(exercise => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            progress={getExerciseProgress(exercise.id)}
            status={getExerciseStatus(exercise.id)}
            actionText={getActionText(exercise.id)}
            onStart={() => startExercise(exercise.id)}
            onStartOver={() => startOver(exercise.id)}
          />
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="no-results">
          <h3>No exercises found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

// Optimized Exercise Card component
const ExerciseCard = ({ exercise, progress, status, actionText, onStart, onStartOver }) => {
  return (
    <article className={`exercise-card ${status}`}>
      <div className="exercise-header">
        <h3>{exercise.title}</h3>
        <div className="exercise-meta">
          <span className="duration">{exercise.duration}</span>
          <span className={`difficulty difficulty-${exercise.difficulty.toLowerCase()}`}>
            {exercise.difficulty}
          </span>
        </div>
      </div>

      <p className="exercise-description">{exercise.description}</p>

      <div className="exercise-objectives">
        <h4>Learning Objectives:</h4>
        <ul>
          {exercise.objectives.map((objective, index) => (
            <li key={index}>{objective}</li>
          ))}
        </ul>
      </div>

      <div className="exercise-actions">
        <div className="action-buttons">
          <button onClick={onStart} className="btn btn-primary">
            {actionText}
          </button>

          {progress > 0 && (
            <button onClick={onStartOver} className="btn btn-outline btn-small">
              🔄 Start Over
            </button>
          )}
        </div>

        {progress > 0 && (
          <div className="exercise-progress">
            <div className="progress-bar small">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="progress-text">{progress}% complete</span>
          </div>
        )}
      </div>
    </article>
  );
};

// Loading skeleton for better perceived performance
const ExerciseGridSkeleton = () => {
  return (
    <div className="exercise-grid-container">
      <div className="controls-section">
        <div className="search-box">
          <div className="loading-skeleton" style={{ height: '2.5rem', borderRadius: '0.5rem' }}></div>
        </div>
        <div className="filters" style={{ gap: '1rem' }}>
          <div className="loading-skeleton" style={{ height: '2.5rem', width: '150px', borderRadius: '0.5rem' }}></div>
          <div className="loading-skeleton" style={{ height: '2.5rem', width: '150px', borderRadius: '0.5rem' }}></div>
        </div>
      </div>

      <div className="exercises-grid">
        {[1, 2, 3].map(i => (
          <div key={i} className="exercise-card">
            <div className="loading-skeleton" style={{ height: '1.5rem', marginBottom: '1rem' }}></div>
            <div className="loading-skeleton" style={{ height: '4rem', marginBottom: '1rem' }}></div>
            <div className="loading-skeleton" style={{ height: '6rem', marginBottom: '1rem' }}></div>
            <div className="loading-skeleton" style={{ height: '2.5rem' }}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseGrid;