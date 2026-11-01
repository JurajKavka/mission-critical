export type Country = {
  readonly id: string;
  readonly name: string;
  readonly path: string;
};

export type RegionId = 'africa' | 'south-america';

export type Region = {
  readonly id: RegionId;
  readonly code: string;
  readonly hasIslandMarkers: boolean;
  readonly name: string;
  readonly viewBox: string;
  readonly countries: readonly Country[];
};

export type Results = {
  readonly total: number;
  readonly guessed: number;
  readonly elapsedSeconds: number;
  readonly completed: boolean;
};
