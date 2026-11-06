import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AnswerTextInput } from './AnswerTextInput';

const meta = {
  title: 'Components/Answer Text Input',
  component: AnswerTextInput,
  args: {
    'aria-label': 'Country name',
    placeholder: 'Enter country name in English',
  },
} satisfies Meta<typeof AnswerTextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function AnswerTextInputStory(args) {
    const [answer, setAnswer] = useState('');

    return (
      <AnswerTextInput
        {...args}
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
      />
    );
  },
};

export const Disabled: Story = { args: { disabled: true } };
export const CustomKeyboard: Story = {
  args: { isUsingCustomKeyboard: true, value: 'Canada' },
};

export const CustomKeyboardEmpty: Story = {
  args: { isUsingCustomKeyboard: true, value: '' },
};
