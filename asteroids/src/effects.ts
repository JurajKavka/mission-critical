import { TAU } from './constants';
import type { GameState } from './types';

export const burst = (
  state: GameState,
  x: number,
  y: number,
  color: string,
  amount: number,
  speed = 180,
): void => {
  for (let index = 0; index < amount; index += 1) {
    const angle = Math.random() * TAU;
    const velocity = speed * (0.25 + Math.random() * 0.9);
    const life = 0.35 + Math.random() * 0.7;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life,
      maxLife: life,
      size: 1.2 + Math.random() * 3.4,
      color,
    });
  }
};
