import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { regionTargets } from '../data/targets';
import { regionMetadata } from '../data/regions';
import { getCoverage } from '../domain/results';
import { defaultSeed } from '../domain/shuffle';
import type { GameResults, RegionId } from '../domain/types';
import { ResultsPanel } from './ResultsPanel';

const REGIONS: readonly RegionId[] = [
  'africa',
  'europe',
  'south-america',
  'usa',
];
const ignoreAction = () => {};

describe('results panel', () => {
  it.each(REGIONS)(
    'shows the correct region, counts and elapsed time for %s',
    (regionId) => {
      const total = regionTargets[regionId].length;
      const result: GameResults = {
        challengeVersion: 1,
        config: {
          regionId,
          level: 'expert',
          learning: true,
          seed: defaultSeed,
        },
        total,
        correct: 3,
        notGuessed: total - 3,
        coverage: getCoverage(3, total),
        elapsedSeconds: 65,
        finishReason: 'timeout',
      };
      const markup = renderToStaticMarkup(
        <ResultsPanel
          result={result}
          onPlayAgain={ignoreAction}
          onChangeSettings={ignoreAction}
          onCopyChallenge={ignoreAction}
        />,
      );
      expect(markup).toContain(regionMetadata[regionId].name);
      expect(markup).toContain('Expert');
      expect(markup).toContain('01:05');
      expect(markup).toContain(`${result.coverage}%`);
      expect(markup).toContain('Time is up');
      expect(markup).toContain('Play again');
      expect(markup).toContain('Change settings');
    },
  );
  it('presents the completion result', () => {
    const result: GameResults = {
      challengeVersion: 1,
      config: {
        regionId: 'usa',
        level: 'beginner',
        learning: false,
        seed: defaultSeed,
      },
      total: 50,
      correct: 50,
      notGuessed: 0,
      coverage: 100,
      elapsedSeconds: 123,
      finishReason: 'completed',
    };
    const markup = renderToStaticMarkup(
      <ResultsPanel
        result={result}
        onPlayAgain={ignoreAction}
        onChangeSettings={ignoreAction}
        onCopyChallenge={ignoreAction}
      />,
    );
    expect(markup).toContain('Atlas complete');
    expect(markup).toContain('All states identified in 02:03.');
    expect(markup).toContain('100%');
  });
});
