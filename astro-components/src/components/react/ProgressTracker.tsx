import { useMemo } from 'react';
import type { ProgressTrackerProps } from '../../types';

/**
 * ProgressTracker - React Island Component
 *
 * Displays learning progress with animated progress bar and customizable display options.
 * Supports both numerical and percentage display modes.
 */
export default function ProgressTracker({
  current,
  total,
  showPercentage = true,
  showText = true,
  className = ''
}: ProgressTrackerProps) {
  const percentage = useMemo(() => {
    if (total === 0) return 0;
    return Math.round((current / total) * 100);
  }, [current, total]);

  const getProgressClasses = () => {
    const baseClasses = 'progress-tracker';
    const completedClass = percentage === 100 ? 'progress-tracker--completed' : '';

    return [baseClasses, completedClass, className]
      .filter(Boolean)
      .join(' ');
  };

  const getProgressText = () => {
    if (showPercentage) {
      return `${percentage}%`;
    }
    return `${current} of ${total}`;
  };

  const getAriaLabel = () => {
    return `Progress: ${current} of ${total} sections completed (${percentage}%)`;
  };

  return (
    <div className={getProgressClasses()}>
      {showText && (
        <div className="progress-tracker__text">
          <span className="progress-tracker__label">Progress</span>
          <span className="progress-tracker__value">{getProgressText()}</span>
        </div>
      )}

      <div
        className="progress-tracker__bar"
        role="progressbar"
        aria-label={getAriaLabel()}
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="progress-tracker__fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {percentage === 100 && (
        <div className="progress-tracker__completion">
          <span className="progress-tracker__completion-icon">✅</span>
          <span className="progress-tracker__completion-text">Complete!</span>
        </div>
      )}
    </div>
  );
}

// CSS Module styles
export const styles = `
.progress-tracker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
}

.progress-tracker__text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: var(--text-secondary, #4a5568);
}

.progress-tracker__label {
  font-weight: 500;
}

.progress-tracker__value {
  font-weight: 600;
  color: var(--text-primary, #1a202c);
}

.progress-tracker__bar {
  position: relative;
  width: 100%;
  height: 8px;
  background: var(--bg-secondary, #e2e8f0);
  border-radius: 4px;
  overflow: hidden;
}

.progress-tracker__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color, #3182ce), var(--primary-hover, #2c5282));
  border-radius: 4px;
  transition: width 0.3s ease-in-out;
  position: relative;
}

.progress-tracker__fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 2s infinite;
}

.progress-tracker--completed .progress-tracker__fill {
  background: linear-gradient(90deg, var(--success-color, #38a169), var(--success-hover, #2f855a));
}

.progress-tracker__completion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--success-color, #38a169);
  margin-top: 0.25rem;
}

.progress-tracker__completion-icon {
  font-size: 1rem;
}

.progress-tracker__completion-text {
  animation: fadeInScale 0.3s ease-out;
}

/* Animations */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive design */
@media (max-width: 640px) {
  .progress-tracker {
    min-width: 150px;
  }

  .progress-tracker__text {
    font-size: 0.75rem;
  }

  .progress-tracker__bar {
    height: 6px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .progress-tracker__text {
    --text-secondary: #a0aec0;
  }

  .progress-tracker__value {
    --text-primary: #f7fafc;
  }

  .progress-tracker__bar {
    --bg-secondary: #4a5568;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .progress-tracker__bar {
    border: 1px solid currentColor;
  }

  .progress-tracker__fill {
    background: currentColor;
  }
}
`;