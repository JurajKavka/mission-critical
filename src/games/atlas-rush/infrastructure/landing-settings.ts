import { regionMetadata } from '../data/regions';
import type { ChallengeConfig, RegionId } from '../domain/types';
import { parseChallengeQuery, serializeChallengeQuery } from './challenge-url';

const settingsKey = 'atlas-rush-landing-settings';

export const rememberLandingSettings = (config: ChallengeConfig): void => {
  try {
    sessionStorage.setItem(
      settingsKey,
      JSON.stringify({
        regionId: config.regionId,
        search: serializeChallengeQuery(config),
      }),
    );
  } catch {
    // Returning to the landing page remains possible when browser storage is unavailable.
  }
};

export const takeLandingSettings = (): ChallengeConfig | null => {
  try {
    const saved = sessionStorage.getItem(settingsKey);
    sessionStorage.removeItem(settingsKey);
    if (!saved) {
      return null;
    }
    const parsed: unknown = JSON.parse(saved);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('regionId' in parsed) ||
      !('search' in parsed) ||
      typeof parsed.regionId !== 'string' ||
      !Object.hasOwn(regionMetadata, parsed.regionId) ||
      typeof parsed.search !== 'string'
    ) {
      return null;
    }
    return parseChallengeQuery(parsed.regionId as RegionId, parsed.search)
      .config;
  } catch {
    return null;
  }
};
