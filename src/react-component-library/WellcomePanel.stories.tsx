import type { Meta, StoryObj } from '@storybook/react-vite';
import { rem } from 'polished';
import { styled } from 'styled-components';
import { WellcomePanel } from './WellcomePanel';
import * as UI from './WellcomePanel.styles';

const Preview = styled.div`
  min-height: 100dvh;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  place-items: center;
  padding: ${rem(30)};
  background:
    radial-gradient(
      circle at center,
      rgba(8, 25, 43, 0.46),
      rgba(1, 3, 9, 0.91)
    ),
    #02040b;
`;

const meta = {
  title: 'Components/Wellcome Panel',
  component: WellcomePanel,
  args: {
    title: (
      <>
        <UI.Eyebrow>Deep-space relay online</UI.Eyebrow>NEON
        <br />
        ASTEROIDS
      </>
    ),
    subtitle: (
      <>
        Break the incoming field into fragments and survive.
        <br />
        No drag: momentum persists up to the speed limit. Weapon cores last 30
        seconds. Chain hits before the combo meter drains.
      </>
    ),
    children: (
      <>
        <UI.LaunchButton type="button">
          <span>Launch</span>
          <UI.Arrow aria-hidden="true">↗</UI.Arrow>
        </UI.LaunchButton>
        <UI.Controls>
          <div>
            <span>A / D</span> rotate
          </div>
          <div>
            <span>W</span> thrust
          </div>
          <div>
            <span>S</span> brake
          </div>
          <div>
            <span>Space</span> fire
          </div>
          <div>
            <span>Shift</span> hyperspace
          </div>
        </UI.Controls>
        <UI.TouchInstructions>
          Steer / thrust · Hold brake · Tap jump · Auto fire
        </UI.TouchInstructions>
      </>
    ),
  },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <Preview>
        <Story />
      </Preview>
    ),
  ],
} satisfies Meta<typeof WellcomePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
