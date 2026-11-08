import type { Meta, StoryObj } from '@storybook/react-vite';
import { BreadcrumbDivider } from './BreadcrumbDivider';
import { Breadcrumbs } from './Breadcrumbs';

const meta = {
  title: 'Components/Breadcrumb Divider',
  component: BreadcrumbDivider,
} satisfies Meta<typeof BreadcrumbDivider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Breadcrumbs>
      Mission Critical
      <BreadcrumbDivider />
      Atlas Rush
    </Breadcrumbs>
  ),
};
