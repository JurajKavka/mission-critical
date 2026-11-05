import type { Target } from './types';

const aliases: Readonly<Record<string, readonly string[]>> = {
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
};

export const normalizeAnswer = (answer: string): string =>
  answer
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

export const matchesTarget = (target: Target, answer: string): boolean => {
  const normalizedAnswer = normalizeAnswer(answer);
  return [target.name, ...(aliases[target.id] ?? [])].some(
    (name) => normalizeAnswer(name) === normalizedAnswer,
  );
};
