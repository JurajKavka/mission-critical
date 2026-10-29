import { TAU, WAVES_PER_MISSION } from './constants';
import { graphicsConfig } from './graphics-config';
import type { Asteroid, GameState, Pickup, PickupType, Ufo } from './types';

interface PickupDetails {
  color: string;
  label: string;
}

export const getPickupDetails = (pickupType: PickupType): PickupDetails => {
  if (pickupType === 'shield') {
    return { color: graphicsConfig.pickups.shieldColor, label: 'S' };
  } else if (pickupType === 'tri-shot') {
    return { color: graphicsConfig.pickups.triShotColor, label: '3' };
  } else if (pickupType === 'rapid-fire') {
    return { color: graphicsConfig.pickups.rapidFireColor, label: 'R' };
  } else if (pickupType === 'overdrive') {
    return { color: graphicsConfig.pickups.overdriveColor, label: 'R3' };
  } else {
    return { color: graphicsConfig.pickups.extraShipColor, label: '+' };
  }
};

export const drawFrame = (state: GameState, time: number): void => {
  const { context } = state;
  drawBackground(state, time);
  const shakeX = (Math.random() - 0.5) * state.shake;
  const shakeY = (Math.random() - 0.5) * state.shake;
  context.save();
  context.translate(shakeX, shakeY);

  for (const asteroid of state.asteroids) {
    drawAsteroid(state, asteroid);
  }
  for (const pickup of state.pickups) {
    drawPickup(state, pickup, time);
  }
  for (const ufo of state.ufos) {
    drawUfo(state, ufo, time);
  }

  context.globalCompositeOperation = 'lighter';
  for (const bullet of state.enemyBullets) {
    const speed = Math.hypot(bullet.vx, bullet.vy) || 1;
    const directionX = bullet.vx / speed;
    const directionY = bullet.vy / speed;
    context.strokeStyle = graphicsConfig.projectiles.hostileTrailColor;
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(bullet.x - directionX * 13, bullet.y - directionY * 13);
    context.lineTo(bullet.x, bullet.y);
    context.stroke();
    context.fillStyle = graphicsConfig.projectiles.hostileTipColor;
    context.beginPath();
    context.arc(bullet.x, bullet.y, 2.5, 0, TAU);
    context.fill();
  }

  for (const bullet of state.bullets) {
    if (bullet.rapid) {
      const speed = Math.hypot(bullet.vx, bullet.vy) || 1;
      const directionX = bullet.vx / speed;
      const directionY = bullet.vy / speed;
      const trail = 20 + Math.sin(time * 0.035 + bullet.phase) * 4;
      const tailX = bullet.x - directionX * trail;
      const tailY = bullet.y - directionY * trail;

      context.strokeStyle = graphicsConfig.projectiles.rapidTrailColor;
      context.lineWidth = 7;
      context.beginPath();
      context.moveTo(tailX, tailY);
      context.lineTo(bullet.x, bullet.y);
      context.stroke();

      context.strokeStyle = graphicsConfig.projectiles.rapidCoreColor;
      context.lineWidth = 2.5;
      context.beginPath();
      context.moveTo(tailX, tailY);
      context.lineTo(bullet.x, bullet.y);
      context.stroke();

      context.fillStyle = graphicsConfig.projectiles.rapidTipColor;
      context.beginPath();
      context.arc(bullet.x, bullet.y, 3.4, 0, TAU);
      context.fill();
    } else {
      context.fillStyle = graphicsConfig.projectiles.playerColor;
      context.beginPath();
      context.arc(bullet.x, bullet.y, 2.5, 0, TAU);
      context.fill();
    }
  }

  for (const particle of state.particles) {
    const alpha = Math.max(0, particle.life / particle.maxLife);
    context.globalAlpha = alpha;
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.size * alpha, 0, TAU);
    context.fill();
  }
  context.globalAlpha = 1;
  context.globalCompositeOperation = 'source-over';
  drawShip(state);
  context.restore();

  if (state.nextWaveTimer > 0 && state.running) {
    context.fillStyle = `rgba(202, 250, 255, ${Math.min(1, state.nextWaveTimer) * 0.7})`;
    context.font = '700 12px ui-monospace, monospace';
    context.textAlign = 'center';
    const transitionText =
      state.wave % WAVES_PER_MISSION === 0
        ? `MISSION ${String(state.wave / WAVES_PER_MISSION).padStart(2, '0')} COMPLETE`
        : `WAVE ${String(state.wave + 1).padStart(2, '0')} INBOUND`;
    context.fillText(transitionText, state.width / 2, state.height * 0.42);
  }

  if (state.hyperspaceCooldown > 0 && state.running) {
    context.fillStyle = 'rgba(167, 139, 205, .62)';
    context.font = '10px ui-monospace, monospace';
    context.textAlign = 'right';
    context.fillText(
      `HYPERSPACE ${state.hyperspaceCooldown.toFixed(1)}s`,
      state.width - 22,
      state.height - 42,
    );
  }
};

