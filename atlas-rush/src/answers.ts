import type { Country } from './types';

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
};

export const normalizeAnswer = (answer: string): string =>
  answer
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

export const matchesCountry = (country: Country, answer: string): boolean => {
  const normalizedAnswer = normalizeAnswer(answer);
  return [country.name, ...(aliases[country.id] ?? [])].some(
    (name) => normalizeAnswer(name) === normalizedAnswer,
  );
};
