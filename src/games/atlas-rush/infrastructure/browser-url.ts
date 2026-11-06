import { serializeChallengeQuery } from './challenge-url';
import type { ChallengeConfig } from '../domain/types';

export const replaceCurrentChallenge = (config: ChallengeConfig): void => {
  const search = serializeChallengeQuery(config);
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${search}${window.location.hash}`,
  );
};

export const createRandomSeed = (): string => {
  const bytes = new Uint8Array(12);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
};