const drawBackground = (state: GameState, time: number): void => {
  const { context } = state;
  const gradient = context.createRadialGradient(
    state.width * 0.48,
    state.height * 0.44,
    0,
    state.width * 0.5,
    state.height * 0.5,
    Math.max(state.width, state.height) * 0.76,
  );
  gradient.addColorStop(0, graphicsConfig.background.centerColor);
  gradient.addColorStop(0.52, graphicsConfig.background.middleColor);
  gradient.addColorStop(1, graphicsConfig.background.edgeColor);
  context.fillStyle = gradient;
  context.fillRect(0, 0, state.width, state.height);

  context.drawImage(state.galaxyCanvas, 0, 0, state.width, state.height);

  for (const star of state.stars) {
    const x =
      (star.x - state.ship.x * 0.012 * star.layer + state.width) % state.width;
    const y =
      (star.y - state.ship.y * 0.012 * star.layer + state.height) %
      state.height;
    const alpha = 0.2 + Math.sin(time * 0.0016 + star.phase) * 0.13;
    context.fillStyle = `rgba(170, 231, 255, ${alpha})`;
    context.fillRect(x, y, star.size, star.size);
  }

  context.strokeStyle = graphicsConfig.background.gridColor;
  context.lineWidth = 1;
  const grid = 72;
  context.beginPath();
  for (let x = 0; x < state.width; x += grid) {
    context.moveTo(x, 0);
    context.lineTo(x, state.height);
  }
  for (let y = 0; y < state.height; y += grid) {
    context.moveTo(0, y);
    context.lineTo(state.width, y);
  }
  context.stroke();
};

const getAsteroidGraphics = (asteroidSize: Asteroid['size']) => {
  if (asteroidSize === 1) {
    return graphicsConfig.asteroids.small;
  } else if (asteroidSize === 2) {
    return graphicsConfig.asteroids.medium;
  } else {
    return graphicsConfig.asteroids.large;
  }
};

const drawAsteroid = (state: GameState, asteroid: Asteroid): void => {
  const { context } = state;
  const asteroidGraphics = getAsteroidGraphics(asteroid.size);
  context.strokeStyle = asteroidGraphics.color;
  context.fillStyle = asteroidGraphics.color;
  context.lineWidth = asteroidGraphics.lineWidth;
  context.beginPath();
  for (let index = 0; index < asteroid.shape.length; index += 1) {
    const angle = asteroid.angle + (index / asteroid.shape.length) * TAU;
    const radius = asteroid.radius * asteroid.shape[index];
    const x = asteroid.x + Math.cos(angle) * radius;
    const y = asteroid.y + Math.sin(angle) * radius;
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }
  context.closePath();
  context.globalAlpha = asteroidGraphics.fillOpacity;
  context.fill();
  context.globalAlpha = 1;
  context.stroke();

  context.strokeStyle = graphicsConfig.asteroids.detailColor;
  context.beginPath();
  context.arc(
    asteroid.x - asteroid.radius * 0.14,
    asteroid.y - asteroid.radius * 0.08,
    asteroid.radius * 0.24,
    0,
    TAU,
  );
  context.stroke();
};

