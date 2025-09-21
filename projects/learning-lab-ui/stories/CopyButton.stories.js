export default {
  title: 'Components/CopyButton',
  tags: ['autodocs'],
  argTypes: {
    text: { control: 'text' },
    label: { control: 'text' },
    successMessage: { control: 'text' },
    disabled: { control: 'boolean' },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large']
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline']
    },
    onCopy: { action: 'copied' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Copy button component that copies text to clipboard and shows success feedback.',
      },
    },
  },
};

const Template = ({
  text = 'Hello, this is sample text to copy!',
  label = '📋 Copy',
  successMessage = '✅ Copied!',
  disabled = false,
  size = 'medium',
  variant = 'primary',
  onCopy
}) => {
  const sizeClass = size !== 'medium' ? `btn-${size}` : '';
  const variantClass = variant !== 'primary' ? `btn-${variant}` : 'btn-primary';
  const disabledAttr = disabled ? 'disabled' : '';

  return `
    <div class="copy-button-container">
      <div class="starter-prompt-container">
        <button
          id="copy-btn"
          class="copy-button ${variantClass} ${sizeClass}"
          onclick="handleCopy('${text.replace(/'/g, "\\'")}')"
          ${disabledAttr}
        >
          ${label}
        </button>
      </div>

      <div id="success-message" class="copy-success-message" style="display: none;">
        ${successMessage}
      </div>
    </div>

    <div class="demo-content">
      <h4>Text to be copied:</h4>
      <code style="background: #f5f5f5; padding: 8px; border-radius: 4px; display: block; margin: 8px 0;">
        ${text}
      </code>
    </div>

    <script>
      window.handleCopy = window.handleCopy || ((textToCopy) => {
        console.log('Copying text:', textToCopy);

        // Simulate clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            showSuccessMessage();
            ${onCopy ? onCopy.toString() + '(textToCopy)' : ''}
          }).catch(() => {
            // Fallback
            fallbackCopy(textToCopy);
          });
        } else {
          fallbackCopy(textToCopy);
        }
      });

      function fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          showSuccessMessage();
          ${onCopy ? onCopy.toString() + '(text)' : ''}
        } catch (err) {
          console.error('Failed to copy text:', err);
        }
        document.body.removeChild(textArea);
      }

      function showSuccessMessage() {
        const message = document.getElementById('success-message');
        const button = document.getElementById('copy-btn');

        message.style.display = 'block';
        button.style.opacity = '0.7';

        setTimeout(() => {
          message.style.display = 'none';
          button.style.opacity = '1';
        }, 2000);
      }
    </script>

    <style>
      .copy-button-container {
        margin-bottom: 16px;
      }

      .copy-success-message {
        color: #059669;
        font-size: 14px;
        margin-top: 8px;
        font-weight: 500;
      }

      .demo-content {
        margin-top: 24px;
        padding: 16px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        background: #f9fafb;
      }

      .demo-content h4 {
        margin-top: 0;
        margin-bottom: 8px;
        color: #374151;
      }

      .demo-content code {
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.4;
        color: #1f2937;
      }
    </style>
  `;
};

export const Default = Template.bind({});
Default.args = {};

export const Small = Template.bind({});
Small.args = {
  size: 'small',
  label: '📋 Copy',
};

export const Large = Template.bind({});
Large.args = {
  size: 'large',
  label: '📋 Copy to Clipboard',
};

export const Outline = Template.bind({});
Outline.args = {
  variant: 'outline',
  label: '📄 Copy Text',
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: 'secondary',
  label: '📋 Copy',
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  label: '📋 Copy (Disabled)',
};

export const LongText = Template.bind({});
LongText.args = {
  text: `You are the **Testing Agent** for the Astro migration project.

**Your Mission**: Set up comprehensive testing infrastructure and create test plans to ensure the migration is bulletproof.

**Context**:
- Migrating critical learning platform from Alpine.js to Astro
- Need to ensure zero regression in functionality
- Must validate all interactive features work correctly`,
  label: '📋 Copy Prompt',
};

export const CodeSnippet = Template.bind({});
CodeSnippet.args = {
  text: `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
  },
});`,
  label: '📋 Copy Code',
  successMessage: '✅ Code copied to clipboard!',
};

export const CustomMessage = Template.bind({});
CustomMessage.args = {
  text: 'npm install @testing-library/jest-dom',
  label: '📦 Copy Install Command',
  successMessage: '🚀 Command ready to paste!',
};