import { regionMetadata } from '../data/regions';
import { isAnswerComparison } from '../domain/answer-comparison';
import { getCoverage } from '../domain/results';
import type { GameResults, LevelId, RegionId } from '../domain/types';
import { isValidSeed } from './challenge-url';

type SharedResult = {
  readonly result: GameResults;
  readonly displayName?: string;
};

export const encodeSharedResult = (
  result: GameResults,
  displayName?: string,
): string => {
  const data = {
    version: result.challengeVersion,
    config: {
      regionId: result.config.regionId,
      level: result.config.level,
      learning: result.config.learning,
      seed: result.config.seed,
      ...(result.config.answerComparison?.mode === 'prefix'
        ? {
            answerComparison: {
              mode: 'prefix',
              minimumCharacters:
                result.config.answerComparison.minimumCharacters,
            },
          }
        : { answerComparison: { mode: 'full' } }),
    },
    total: result.total,
    correct: result.correct,
    elapsedSeconds: result.elapsedSeconds,
    finishReason: result.finishReason,
    ...(displayName ? { displayName } : {}),
  };
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
    '',
  );
  return `v1.${btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
};

export const decodeSharedResult = (token: string): SharedResult | null => {
  if (token.length > 1024 || !/^v1\.[A-Za-z0-9_-]+$/.test(token)) {
    return null;
  }
  try {
    const binary = atob(token.slice(3).replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0),
    );
    const data: unknown = JSON.parse(
      new TextDecoder('utf-8', { fatal: true }).decode(bytes),
    );
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return null;
    }
    const value = data as Record<string, unknown>;
    const allowed = [
      'version',
      'config',
      'total',
      'correct',
      'elapsedSeconds',
      'finishReason',
      'displayName',
    ];
    if (Object.keys(value).some((field) => !allowed.includes(field))) {
      return null;
    }
    const config = value.config;
    if (
      typeof config !== 'object' ||
      config === null ||
      Array.isArray(config)
    ) {
      return null;
    }
    const fields = config as Record<string, unknown>;
    const configFields = [
      'regionId',
      'level',
      'learning',
      'seed',
      'answerComparison',
    ];
    if (Object.keys(fields).some((field) => !configFields.includes(field))) {
      return null;
    }
    if (
      value.version !== 1 ||
      typeof fields.regionId !== 'string' ||
      !Object.hasOwn(regionMetadata, fields.regionId) ||
      !['beginner', 'middle', 'expert'].includes(String(fields.level)) ||
      typeof fields.learning !== 'boolean' ||
      typeof fields.seed !== 'string' ||
      !isValidSeed(fields.seed) ||
      (fields.answerComparison !== undefined &&
        !isAnswerComparison(fields.answerComparison)) ||
      typeof value.total !== 'number' ||
      !Number.isSafeInteger(value.total) ||
      value.total <= 0 ||
      typeof value.correct !== 'number' ||
      !Number.isSafeInteger(value.correct) ||
      value.correct < 0 ||
      value.correct > value.total ||
      typeof value.elapsedSeconds !== 'number' ||
      !Number.isFinite(value.elapsedSeconds) ||
      value.elapsedSeconds < 0 ||
      (value.finishReason !== 'completed' &&
        value.finishReason !== 'timeout') ||
      (value.finishReason === 'completed' && value.correct !== value.total) ||
      (value.finishReason === 'timeout' && value.correct === value.total) ||
      (value.displayName !== undefined &&
        (typeof value.displayName !== 'string' ||
          Array.from(value.displayName).length > 32))
    ) {
      return null;
    }
    return {
      result: {
        challengeVersion: 1,
        config: {
          regionId: fields.regionId as RegionId,
          level: fields.level as LevelId,
          learning: fields.learning,
          seed: fields.seed,
          ...(isAnswerComparison(fields.answerComparison)
            ? { answerComparison: fields.answerComparison }
            : {}),
        },
        total: value.total,
        correct: value.correct,
        notGuessed: value.total - value.correct,
        coverage: getCoverage(value.correct, value.total),
        elapsedSeconds: value.elapsedSeconds,
        finishReason: value.finishReason,
      },
      ...(typeof value.displayName === 'string'
        ? { displayName: value.displayName }
        : {}),
    };
  } catch {
    return null;
  }
};
