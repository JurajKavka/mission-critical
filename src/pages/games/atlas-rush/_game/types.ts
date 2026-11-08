import type { RegionMetadata } from '../../../../games/atlas-rush/data/regions';
import type { Target } from '../../../../games/atlas-rush/domain/types';

export type {
  Level,
  RegionId,
} from '../../../../games/atlas-rush/domain/types';

export type Country = Target & {
  readonly path: string;
};

export type Region = RegionMetadata & {
  readonly viewBox: string;
  readonly countries: readonly Country[];
};

export type Results = {
  readonly total: number;
  readonly guessed: number;
  readonly elapsedSeconds: number;
  readonly completed: boolean;
};
