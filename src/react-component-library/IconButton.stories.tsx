import type { Meta, StoryObj } from '@storybook/react-vite';
import { rem } from 'polished';
import { styled } from 'styled-components';
import { IconButton } from './IconButton';

const ButtonRow = styled.div`
  display: flex;
  gap: ${rem(8)};
`;

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
export const GameControls: Story = {
  render: (args) => (
    <ButtonRow>
      <IconButton {...args} name="zoom-in" label="Zoom in" />
      <IconButton {...args} name="zoom-out" label="Zoom out" />
      <IconButton {...args} name="exit" label="End game" />
    </ButtonRow>
  ),
};
