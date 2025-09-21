export default {
  title: 'Components/ExerciseCard',
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    duration: { control: 'text' },
    difficulty: {
      control: 'select',
      options: ['Beginner', 'Intermediate', 'Advanced']
    },
    status: {
      control: 'select',
      options: ['not-started', 'in-progress', 'completed']
    },
    progress: {
      control: { type: 'range', min: 0, max: 100, step: 1 }
    },
    objectives: { control: 'object' },
    onStart: { action: 'started' },
    onStartOver: { action: 'started-over' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Exercise card component that displays exercise information and allows users to start or continue exercises.',
      },
    },
  },
};

const Template = ({
  title = 'Claude Code Fundamentals',
  description = 'Master project structure and context management for multi-agent workflows',
  duration = '2 hours',
  difficulty = 'Beginner',
  status = 'not-started',
  progress = 0,
  objectives = [
    'Understand hierarchical context management',
    'Create agent isolation patterns',
    'Implement session handoff procedures'
  ],
  onStart,
  onStartOver
}) => {
  const exerciseId = 'test-exercise';

  const getActionText = (status) => {
    switch (status) {
      case 'completed': return 'Review Exercise';
      case 'in-progress': return 'Continue';
      default: return 'Start Exercise';
    }
  };

  return `
    <div class="exercise-card ${status}">
      <div class="exercise-header">
        <h3>${title}</h3>
        <div class="exercise-meta">
          <span class="duration">${duration}</span>
          <span class="difficulty">${difficulty}</span>
        </div>
      </div>

      <p class="exercise-description">${description}</p>

      <div class="exercise-objectives">
        <h4>Learning Objectives:</h4>
        <ul>
          ${objectives.map(objective => `<li>${objective}</li>`).join('')}
        </ul>
      </div>

      <div class="exercise-actions">
        <div class="action-buttons">
          <button
            class="btn btn-primary"
            onclick="handleStart('${exerciseId}')"
          >
            ${getActionText(status)}
          </button>

          ${progress > 0 ? `
            <button
              class="btn btn-outline btn-small"
              onclick="handleStartOver('${exerciseId}')"
            >
              🔄 Start Over
            </button>
          ` : ''}
        </div>

        ${progress > 0 ? `
          <div class="exercise-progress">
            <div class="progress-bar small">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <span class="progress-text">${progress}% complete</span>
          </div>
        ` : ''}
      </div>
    </div>

    <script>
      window.handleStart = window.handleStart || ((id) => {
        console.log('Start exercise:', id);
        ${onStart ? onStart.toString() + '(id)' : ''}
      });

      window.handleStartOver = window.handleStartOver || ((id) => {
        console.log('Start over:', id);
        ${onStartOver ? onStartOver.toString() + '(id)' : ''}
      });
    </script>
  `;
};

export const Default = Template.bind({});
Default.args = {};

export const InProgress = Template.bind({});
InProgress.args = {
  status: 'in-progress',
  progress: 45,
};

export const Completed = Template.bind({});
Completed.args = {
  status: 'completed',
  progress: 100,
  difficulty: 'Intermediate',
};

export const Advanced = Template.bind({});
Advanced.args = {
  title: 'Advanced Multi-Agent Orchestration',
  description: 'Complex workflow management and dynamic agent allocation patterns',
  duration: '4 hours',
  difficulty: 'Advanced',
  objectives: [
    'Dynamic agent allocation strategies',
    'Complex workflow state management',
    'Production-ready error handling',
    'Performance optimization techniques'
  ],
};

export const LongContent = Template.bind({});
LongContent.args = {
  title: 'Exercise with Very Long Title That Should Wrap Properly',
  description: 'This is a very long description that should demonstrate how the exercise card handles longer content. It should wrap nicely and maintain good readability across different viewport sizes.',
  objectives: [
    'This is a very long objective that demonstrates text wrapping',
    'Another objective with substantial content to test layout',
    'Short objective',
    'Yet another lengthy objective to ensure proper spacing and alignment'
  ],
};