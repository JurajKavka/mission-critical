import { COMBO_WINDOW } from './constants';
import type { GameDom, GameState } from './types';

export const updateComboHud = (state: GameState, dom: GameDom): void => {
  dom.combo.textContent =
    state.comboCount > 0
      ? `${String(state.comboCount).padStart(2, '0')} ×${state.comboMultiplier}`
      : '-- ×1';
  dom.comboFill.style.width = `${Math.min(1, Math.max(0, state.comboTimer / COMBO_WINDOW)) * 100}%`;
  dom.combo.style.color = state.comboMultiplier > 1 ? '#ff9be8' : '#f4feff';
};

export const updateHud = (state: GameState, dom: GameDom): void => {
  dom.score.textContent = String(state.score).padStart(6, '0');
  dom.wave.textContent = String(state.wave).padStart(2, '0');
  dom.velocity.textContent = String(
    Math.round(Math.hypot(state.ship.vx, state.ship.vy)),
  ).padStart(3, '0');
  updateComboHud(state, dom);
  dom.ships.replaceChildren();
  for (let index = 0; index < state.lives; index += 1) {
    const life = document.createElement('span');
    life.className = 'ship-life';
    dom.ships.appendChild(life);
  }
};

export const updateBonusHud = (state: GameState, dom: GameDom): void => {
  const active: string[] = [];
  if (state.shieldBonusTimer > 0) {
    active.push(`shield ${state.shieldBonusTimer.toFixed(1)}s`);
  }
  if (state.hasTriShot) {
    active.push('tri-shot armed');
  }
  if (state.hasRapidFire) {
    active.push('rapid fire armed');
  }
  if (state.hasOverdrive) {
    active.push('R3 overdrive armed');
  }
  dom.bonusStatus.textContent =
    state.bonusFlashTimer > 0 ? state.bonusFlashText : active.join(' · ');
  dom.bonusStatus.classList.toggle(
    'active',
    dom.bonusStatus.textContent.length > 0,
  );
};
