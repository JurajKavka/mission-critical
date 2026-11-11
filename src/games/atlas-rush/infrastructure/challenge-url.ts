import { defaultSeed } from '../domain/shuffle';
import { isValidPrefixLength } from '../domain/answer-comparison';
import type {
  AnswerComparison,
  ChallengeConfig,
  LevelId,
  RegionId,
} from '../domain/types';

export const defaultLevel: LevelId = 'beginner';
export const isValidSeed = (seed: string): boolean =>
  /^[A-Za-z0-9_-]{1,64}$/.test(seed);

const decodePart = (part: string): string | null => {
  try {
    return decodeURIComponent(part.replace(/\+/g, ' '));
  } catch {
    return null;
  }
};

const getValues = (search: string): Map<string, (string | null)[]> => {
  const query = search.startsWith('?') ? search.slice(1) : search;
  return query.split('&').reduce((values, pair) => {
    if (pair === '') {
      return values;
    }
    const separator = pair.indexOf('=');
    const key = decodePart(separator < 0 ? pair : pair.slice(0, separator));
    const value = decodePart(separator < 0 ? '' : pair.slice(separator + 1));
    if (key !== null) {
      values.set(key, [...(values.get(key) ?? []), value]);
    }
    return values;
  }, new Map<string, (string | null)[]>());
};

const singleValue = (
  values: Map<string, (string | null)[]>,
  key: string,
): string | null => {
  const entries = values.get(key);
  if (!entries || entries.length !== 1) {
    return null;
  }
  return entries[0];
};

const parseLevel = (value: string | null): LevelId => {
  if (value === 'middle' || value === 'expert') {
    return value;
  }
  return defaultLevel;
};

const parseAnswerComparison = (
  value: string | null,
): AnswerComparison | undefined => {
  if (value === null || !/^[1-9][0-9]*$/.test(value)) {
    return undefined;
  }
  const minimumCharacters = Number(value);
  if (!isValidPrefixLength(minimumCharacters)) {
    return undefined;
  }
  return { mode: 'prefix', minimumCharacters };
};

export const serializeChallengeQuery = (config: ChallengeConfig): string => {
  const params = new URLSearchParams();
  if (config.level !== defaultLevel) {
    params.set('level', config.level);
  }
  if (config.learning) {
    params.set('learning', '1');
  }
  if (
    config.answerComparison?.mode === 'prefix' &&
    isValidPrefixLength(config.answerComparison.minimumCharacters)
  ) {
    params.set('speed', String(config.answerComparison.minimumCharacters));
  }
  if (config.seed !== defaultSeed && isValidSeed(config.seed)) {
    params.set('seed', config.seed);
  }
  const query = params.toString();
  return query === '' ? '' : `?${query}`;
};

export type ParsedChallenge = {
  readonly config: ChallengeConfig;
  readonly canonicalSearch: string;
  readonly corrected: boolean;
};

export const parseChallengeQuery = (
  regionId: RegionId,
  search: string,
): ParsedChallenge => {
  const values = getValues(search);
  const seed = singleValue(values, 'seed');
  const answerComparison = parseAnswerComparison(singleValue(values, 'speed'));
  const config: ChallengeConfig = {
    regionId,
    level: parseLevel(singleValue(values, 'level')),
    learning: singleValue(values, 'learning') === '1',
    seed: seed !== null && isValidSeed(seed) ? seed : defaultSeed,
    ...(answerComparison ? { answerComparison } : {}),
  };
  const canonicalSearch = serializeChallengeQuery(config);
  let originalSearch = search;
  if (search === '?') {
    originalSearch = '';
  } else if (search !== '' && !search.startsWith('?')) {
    originalSearch = `?${search}`;
  }
  return {
    config,
    canonicalSearch,
    corrected: originalSearch !== canonicalSearch,
  };
};

export const getChallengePath = (config: ChallengeConfig): string =>
  `/games/atlas-rush/${config.regionId}/${serializeChallengeQuery(config)}`;
