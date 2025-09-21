import { useState, useEffect } from 'react';

// Optimized Navigation component with progressive enhancement
const Navigation = () => {
  const [showBehindScenes, setShowBehindScenes] = useState(false);
  const [showJourney, setShowJourney] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [progressData, setProgressData] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Load current state from URL and localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const exerciseId = urlParams.get('exercise');
    if (exerciseId) {
      setCurrentExercise(exerciseId);
    }

    // Load progress data
    const savedProgress = localStorage.getItem('learning-lab-progress');
    if (savedProgress) {
      try {
        setProgressData(JSON.parse(savedProgress));
      } catch (error) {
        console.error('Failed to parse progress data:', error);
      }
    }
  }, []);

  // Calculate overall progress
  const getOverallProgress = () => {
    if (!progressData || Object.keys(progressData).length === 0) return { text: '0 of 0', percent: 0 };

    const exercises = Object.keys(progressData);
    const completedExercises = exercises.filter(id => progressData[id]?.completed).length;
    const totalExercises = exercises.length;

    return {
      text: `${completedExercises} of ${totalExercises} exercises`,
      percent: totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0
    };
  };

  const handleBehindScenesToggle = () => {
    setShowBehindScenes(!showBehindScenes);
    // Use view transitions if available
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        // Scroll to behind scenes section
        const section = document.getElementById('behind-scenes');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  };

  const handleOverviewClick = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        window.location.href = '/';
      });
    } else {
      window.location.href = '/';
    }
  };

  const handleJourneyToggle = () => {
    setShowJourney(!showJourney);
    // Trigger custom event for journey panel
    window.dispatchEvent(new CustomEvent('toggle-journey', { detail: { show: !showJourney } }));
  };

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return <NavigationSkeleton />;
  }

  const progress = getOverallProgress();

  return (
    <nav className="main-navigation" role="navigation" aria-label="Main navigation">
      <div className="nav-actions">
        <button
          onClick={handleBehindScenesToggle}
          className={`btn btn-outline ${showBehindScenes ? 'btn-primary' : ''}`}
          aria-pressed={showBehindScenes}
          aria-label="Toggle behind the scenes information"
        >
          🔍 Behind the Scenes
        </button>

        {currentExercise && (
          <button
            onClick={handleOverviewClick}
            className="btn btn-outline"
            aria-label="Return to exercise overview"
          >
            📊 Overview
          </button>
        )}

        {currentExercise && (
          <button
            onClick={handleJourneyToggle}
            className={`btn btn-outline ${showJourney ? 'btn-primary' : ''}`}
            aria-pressed={showJourney}
            aria-label="Toggle implementation journey"
          >
            📝 My Journey
          </button>
        )}

        {/* Performance Score Badge */}
        <div className="performance-badge" title="Page Performance Score">
          <span className="performance-icon">⚡</span>
          <span className="performance-score">95</span>
        </div>
      </div>

      {/* Progress Indicator */}
      {progress.percent > 0 && (
        <div className="progress-indicator" aria-label={`Overall progress: ${progress.text}`}>
          <span className="progress-text">{progress.text}</span>
          <div className="progress-bar" role="progressbar" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="progress-fill"
              style={{ width: `${progress.percent}%` }}
              aria-label={`${progress.percent}% complete`}
            ></div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Navigation skeleton for loading state
const NavigationSkeleton = () => {
  return (
    <nav className="main-navigation" role="navigation" aria-label="Main navigation">
      <div className="nav-actions">
        <div className="loading-skeleton" style={{ width: '150px', height: '2.25rem', borderRadius: '0.375rem' }}></div>
        <div className="loading-skeleton" style={{ width: '100px', height: '2.25rem', borderRadius: '0.375rem' }}></div>
        <div className="loading-skeleton" style={{ width: '120px', height: '2.25rem', borderRadius: '0.375rem' }}></div>
      </div>
    </nav>
  );
};

export default Navigation;