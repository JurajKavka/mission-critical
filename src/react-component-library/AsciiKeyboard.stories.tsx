import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AsciiKeyboard } from './AsciiKeyboard';
import type { AsciiKey } from './AsciiKeyboard';

const meta = {
  title: 'Components/Mobile Keyboard',
  component: AsciiKeyboard,
  args: {
    onKey: () => {},
    onToggleNative: () => {},
    usesNativeKeyboard: false,
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof AsciiKeyboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function KeyboardStory(args) {
    const [answer, setAnswer] = useState('');
    const [usesNativeKeyboard, setUsesNativeKeyboard] = useState(false);
    const handleKey = (key: AsciiKey) => {
      if (key === 'Backspace') {
        setAnswer((current) => current.slice(0, -1));
      } else if (key === 'Space') {
        setAnswer((current) => `${current} `);
      } else if (key === 'Enter' || key === 'Skip') {
        setAnswer('');
      } else {
        setAnswer((current) => current + key);
      }
    };

    return (
      <div style={{ width: 'min(100%, 480px)' }}>
        <AsciiKeyboard
          {...args}
          onKey={handleKey}
          onToggleNative={() => setUsesNativeKeyboard((current) => !current)}
          usesNativeKeyboard={usesNativeKeyboard}
        />
        <output aria-live="polite">{answer || 'Enter an answer'}</output>
      </div>
    );
  },
};

export const NativeKeyboardSelected: Story = {
  args: { usesNativeKeyboard: true },
};
