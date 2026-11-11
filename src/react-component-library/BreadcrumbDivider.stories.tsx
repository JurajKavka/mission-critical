import type { Meta, StoryObj } from '@storybook/react-vite';
import { BreadcrumbDivider } from './BreadcrumbDivider';
import { BreadcrumbsWrapper } from './Breadcrumbs';

const meta = {
  title: 'Components/Breadcrumb Divider',
  component: BreadcrumbDivider,
} satisfies Meta<typeof BreadcrumbDivider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <BreadcrumbsWrapper>
      Mission Critical
      <BreadcrumbDivider />
      Atlas Rush
    </BreadcrumbsWrapper>
  ),
};
