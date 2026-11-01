export type Country = {
  readonly id: string;
  readonly name: string;
  readonly path: string;
};

export type Region = {
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
