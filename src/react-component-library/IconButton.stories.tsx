import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from './IconButton';

const meta = {
  title: 'Components/Icon Button',
  component: IconButton,
  args: { name: 'exit', label: 'End game', onClick: () => {} },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const ZoomIn: Story = { args: { name: 'zoom-in', label: 'Zoom in' } };
export const ZoomOut: Story = {
  args: { name: 'zoom-out', label: 'Zoom out', pressed: true },
};
export const Disabled: Story = { args: { disabled: true } };
