export default {
  title: 'Components/ProgressIndicator',
  tags: ['autodocs'],
  argTypes: {
    completed: { control: { type: 'number', min: 0, max: 10 } },
    total: { control: { type: 'number', min: 1, max: 10 } },
    showPercentage: { control: 'boolean' },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large']
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Progress indicator component that shows completion status with text and visual progress bar.',
      },
    },
  },
};

const Template = ({
  completed = 3,
  total = 5,
  showPercentage = true,
  size = 'medium'
}) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const progressText = `${completed} of ${total} sections`;
  const sizeClass = size === 'small' ? 'small' : '';

  return `
    <div class="progress-indicator ${size}">
      <span>${progressText}${showPercentage ? ` (${percentage}%)` : ''}</span>
      <div class="progress-bar ${sizeClass}">
        <div class="progress-fill" style="width: ${percentage}%"></div>
      </div>
    </div>
  `;
};

export const Default = Template.bind({});
Default.args = {};

export const Small = Template.bind({});
Small.args = {
  size: 'small',
  completed: 2,
  total: 4,
};

export const Large = Template.bind({});
Large.args = {
  size: 'large',
  completed: 7,
  total: 8,
};

export const Empty = Template.bind({});
Empty.args = {
  completed: 0,
  total: 5,
};

export const Complete = Template.bind({});
Complete.args = {
  completed: 5,
  total: 5,
};

export const WithoutPercentage = Template.bind({});
WithoutPercentage.args = {
  showPercentage: false,
  completed: 3,
  total: 7,
};

export const SingleSection = Template.bind({});
SingleSection.args = {
  completed: 1,
  total: 1,
};

export const ManyServices = Template.bind({});
ManyServices.args = {
  completed: 8,
  total: 12,
};