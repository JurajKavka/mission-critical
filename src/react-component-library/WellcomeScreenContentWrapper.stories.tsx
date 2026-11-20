import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActionButton } from './ActionButton';
import { Breadcrumbs } from './Breadcrumbs';
import { WellcomePanel } from './WellcomePanel';
import { WellcomeScreenContentWrapper } from './WellcomeScreenContentWrapper';
import { GlobalStyles, LandingWrapper, TopBar } from './atlas-styles';

const meta = {
  title: 'Components/Wellcome Screen Content Wrapper',
  component: WellcomeScreenContentWrapper,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <>
        <GlobalStyles />
        <LandingWrapper>
          <TopBar>
            <Breadcrumbs
              breadcrumbs={[
                { label: 'Atlas Rush', link: '/games/atlas-rush/' },
              ]}
            />
          </TopBar>
          <Story />
        </LandingWrapper>
      </>
    ),
  ],
  args: {
    children: (
      <WellcomePanel
        title={
          <>
            Atlas <em>Rush</em>
          </>
        }
        subtitle="Identify countries before the clock runs out."
      >
        <ActionButton label="Start survey" />
      </WellcomePanel>
    ),
  },
} satisfies Meta<typeof WellcomeScreenContentWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WellcomePanelContent: Story = {
  args: {
    children: (
      <WellcomePanel
        title="Neon Asteroids"
        subtitle="Survive the asteroid field."
      >
        <ActionButton label="Launch" />
      </WellcomePanel>
    ),
  },
};
