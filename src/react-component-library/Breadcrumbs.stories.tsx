import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumbs } from './Breadcrumbs';

const meta = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  args: {
    breadcrumbs: [{ label: 'Atlas Rush', link: '/games/atlas-rush/' }],
  },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoLevels: Story = {};

export const ThreeLevels: Story = {
  args: {
    breadcrumbs: [
      { label: 'Atlas Rush', link: '/games/atlas-rush/' },
      { label: 'Africa', link: '/games/atlas-rush/africa/' },
    ],
  },
};

export const Asteroids: Story = {
  args: {
    breadcrumbs: [{ label: 'Neon Asteroids', link: '/games/asteroids/' }],
  },
};
