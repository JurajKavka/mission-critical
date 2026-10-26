import { TAU } from './constants';
import { burst } from './effects';
import type { Sound } from './sound';
import type {
  Asteroid,
  AsteroidSize,
  GameState,
  MovingEntity,
  PickupType,
  Ufo,
} from './types';

export const getAsteroidRadius = (size: AsteroidSize): number => {
  if (size === 3) {
    return 48 + Math.random() * 14;
  } else if (size === 2) {
    return 27 + Math.random() * 7;
  } else {
    return 14 + Math.random() * 4;
  }
};

export const createAsteroid = (
  state: GameState,
  x: number,
  y: number,
  size: AsteroidSize = 3,
  inheritedVelocity: MovingEntity | null = null,
): void => {
  const radius = getAsteroidRadius(size);
  const pointCount = 8 + Math.floor(Math.random() * 5);
  const shape = Array.from(
    { length: pointCount },
    () => 0.72 + Math.random() * 0.38,
  );
  const direction = Math.random() * TAU;
  const baseSpeed = (4 - size) * 24 + 28 + state.wave * 3;
  state.asteroids.push({
    x,
    y,
    vx: inheritedVelocity
      ? inheritedVelocity.vx + Math.cos(direction) * baseSpeed
      : Math.cos(direction) * baseSpeed,
    vy: inheritedVelocity
      ? inheritedVelocity.vy + Math.sin(direction) * baseSpeed
      : Math.sin(direction) * baseSpeed,
    angle: Math.random() * TAU,
    spin: (Math.random() - 0.5) * (1.6 / size),
    radius,
    size,
    shape,
  });
};

export const safeSpawnAsteroid = (state: GameState): void => {
  let x: number;
  let y: number;
  do {
    x = Math.random() * state.width;
    y = Math.random() * state.height;
  } while (
    Math.hypot(x - state.ship.x, y - state.ship.y) <
    Math.min(state.width, state.height) * 0.3
  );
  createAsteroid(state, x, y);
};

export const spawnUfo = (state: GameState, sound: Sound): void => {
  const entersFromLeft = Math.random() < 0.5;
  const health = 2 + Math.floor(state.wave / 3);
  const y = 90 + Math.random() * Math.max(80, state.height - 180);
  state.ufos.push({
    x: entersFromLeft ? -48 : state.width + 48,
    y,
    baseY: y,
    vx: (entersFromLeft ? 1 : -1) * (82 + state.wave * 4),
    phase: Math.random() * TAU,
    shootTimer: 0.8 + Math.random() * 0.7,
    health,
    maxHealth: health,
    radius: 24,
  });
  state.bonusFlashText = 'HOSTILE UFO DETECTED';
  state.bonusFlashTimer = 1.8;
  sound.tone(175, 0.35, 0.04, 'sawtooth', 82);
};

export const fireEnemyBullet = (
  state: GameState,
  sound: Sound,
  ufo: Ufo,
): void => {
  if (!state.ship.visible) {
    return;
  }

  const angle = Math.atan2(state.ship.y - ufo.y, state.ship.x - ufo.x);
  const speed = 225 + state.wave * 8;
  state.enemyBullets.push({
    x: ufo.x,
    y: ufo.y + 8,
    vx: Math.cos(angle) * speed + ufo.vx * 0.12,
    vy: Math.sin(angle) * speed,
    life: 4,
    radius: 4,
  });
  sound.tone(260, 0.09, 0.018, 'square', 120);
};

export const createPickup = (
  state: GameState,
  x: number,
  y: number,
  vx: number,
  vy: number,
  type: PickupType,
): void => {
  state.pickups.push({
    x,
    y,
    vx,
    vy,
    angle: Math.random() * TAU,
    spin: (Math.random() - 0.5) * 1.8,
    radius: 13,
    life: 12,
    type,
  });
};

export const getPickupType = (roll: number): PickupType => {
  if (roll < 0.22) {
    return 'shield';
  } else if (roll < 0.49) {
    return 'tri-shot';
  } else if (roll < 0.76) {
    return 'rapid-fire';
  } else if (roll < 0.94) {
    return 'overdrive';
  } else {
    return 'extra-ship';
  }
};

export const maybeDropBonus = (state: GameState, asteroid: Asteroid): void => {
  const chance = Math.min(0.16 + state.wave * 0.007, 0.28);
  if (asteroid.size !== 1 || Math.random() > chance) {
    return;
  }

  const pickupType = getPickupType(Math.random());
  createPickup(
    state,
    asteroid.x,
    asteroid.y,
    asteroid.vx * 0.38 + (Math.random() - 0.5) * 24,
    asteroid.vy * 0.38 + (Math.random() - 0.5) * 24,
    pickupType,
  );
};

export const splitAsteroid = (state: GameState, asteroid: Asteroid): void => {
  if (asteroid.size <= 1) {
    return;
  }
  for (let child = 0; child < 2; child += 1) {
    createAsteroid(
      state,
      asteroid.x,
      asteroid.y,
      (asteroid.size - 1) as AsteroidSize,
      asteroid,
    );
  }
};

export const pickupColor = (type: PickupType): string => {
  if (type === 'shield') {
    return '#67faff';
  }
  if (type === 'tri-shot') {
    return '#ff72db';
  }
  if (type === 'rapid-fire') {
    return '#ffb35f';
  }
  if (type === 'overdrive') {
    return '#ffe65f';
  }
  return '#8eff94';
};

export const explodeUfo = (state: GameState, sound: Sound, ufo: Ufo): void => {
  burst(state, ufo.x, ufo.y, '#ffb12f', 42, 270);
  burst(state, ufo.x, ufo.y, '#ff3d6e', 24, 190);
  sound.tone(130, 0.42, 0.055, 'sawtooth', 45);
};
