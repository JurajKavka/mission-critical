export type Country = {
  readonly id: string;
  readonly name: string;
  readonly path: string;
};

export type RegionId = 'africa' | 'south-america' | 'usa' | 'europe';

export type Region = {
  readonly id: RegionId;
  readonly code: string;
  readonly hasIslandMarkers: boolean;
  readonly markerNote?: string;
  readonly name: string;
  readonly targetName: 'country' | 'state';
  readonly viewBox: string;
  readonly countries: readonly Country[];
};

export type Level = {
  readonly id: string;
  readonly label: string;
  readonly secondsPerCountry: number;
};

export type Results = {
  readonly total: number;
  readonly guessed: number;
  readonly elapsedSeconds: number;
  readonly completed: boolean;
};
