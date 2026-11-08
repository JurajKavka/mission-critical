import { regionTargets } from '../data/targets';
import { getCurrentTargetId } from './session';
import { defaultSeed } from './shuffle';
import type { ChallengeConfig, GameSession, RegionId, Target } from './types';

export const regionIds: readonly RegionId[] = [
  'africa',
  'south-america',
  'usa',
  'europe',
];

export const createConfig = (
  overrides: Partial<ChallengeConfig> = {},
): ChallengeConfig => ({
  regionId: 'africa',
  level: 'beginner',
  learning: false,
  seed: defaultSeed,
  ...overrides,
});

export const getCurrentTarget = (session: GameSession): Target => {
  const target = regionTargets[session.config.regionId].find(
    (candidate) => candidate.id === getCurrentTargetId(session),
  );
  if (!target) {
    throw new Error('Expected a current target');
  }
  return target;
};

export const freezeSession = (session: GameSession): GameSession => {
  Object.freeze(session.config);
  Object.freeze(session.guessedIds);
  Object.freeze(session.remainingIds);
  return Object.freeze(session);
};
