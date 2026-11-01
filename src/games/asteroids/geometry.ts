import type { GameState, Position } from './types';

export const wrap = (entity: Position, state: GameState, margin = 0): void => {
  if (entity.x < -margin) {
    entity.x = state.width + margin;
  }
  if (entity.x > state.width + margin) {
    entity.x = -margin;
  }
  if (entity.y < -margin) {
    entity.y = state.height + margin;
  }
  if (entity.y > state.height + margin) {
    entity.y = -margin;
  }
};

const wrappedDelta = (from: number, to: number, size: number): number => {
  let delta = to - from;
  if (delta > size / 2) {
    delta -= size;
  }
  if (delta < -size / 2) {
    delta += size;
  }
  return delta;
};

export const distanceWrapped = (
  first: Position,
  second: Position,
  state: GameState,
): number => {
  return Math.hypot(
    wrappedDelta(first.x, second.x, state.width),
    wrappedDelta(first.y, second.y, state.height),
  );
};
