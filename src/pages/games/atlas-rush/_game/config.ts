import type { Level, Region } from './types';

export const levels: readonly Level[] = [
  { id: 'beginner', label: 'Beginner', secondsPerCountry: 10 },
  { id: 'middle', label: 'Middle', secondsPerCountry: 5 },
  { id: 'expert', label: 'Expert', secondsPerCountry: 3 },
];

export const getRoundSeconds = (region: Region, level: Level): number =>
  region.countries.length * level.secondsPerCountry;
