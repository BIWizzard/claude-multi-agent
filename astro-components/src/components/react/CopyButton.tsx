import { useState, useCallback } from 'react';
import type { CopyButtonProps } from '../../types';

/**
 * CopyButton - React Island Component
 *
 * Replaces the [COPY_BUTTON] post-processing hack with a proper React component.
 * Provides clipboard functionality with visual feedback and accessibility support.
 */
export default function CopyButton({
  text,
  variant = 'default',
  size = 'medium',
  showIcon = true,
  className = '',
  onCopy
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(false);
      onCopy?.();

      // Reset state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        setCopied(true);
        setError(false);
        onCopy?.();
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        setError(true);
        setTimeout(() => setError(false), 2000);
      }
    }
  }, [text, onCopy]);

  const getButtonClasses = () => {
    const baseClasses = 'copy-button';
    const variantClasses = {
      default: 'copy-button--default',
      primary: 'copy-button--primary',
      outline: 'copy-button--outline'
    };
    const sizeClasses = {
      small: 'copy-button--small',
      medium: 'copy-button--medium',
      large: 'copy-button--large'
    };

    const stateClasses = [
      copied && 'copy-button--copied',
      error && 'copy-button--error'
    ].filter(Boolean).join(' ');

    return [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      stateClasses,
      className
    ].filter(Boolean).join(' ');
  };

  const getButtonText = () => {
    if (error) return 'Copy Failed';
    if (copied) return 'Copied!';
    return size === 'small' ? 'Copy' : 'Copy to Clipboard';
  };

  const getIcon = () => {
    if (error) return '⚠️';
    if (copied) return '✅';
    return '📋';
  };

  return (
    <button
      onClick={handleCopy}
      className={getButtonClasses()}
      aria-label={`Copy text to clipboard: ${text.substring(0, 50)}...`}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      disabled={copied}
    >
      {showIcon && <span className="copy-button__icon">{getIcon()}</span>}
      <span className="copy-button__text">{getButtonText()}</span>
    </button>
  );
}

// CSS Module styles (to be created separately)
export const styles = `
.copy-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 0.375rem;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #1a202c);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  user-select: none;
}

.copy-button:hover:not(:disabled) {
  background: var(--bg-secondary, #f7fafc);
  border-color: var(--border-hover, #cbd5e0);
  transform: translateY(-1px);
}

.copy-button:active {
  transform: translateY(0);
}

.copy-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.copy-button:focus {
  outline: 2px solid var(--focus-color, #3182ce);
  outline-offset: 2px;
}

/* Variants */
.copy-button--primary {
  background: var(--primary-color, #3182ce);
  color: white;
  border-color: var(--primary-color, #3182ce);
}

.copy-button--primary:hover:not(:disabled) {
  background: var(--primary-hover, #2c5282);
  border-color: var(--primary-hover, #2c5282);
}

.copy-button--outline {
  background: transparent;
  border-color: var(--primary-color, #3182ce);
  color: var(--primary-color, #3182ce);
}

.copy-button--outline:hover:not(:disabled) {
  background: var(--primary-light, #ebf8ff);
}

/* Sizes */
.copy-button--small {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  gap: 0.25rem;
}

.copy-button--large {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  gap: 0.75rem;
}

/* States */
.copy-button--copied {
  background: var(--success-color, #38a169);
  border-color: var(--success-color, #38a169);
  color: white;
}

.copy-button--error {
  background: var(--error-color, #e53e3e);
  border-color: var(--error-color, #e53e3e);
  color: white;
}

.copy-button__icon {
  font-size: 1em;
  line-height: 1;
}

.copy-button__text {
  line-height: 1;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .copy-button {
    --bg-primary: #2d3748;
    --bg-secondary: #4a5568;
    --text-primary: #f7fafc;
    --border-color: #4a5568;
    --border-hover: #718096;
  }
}
`;