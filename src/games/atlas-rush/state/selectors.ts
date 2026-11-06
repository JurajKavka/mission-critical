import { getCurrentTargetId } from '../domain/session';
import type { AtlasRushState } from './createAtlasRushStore';

export const selectPhase = (state: AtlasRushState) => state.session.phase;
export const selectConfig = (state: AtlasRushState) => state.session.config;
export const selectRegionId = (state: AtlasRushState) =>
  state.session.config.regionId;
export const selectLearning = (state: AtlasRushState) =>
  state.session.config.learning;
export const selectCurrentTargetId = (state: AtlasRushState) =>
  getCurrentTargetId(state.session);
export const selectGuessedIds = (state: AtlasRushState) =>
  state.session.guessedIds;
export const selectRemainingIds = (state: AtlasRushState) =>
  state.session.remainingIds;
export const selectElapsedCheckpoint = (state: AtlasRushState) =>
  state.session.elapsedSeconds;
