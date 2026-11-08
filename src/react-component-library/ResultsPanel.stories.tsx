import type { Meta, StoryObj } from '@storybook/react-vite';
import { defaultSeed } from '../games/atlas-rush/domain/shuffle';
import type { GameResults } from '../games/atlas-rush/domain/types';
import { ResultsPanel } from './ResultsPanel';

const TIMEOUT_RESULT: GameResults = {
  challengeVersion: 1,
  config: {
    regionId: 'south-america',
    level: 'beginner',
    learning: false,
    seed: defaultSeed,
  },
  total: 54,
  correct: 37,
  notGuessed: 17,
  coverage: 69,
  elapsedSeconds: 300,
  finishReason: 'timeout',
};

const meta = {
  title: 'Atlas Rush/Results Panel',
  component: ResultsPanel,
  args: {
    result: TIMEOUT_RESULT,
    onPlayAgain: () => {},
    onChangeSettings: () => {},
  },
} satisfies Meta<typeof ResultsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TimeExpired: Story = {};

export const Completed: Story = {
  args: {
    result: {
      ...TIMEOUT_RESULT,
      config: { ...TIMEOUT_RESULT.config, regionId: 'usa' },
      total: 50,
      correct: 50,
      notGuessed: 0,
      coverage: 100,
      elapsedSeconds: 123,
      finishReason: 'completed',
    },
  },
};
