import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { AtlasRushResults } from '../games/atlas-rush/components/AtlasRushResults';
import { regionTargets } from '../games/atlas-rush/data/targets';
import { getRoundSeconds } from '../games/atlas-rush/domain/levels';
import { getCoverage } from '../games/atlas-rush/domain/results';
import { defaultSeed } from '../games/atlas-rush/domain/shuffle';
import type {
  GameResults,
  LevelId,
  RegionId,
} from '../games/atlas-rush/domain/types';
import { AtlasRushLayout } from './game-layouts';

const createResult = (
  regionId: RegionId,
  level: LevelId,
  correct: number,
  elapsedSeconds?: number,
): GameResults => {
  const total = regionTargets[regionId].length;
  return {
    challengeVersion: 1,
    config: { regionId, level, learning: false, seed: defaultSeed },
    total,
    correct,
    notGuessed: total - correct,
    coverage: getCoverage(correct, total),
    elapsedSeconds: elapsedSeconds ?? getRoundSeconds(total, level),
    finishReason: correct === total ? 'completed' : 'timeout',
  };
};

const meta = {
  title: 'Atlas Rush/Results Screen',
  component: AtlasRushResults,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <AtlasRushLayout.Wrapper>
        <Story />
      </AtlasRushLayout.Wrapper>
    ),
  ],
  args: {
    result: createResult('south-america', 'expert', 7),
    onPlayAgain: fn(),
    onChangeSettings: fn(),
  },
} satisfies Meta<typeof AtlasRushResults>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TimeExpired: Story = {};

export const Saving: Story = { args: { saveStatus: 'saving' } };

export const SaveFailed: Story = {
  args: { saveStatus: 'error', onRetrySave: fn() },
};

export const CompletedCountries: Story = {
  args: {
    result: createResult('africa', 'middle', regionTargets.africa.length, 183),
  },
};

export const CompletedStates: Story = {
  args: {
    result: createResult('usa', 'beginner', regionTargets.usa.length, 123),
  },
};

export const MobileZeroCoverage: Story = {
  args: { result: createResult('world', 'beginner', 0) },
  globals: { viewport: { value: '375-667' } },
};
