import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActionButton } from './ActionButton';
import { StartGamePanel } from './StartGamePanel';

const meta = {
  title: 'Components/Start Game Panel',
  component: StartGamePanel,
  args: {
    title: (
      <>
        Atlas <em>Rush</em>
      </>
    ),
    subtitle: 'Identify countries before the clock runs out.',
    children: <ActionButton label="Start survey" />,
  },
} satisfies Meta<typeof StartGamePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
