import type { Meta, StoryObj } from '@storybook/react-vite';
import { BreadcrumbDivider } from './BreadcrumbDivider';
import { Breadcrumbs, BreadcrumbsWrapper } from './Breadcrumbs';
import { IconButton } from './IconButton';
import { HudMetric, HudStats, LandingWrapper, TopBar } from './atlas-styles';

const meta = {
  title: 'Components/Top Bar',
  component: TopBar,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <LandingWrapper>
        <Story />
      </LandingWrapper>
    ),
  ],
  args: {
    children: (
      <Breadcrumbs
        breadcrumbs={[{ label: 'Atlas Rush', link: '/games/atlas-rush/' }]}
      />
    ),
  },
} satisfies Meta<typeof TopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Welcome: Story = {};
export const Gameplay: Story = {
  args: {
    children: (
      <>
        <Breadcrumbs
          breadcrumbs={[{ label: 'Europe', link: '/games/atlas-rush/europe/' }]}
        />
        <HudStats>
          <HudMetric>
            <span>Identified</span>
            <strong>03/45</strong>
          </HudMetric>
          <HudMetric>
            <span>Countdown</span>
            <strong>02:43</strong>
          </HudMetric>
          <IconButton name="exit" label="End game" onClick={() => {}} />
        </HudStats>
      </>
    ),
  },
};
export const Results: Story = {
  args: {
    children: (
      <BreadcrumbsWrapper as="nav" aria-label="Mission report status">
        <span>Mission report</span>
        <BreadcrumbDivider />
        <span>Complete</span>
      </BreadcrumbsWrapper>
    ),
  },
};
