import type { AnswerComparison } from './types';

export const DEFAULT_PREFIX_LENGTH = 4;
export const FULL_NAME_COMPARISON: AnswerComparison = { mode: 'full' };

export const isValidPrefixLength = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

export const isAnswerComparison = (value: unknown): value is AnswerComparison => {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value) ||
    !('mode' in value)
  ) {
    return false;
  }
  if (value.mode === 'full') {
    return true;
  }
  return (
    value.mode === 'prefix' &&
    'minimumCharacters' in value &&
    isValidPrefixLength(value.minimumCharacters)
  );
};
