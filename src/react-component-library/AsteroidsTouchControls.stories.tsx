import type { Meta, StoryObj } from '@storybook/react-vite';
import { TouchControls } from '../pages/games/asteroids/_game/touch-controls/TouchControls';

const meta = {
  title: 'Games/Asteroids/Touch Controls',
  component: TouchControls,
  args: {
    alwaysVisible: true,
    onSteer: () => {},
    onBrake: () => {},
    onHyperspace: () => {},
    getHyperspaceCooldown: () => 0,
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TouchControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {};
export const HyperspaceCooldown: Story = {
  args: { getHyperspaceCooldown: () => 3 },
};