const drawShip = (state: GameState): void => {
  const { context } = state;
  const { ship } = state;
  if (!ship.visible) {
    return;
  }

  context.save();
  context.translate(ship.x, ship.y);
  context.rotate(ship.angle);
  const shipAlpha =
    ship.shield > 0 && Math.floor(ship.shield * 12) % 2 === 0 ? 0.46 : 1;
  context.globalAlpha = shipAlpha;
  context.strokeStyle = graphicsConfig.ship.color;
  context.fillStyle = graphicsConfig.ship.backgroundColor;
  context.lineWidth = graphicsConfig.ship.lineWidth;
  context.beginPath();
  context.moveTo(20, 0);
  context.lineTo(-14, -12);
  context.lineTo(-8, 0);
  context.lineTo(-14, 12);
  context.closePath();
  context.fill();
  context.stroke();

  if (state.keys.has('KeyW') || state.keys.has('ArrowUp')) {
    context.strokeStyle = Math.random() > 0.45 ? '#aa70ff' : '#5dfaff';
    context.beginPath();
    context.moveTo(-10, -6);
    context.lineTo(-22 - Math.random() * 10, 0);
    context.lineTo(-10, 6);
    context.stroke();
  }
  context.restore();

  if (ship.shield > 0) {
    context.strokeStyle = `rgba(${graphicsConfig.ship.shieldRgb}, ${0.18 + ship.shield * 0.08})`;
    context.lineWidth = 1;
    context.beginPath();
    context.arc(
      ship.x,
      ship.y,
      24 + Math.sin(performance.now() * 0.008) * 2,
      0,
      TAU,
    );
    context.stroke();
  }
};

const drawPickup = (state: GameState, pickup: Pickup, time: number): void => {
  const { context } = state;
  const details = getPickupDetails(pickup.type);
  const pulse = 1 + Math.sin(time * 0.007 + pickup.angle) * 0.12;
  const alpha =
    pickup.life < 3 && Math.floor(pickup.life * 8) % 2 === 0 ? 0.3 : 1;
  context.save();
  context.globalAlpha = alpha;
  context.translate(pickup.x, pickup.y);
  context.rotate(pickup.angle);
  context.strokeStyle = details.color;
  context.fillStyle = details.color;
  context.lineWidth = graphicsConfig.pickups.lineWidth;
  context.beginPath();
  for (let index = 0; index < 6; index += 1) {
    const angle = (index / 6) * TAU;
    const x = Math.cos(angle) * pickup.radius * pulse;
    const y = Math.sin(angle) * pickup.radius * pulse;
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }
  context.closePath();
  context.globalAlpha = alpha * graphicsConfig.pickups.fillOpacity;
  context.fill();
  context.globalAlpha = alpha;
  context.stroke();
  context.restore();

  context.save();
  context.globalAlpha = alpha;
  context.fillStyle = details.color;
  context.font = '800 11px ui-monospace, monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(details.label, pickup.x, pickup.y + 0.5);
  context.restore();
};

const drawUfo = (state: GameState, ufo: Ufo, time: number): void => {
  const { context } = state;
  const pulse = 0.65 + Math.sin(time * 0.012 + ufo.phase) * 0.2;
  context.save();
  context.translate(ufo.x, ufo.y);
  context.fillStyle = graphicsConfig.ufo.bodyFillColor;
  context.strokeStyle = graphicsConfig.ufo.bodyStrokeColor;
  context.lineWidth = 2;
  context.beginPath();
  context.ellipse(0, 4, 27, 9, 0, 0, TAU);
  context.fill();
  context.stroke();
  context.fillStyle = graphicsConfig.ufo.canopyFillColor;
  context.strokeStyle = graphicsConfig.ufo.canopyStrokeColor;
  context.beginPath();
  context.arc(0, 2, 11, Math.PI, 0);
  context.lineTo(11, 4);
  context.lineTo(-11, 4);
  context.closePath();
  context.fill();
  context.stroke();
  context.fillStyle = `rgba(${graphicsConfig.ufo.lightColor}, ${pulse})`;
  for (let index = -2; index <= 2; index += 1) {
    context.beginPath();
    context.arc(index * 9, 6, 2, 0, TAU);
    context.fill();
  }
  context.restore();

  const healthWidth = 42;
  context.fillStyle = graphicsConfig.ufo.healthTrackColor;
  context.fillRect(ufo.x - healthWidth / 2, ufo.y - 22, healthWidth, 3);
  context.fillStyle = graphicsConfig.ufo.healthColor;
  context.fillRect(
    ufo.x - healthWidth / 2,
    ufo.y - 22,
    healthWidth * (ufo.health / ufo.maxHealth),
    3,
  );
};
