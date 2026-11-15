import type { Meta, StoryObj } from '@storybook/react-vite';
import { rem } from 'polished';
import { styled } from 'styled-components';
import { RadioButton } from './RadioButton';

const RadioOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${rem(12)};
`;

const meta = {
  title: 'Components/Radio Button',
  component: RadioButton,
  args: {
    label: 'World',
    value: 'world',
    defaultChecked: false,
  },
  argTypes: {
    label: { control: 'text' },
  },
} satisfies Meta<typeof RadioButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true },
};
export const Group: Story = {
  render: (args) => (
    <RadioOptions role="radiogroup" aria-label="Select a region">
      <RadioButton
        {...args}
        label="World"
        name="storybook-region"
        value="world"
        defaultChecked
      />
      <RadioButton
        {...args}
        label="Europe"
        name="storybook-region"
        value="europe"
        defaultChecked={false}
      />
      <RadioButton
        {...args}
        label="Africa"
        name="storybook-region"
        value="africa"
        defaultChecked={false}
      />
    </RadioOptions>
  ),
};
