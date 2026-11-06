import { challengeVersion } from '../../domain/shuffle';
import type { ChallengeConfig, GameSession } from '../../domain/types';
import { isValidSession } from '../../state/validateSession';
import { isValidSeed } from '../challenge-url';

export type SessionSnapshot = GameSession & {
  readonly currentTargetId: string | null;
  readonly remainingSeconds: number;
  readonly correctCount: number;
};

export type SessionRecord = {
  readonly key: string;
  readonly schemaVersion: 1;
  readonly generation: string;
  readonly revision: number;
  readonly updatedAt: number;
  readonly snapshot: SessionSnapshot | null;
};

export const getChallengeIdentity = (config: ChallengeConfig): string =>
  JSON.stringify([
    challengeVersion,
    config.regionId,
    config.level,
    config.learning,
    config.seed,
  ]);

export const captureSnapshot = (session: GameSession): SessionSnapshot => ({
  ...session,
  config: { ...session.config },
  remainingIds: [...session.remainingIds],
  guessedIds: [...session.guessedIds],
  currentTargetId: session.remainingIds[0] ?? null,
  remainingSeconds: session.durationSeconds - session.elapsedSeconds,
  correctCount: session.guessedIds.length,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isValidRecord = (
  value: unknown,
  config: ChallengeConfig,
): value is SessionRecord => {
  if (
    !isRecord(value) ||
    value.key !== getChallengeIdentity(config) ||
    value.schemaVersion !== 1 ||
    typeof value.generation !== 'string' ||
    value.generation.length === 0 ||
    typeof value.revision !== 'number' ||
    !Number.isSafeInteger(value.revision) ||
    value.revision < 0 ||
    typeof value.updatedAt !== 'number' ||
    !Number.isFinite(value.updatedAt)
  ) {
    return false;
  }
  if (value.snapshot === null) {
    return true;
  }
  const snapshot = value.snapshot;
  if (!isRecord(snapshot)) {
    return false;
  }
  const fields: Record<string, unknown> = snapshot;
  if (
    !isValidSession(snapshot) ||
    !isValidSeed(snapshot.config.seed) ||
    getChallengeIdentity(snapshot.config) !== value.key ||
    snapshot.phase === 'ready'
  ) {
    return false;
  }
  return (
    fields.currentTargetId === (snapshot.remainingIds[0] ?? null) &&
    fields.correctCount === snapshot.guessedIds.length &&
    fields.remainingSeconds ===
      snapshot.durationSeconds - snapshot.elapsedSeconds
  );
};
