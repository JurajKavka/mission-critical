import { COMBO_WINDOW } from './constants';
import type { GameState } from './types';

export type HudSnapshot = {
  score: number;
  wave: number;
  lives: number;
  velocity: number;
  comboCount: number;
  comboMultiplier: number;
  comboProgress: number;
  bonus: string;
};

export const getHudSnapshot = (state: GameState): HudSnapshot => {
  const active: string[] = [];
  if (state.shieldBonusTimer > 0) {
    active.push(`shield ${state.shieldBonusTimer.toFixed(1)}s`);
  }
  if (state.hasTriShot) {
    active.push(`tri-shot ${Math.ceil(state.weaponBonusTimer)}s`);
  }
  if (state.hasRapidFire) {
    active.push(`rapid fire ${Math.ceil(state.weaponBonusTimer)}s`);
  }
  if (state.hasOverdrive) {
    active.push(`R3 overdrive ${Math.ceil(state.weaponBonusTimer)}s`);
  }
  return {
    score: state.score,
    wave: state.wave,
    lives: state.lives,
    velocity: Math.round(Math.hypot(state.ship.vx, state.ship.vy)),
    comboCount: state.comboCount,
    comboMultiplier: state.comboMultiplier,
    comboProgress: Math.min(1, Math.max(0, state.comboTimer / COMBO_WINDOW)),
    bonus:
      state.bonusFlashTimer > 0 ? state.bonusFlashText : active.join(' · '),
  };
};
