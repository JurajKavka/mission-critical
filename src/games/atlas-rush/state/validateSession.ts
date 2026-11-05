import { regionTargets } from '../data/targets';
import { getRoundSeconds } from '../domain/levels';
import { challengeVersion } from '../domain/shuffle';
import type { GameSession, LevelId, RegionId } from '../domain/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isRegionId = (value: unknown): value is RegionId =>
  typeof value === 'string' && Object.hasOwn(regionTargets, value);

const isLevelId = (value: unknown): value is LevelId =>
  value === 'beginner' || value === 'middle' || value === 'expert';

export const isValidSession = (value: unknown): value is GameSession => {
  if (!isRecord(value) || !isRecord(value.config)) {
    return false;
  }
  const { regionId, level, learning, seed } = value.config;
  if (
    value.challengeVersion !== challengeVersion ||
    !isRegionId(regionId) ||
    !isLevelId(level) ||
    typeof learning !== 'boolean' ||
    typeof seed !== 'string' ||
    !Array.isArray(value.remainingIds) ||
    !Array.isArray(value.guessedIds)
  ) {
    return false;
  }
  const targetIds = regionTargets[regionId].map((target) => target.id);
  const allIds: unknown[] = [...value.remainingIds, ...value.guessedIds];
  if (
    allIds.length !== targetIds.length ||
    allIds.some((id) => typeof id !== 'string' || !targetIds.includes(id)) ||
    new Set(allIds).size !== targetIds.length ||
    value.durationSeconds !== getRoundSeconds(targetIds.length, level) ||
    typeof value.elapsedSeconds !== 'number' ||
    !Number.isFinite(value.elapsedSeconds) ||
    value.elapsedSeconds < 0 ||
    value.elapsedSeconds > value.durationSeconds
  ) {
    return false;
  }
  if (value.phase === 'ready') {
    return (
      value.guessedIds.length === 0 &&
      value.elapsedSeconds === 0 &&
      value.finishReason === null
    );
  } else if (value.phase === 'playing' || value.phase === 'paused') {
    return (
      value.remainingIds.length > 0 &&
      value.elapsedSeconds < value.durationSeconds &&
      value.finishReason === null
    );
  } else if (value.phase === 'finished') {
    return (
      (value.finishReason === 'completed' &&
        value.remainingIds.length === 0 &&
        value.elapsedSeconds < value.durationSeconds) ||
      (value.finishReason === 'timeout' &&
        value.remainingIds.length > 0 &&
        value.elapsedSeconds === value.durationSeconds)
    );
  }
  return false;
};
