import { useState, useEffect, useCallback } from 'react';
import type { ExerciseInteractiveProps } from '../../types';
import CopyButton from './CopyButton';

/**
 * ExerciseInteractive - React Island Component
 *
 * Main interactive wrapper for exercise content with navigation, progress tracking,
 * and dynamic content enhancement (copy buttons, interactive elements).
 */
export default function ExerciseInteractive({
  exerciseId,
  sectionId,
  content,
  onComplete,
  onNext,
  onPrevious,
  progress
}: ExerciseInteractiveProps) {
  const [processedContent, setProcessedContent] = useState(content);
  const [interactions, setInteractions] = useState<{ [key: string]: any }>({});
  const [isCompleted, setIsCompleted] = useState(false);

  // Check if section is completed
  useEffect(() => {
    const sectionProgress = progress[exerciseId]?.sections?.[sectionId];
    setIsCompleted(!!sectionProgress?.completed);
  }, [exerciseId, sectionId, progress]);

  // Process content to add interactive elements
  useEffect(() => {
    const enhanced = enhanceContent(content);
    setProcessedContent(enhanced);
  }, [content]);

  const enhanceContent = (htmlContent: string): string => {
    let enhanced = htmlContent;

    // Replace [COPY_BUTTON] markers with proper components
    enhanced = enhanced.replace(/\[COPY_BUTTON\]/g, (match, offset) => {
      // Find the previous code block
      const beforeMatch = enhanced.substring(0, offset);
      const codeBlockMatch = beforeMatch.match(/<code[^>]*>([^<]*)<\/code>(?![\s\S]*<code)/);

      if (codeBlockMatch) {
        const codeText = codeBlockMatch[1];
        const buttonId = `copy-button-${Date.now()}-${Math.random()}`;
        return `<div data-copy-button="${buttonId}" data-copy-text="${escapeHtml(codeText)}"></div>`;
      }

      return '';
    });

    // Add other interactive enhancements here
    enhanced = addInteractiveCheckboxes(enhanced);
    enhanced = addExpandableSection(enhanced);

    return enhanced;
  };

  const addInteractiveCheckboxes = (content: string): string => {
    // Convert markdown-style checkboxes to interactive ones
    return content.replace(
      /- \[ \] (.+)/g,
      '<label class="interactive-checkbox"><input type="checkbox" data-interactive="checkbox"> <span>$1</span></label>'
    ).replace(
      /- \[x\] (.+)/g,
      '<label class="interactive-checkbox"><input type="checkbox" checked data-interactive="checkbox"> <span>$1</span></label>'
    );
  };

  const addExpandableSection = (content: string): string => {
    // Convert details/summary sections to interactive expandable content
    return content.replace(
      /<details>\s*<summary>([^<]+)<\/summary>([\s\S]*?)<\/details>/g,
      '<div class="expandable-section" data-interactive="expandable"><button class="expandable-toggle">$1</button><div class="expandable-content">$2</div></div>'
    );
  };

  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const handleInteraction = useCallback((type: string, data: any) => {
    setInteractions(prev => ({
      ...prev,
      [type]: { ...prev[type], ...data }
    }));

    // Track completion based on interactions
    if (type === 'checkbox') {
      // Could implement logic to check if all required checkboxes are completed
    }
  }, []);

  const markAsCompleted = useCallback(() => {
    setIsCompleted(true);
    onComplete();
  }, [onComplete]);

  // Handle clicks on enhanced content
  const handleContentClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Handle expandable sections
    if (target.classList.contains('expandable-toggle')) {
      e.preventDefault();
      const content = target.nextElementSibling as HTMLElement;
      const isExpanded = content.style.display !== 'none';
      content.style.display = isExpanded ? 'none' : 'block';
      target.setAttribute('aria-expanded', (!isExpanded).toString());
    }

    // Handle interactive checkboxes
    if (target.type === 'checkbox' && target.dataset.interactive === 'checkbox') {
      handleInteraction('checkbox', {
        [target.id || `checkbox-${Date.now()}`]: target.checked
      });
    }
  }, [handleInteraction]);

  return (
    <div className="exercise-interactive">
      <div className="exercise-content">
        <div
          className="content-body"
          dangerouslySetInnerHTML={{ __html: processedContent }}
          onClick={handleContentClick}
        />

        {/* Render copy buttons for marked locations */}
        <CopyButtonRenderer content={processedContent} />
      </div>

      <div className="exercise-actions">
        <div className="action-buttons">
          <button
            onClick={onPrevious}
            className="btn btn-outline"
            type="button"
          >
            ← Previous
          </button>

          {!isCompleted && (
            <button
              onClick={markAsCompleted}
              className="btn btn-primary"
              type="button"
            >
              Mark Complete
            </button>
          )}

          <button
            onClick={onNext}
            className="btn btn-primary"
            type="button"
          >
            Next →
          </button>
        </div>

        {isCompleted && (
          <div className="completion-indicator">
            <span className="completion-icon">✅</span>
            <span className="completion-text">Section completed!</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Helper component to render copy buttons in marked locations
 */
function CopyButtonRenderer({ content }: { content: string }) {
  useEffect(() => {
    // Find all copy button markers and render React components
    const copyButtonElements = document.querySelectorAll('[data-copy-button]');

    copyButtonElements.forEach((element) => {
      const copyText = element.getAttribute('data-copy-text') || '';
      if (copyText && element.children.length === 0) {
        // Create React component container
        const container = document.createElement('div');
        element.appendChild(container);

        // This would need to be rendered via a React portal or similar
        // For now, we'll use a simple HTML button
        container.innerHTML = `
          <button class="copy-button copy-button--primary" onclick="navigator.clipboard.writeText('${copyText}')">
            <span class="copy-button__icon">📋</span>
            <span class="copy-button__text">Copy</span>
          </button>
        `;
      }
    });
  }, [content]);

  return null;
}

// CSS Module styles
export const styles = `
.exercise-interactive {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 100%;
}

.exercise-content {
  flex: 1;
  min-height: 400px;
}

.content-body {
  line-height: 1.6;
  font-size: 1rem;
  color: var(--text-primary, #1a202c);
}

.content-body h1,
.content-body h2,
.content-body h3,
.content-body h4,
.content-body h5,
.content-body h6 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  line-height: 1.2;
  color: var(--text-primary, #1a202c);
}

.content-body p {
  margin-bottom: 1rem;
}

.content-body code {
  background: var(--bg-code, #f7fafc);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.875rem;
  color: var(--text-code, #2d3748);
}

.content-body pre {
  background: var(--bg-code, #f7fafc);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
  border: 1px solid var(--border-color, #e2e8f0);
}

.content-body pre code {
  background: none;
  padding: 0;
  border-radius: 0;
}

.interactive-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.interactive-checkbox:hover {
  background: var(--bg-hover, #f7fafc);
}

.interactive-checkbox input[type="checkbox"] {
  margin: 0;
  cursor: pointer;
}

.expandable-section {
  margin: 1rem 0;
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 0.5rem;
  overflow: hidden;
}

.expandable-toggle {
  width: 100%;
  padding: 1rem;
  background: var(--bg-secondary, #f7fafc);
  border: none;
  text-align: left;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.expandable-toggle:hover {
  background: var(--bg-hover, #edf2f7);
}

.expandable-toggle::after {
  content: '+';
  float: right;
  transition: transform 0.2s;
}

.expandable-toggle[aria-expanded="true"]::after {
  transform: rotate(45deg);
}

.expandable-content {
  padding: 1rem;
  display: none;
}

.exercise-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color, #e2e8f0);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-outline {
  border-color: var(--border-color, #e2e8f0);
  color: var(--text-primary, #1a202c);
}

.btn-outline:hover {
  background: var(--bg-hover, #f7fafc);
}

.btn-primary {
  background: var(--primary-color, #3182ce);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover, #2c5282);
}

.completion-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--success-light, #f0fff4);
  border: 1px solid var(--success-color, #38a169);
  border-radius: 0.375rem;
  color: var(--success-color, #38a169);
  font-weight: 600;
}

.completion-icon {
  font-size: 1.2rem;
}

/* Responsive design */
@media (max-width: 640px) {
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    justify-content: center;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .content-body {
    --text-primary: #f7fafc;
    --bg-code: #2d3748;
    --text-code: #e2e8f0;
    --border-color: #4a5568;
  }

  .interactive-checkbox:hover {
    --bg-hover: #2d3748;
  }

  .expandable-toggle {
    --bg-secondary: #2d3748;
  }

  .expandable-toggle:hover {
    --bg-hover: #4a5568;
  }
}
`;