export type RegionId = 'africa' | 'south-america' | 'usa' | 'europe' | 'asia';
export type LevelId = 'beginner' | 'middle' | 'expert';
export type GamePhase = 'ready' | 'playing' | 'paused' | 'finished';
export type FinishReason = 'completed' | 'timeout';

export type Target = {
  readonly id: string;
  readonly name: string;
};

export type Level = {
  readonly id: LevelId;
  readonly label: string;
  readonly secondsPerCountry: number;
};

export type AnswerComparison =
  | { readonly mode: 'full' }
  | { readonly mode: 'prefix'; readonly minimumCharacters: number };

export type ChallengeConfig = {
  readonly regionId: RegionId;
  readonly level: LevelId;
  readonly learning: boolean;
  readonly seed: string;
  /** Omitted in legacy challenges, which require a full name. */
  readonly answerComparison?: AnswerComparison;
};

export type GameSession = {
  readonly challengeVersion: 1;
  readonly config: ChallengeConfig;
  readonly phase: GamePhase;
  readonly remainingIds: readonly string[];
  readonly guessedIds: readonly string[];
  readonly durationSeconds: number;
  readonly elapsedSeconds: number;
  readonly finishReason: FinishReason | null;
};

export type GuessOutcome = 'ignored' | 'incorrect' | 'correct' | 'timeout';

export type GuessResult = {
  readonly session: GameSession;
  readonly outcome: GuessOutcome;
  readonly targetId: string | null;
};

export type GameResults = {
  readonly challengeVersion: 1;
  readonly config: ChallengeConfig;
  readonly total: number;
  readonly correct: number;
  readonly notGuessed: number;
  readonly coverage: number;
  readonly elapsedSeconds: number;
  readonly finishReason: FinishReason;
};
