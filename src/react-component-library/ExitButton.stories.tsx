import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExitButton } from './ExitButton';

const meta = {
  title: 'Components/Exit Button',
  component: ExitButton,
  args: { onClick: () => {} },
} satisfies Meta<typeof ExitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
