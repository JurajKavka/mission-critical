import { FULL_NAME_COMPARISON, isValidPrefixLength } from './answer-comparison';
import type { AnswerComparison, Target } from './types';

const ALIASES: Readonly<Record<string, readonly string[]>> = {
  USA: ['United States of America', 'US', 'USA', 'America'],
  BHS: ['The Bahamas'],
  KNA: ['St Kitts and Nevis'],
  LCA: ['St Lucia'],
  VCT: ['St Vincent and the Grenadines'],
  COG: ['Congo', 'Congo Brazzaville', 'Republic of Congo'],
  COD: ['DR Congo', 'DRC', 'Congo Kinshasa', 'Democratic Republic of Congo'],
  CIV: ['Côte d’Ivoire', 'Cote dIvoire', 'Ivory Coast'],
  SWZ: ['Eswatini', 'Swaziland'],
  TZA: ['Tanzania'],
  CPV: ['Cape Verde'],
  STP: ['Sao Tome', 'Sao Tome and Principe'],
  GMB: ['The Gambia'],
  GNB: ['Guinea-Bissau'],
  CZE: ['Czech Republic'],
  GBR: ['UK', 'Great Britain', 'Britain'],
  MKD: ['Macedonia'],
  TUR: ['Türkiye'],
  VAT: ['Vatican', 'Holy See'],
  TLS: ['East Timor'],
  PSE: ['State of Palestine'],
  KOR: ['Republic of Korea'],
  PRK: ['DPRK', 'Democratic People’s Republic of Korea'],
  ARE: ['UAE'],
  FSM: ['Federated States of Micronesia'],
};

export const normalizeAnswer = (answer: string): string =>
  answer
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const matchesName = (
  name: string,
  normalizedAnswer: string,
  comparison: AnswerComparison,
): boolean => {
  const normalizedName = normalizeAnswer(name);
  if (normalizedAnswer === normalizedName) {
    return true;
  }
  return (
    comparison.mode === 'prefix' &&
    isValidPrefixLength(comparison.minimumCharacters) &&
    normalizedAnswer.length >= comparison.minimumCharacters &&
    normalizedName.startsWith(normalizedAnswer)
  );
};

export const getMatchedTargetName = (
  target: Target,
  answer: string,
  comparison: AnswerComparison = FULL_NAME_COMPARISON,
): string | null => {
  const normalizedAnswer = normalizeAnswer(answer);
  if (normalizedAnswer.length === 0) {
    return null;
  }
  const names = [target.name, ...(ALIASES[target.id] ?? [])];
  return (
    names.find((name) => normalizeAnswer(name) === normalizedAnswer) ??
    names.find((name) => matchesName(name, normalizedAnswer, comparison)) ??
    null
  );
};

export const matchesTarget = (
  target: Target,
  answer: string,
  comparison: AnswerComparison = FULL_NAME_COMPARISON,
): boolean => getMatchedTargetName(target, answer, comparison) !== null;
