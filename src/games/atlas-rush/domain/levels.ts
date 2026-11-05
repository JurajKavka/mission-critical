import type { Level, LevelId } from './types';

const levelDefinitions: Readonly<Record<LevelId, Level>> = {
  beginner: { id: 'beginner', label: 'Beginner', secondsPerCountry: 10 },
  middle: { id: 'middle', label: 'Middle', secondsPerCountry: 5 },
  expert: { id: 'expert', label: 'Expert', secondsPerCountry: 3 },
};

export const levels: readonly Level[] = [
  levelDefinitions.beginner,
  levelDefinitions.middle,
  levelDefinitions.expert,
];

export const getRoundSeconds = (targetCount: number, level: LevelId): number =>
  targetCount * levelDefinitions[level].secondsPerCountry;
