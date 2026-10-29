import { COMBO_WINDOW, TAU, WAVES_PER_MISSION } from './constants';
import { burst } from './effects';
import {
  createPickup,
  explodeUfo,
  fireEnemyBullet,
  maybeDropBonus,
  pickupColor,
  safeSpawnAsteroid,
  spawnUfo,
  splitAsteroid,
} from './entities';
import { showMissionEndedMessage } from './dom';
import { distanceWrapped, wrap } from './geometry';
import { updateBonusHud, updateComboHud, updateHud } from './hud';
import { drawFrame } from './renderer';
import { createSound } from './sound';
import { createBackgroundStars, renderGalaxyTexture } from './starfield';
import { createGameState } from './state';
import type { GameDom, GameState, PickupType, UpgradeType } from './types';

export interface GameController {
  mount: () => void;
}

export const createGame = (dom: GameDom): GameController => {
  const state: GameState = createGameState(dom);
  const sound = createSound();

  const mount = (): void => {
    window.addEventListener('resize', () => resize());
    window.addEventListener('keydown', (event) => onKeyDown(event));
    window.addEventListener('keyup', (event) => state.keys.delete(event.code));
    window.addEventListener('blur', () => {
      state.keys.clear();
      state.pointer.firing = false;
    });
    window.addEventListener('pointerup', () => (state.pointer.firing = false));

    state.canvas.addEventListener('pointermove', (event) =>
      updatePointer(event),
    );
    state.canvas.addEventListener('pointerdown', (event) =>
      onPointerDown(event),
    );
    state.canvas.addEventListener('contextmenu', (event) =>
      event.preventDefault(),
    );
    dom.startButton.addEventListener('click', () => startGame());
    for (const button of dom.upgradeButtons) {
      button.addEventListener('click', () => {
        const upgrade = button.dataset.upgrade;
        if (
          upgrade === 'engine' ||
          upgrade === 'weapon' ||
          upgrade === 'hull'
        ) {
          applyUpgrade(upgrade);
        }
      });
    }

    resize();
    resetShip();
    updateHud(state, dom);
    requestAnimationFrame(frame);
  };

  const frame = (time: number): void => {
    const delta = Math.min((time - state.lastTime) / 1000, 0.04);
    state.lastTime = time;
    update(delta);
    drawFrame(state, time);
    requestAnimationFrame(frame);
  };

  const resize = (): void => {
    state.width = innerWidth;
    state.height = innerHeight;
    const pixelRatio = Math.min(devicePixelRatio || 1, 2);
    state.canvas.width = Math.floor(state.width * pixelRatio);
    state.canvas.height = Math.floor(state.height * pixelRatio);
    state.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    state.stars.splice(
      0,
      state.stars.length,
      ...createBackgroundStars(state.width, state.height),
    );
    renderGalaxyTexture(state.galaxyCanvas, state.width, state.height);
  };

  const startGame = (): void => {
    sound.start();
    dom.overlay.classList.add('hidden');
    resetGame();
  };

  const resetGame = (): void => {
    state.asteroids.length = 0;
    state.bullets.length = 0;
    state.ufos.length = 0;
    state.enemyBullets.length = 0;
    state.pickups.length = 0;
    state.particles.length = 0;
    Object.assign(state, {
      score: 0,
      wave: 1,
      lives: 3,
      comboCount: 0,
      comboMultiplier: 1,
      comboTimer: 0,
      fireCooldown: 0,
      hyperspaceCooldown: 0,
      shieldBonusTimer: 0,
      bonusFlashTimer: 0,
      bonusFlashText: '',
      ufoSpawnTimer: Infinity,
      ufoSpawnedThisWave: false,
      choosingUpgrade: false,
      thrustMultiplier: 1,
      brakeMultiplier: 1,
      permanentFireRateMultiplier: 1,
      shake: 0,
      running: true,
    });
    resetGunBonuses();
    dom.upgradeOverlay.classList.add('hidden');
    resetShip();
    beginWave();
  };

  const resetShip = (): void => {
    Object.assign(state.ship, {
      x: state.width / 2,
      y: state.height / 2,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      shield: 2.6,
      visible: true,
    });
    state.shieldBonusTimer = 0;
  };

  const beginWave = (): void => {
    state.nextWaveTimer = 0;
    state.ufoSpawnedThisWave = false;
    state.ufoSpawnTimer = state.wave >= 2 ? 5 + Math.random() * 6 : Infinity;
    const count = Math.min(3 + state.wave, 10);
    for (let index = 0; index < count; index += 1) {
      safeSpawnAsteroid(state);
    }
    sound.tone(
      250 + state.wave * 18,
      0.2,
      0.028,
      'triangle',
      420 + state.wave * 24,
    );
    updateHud(state, dom);
  };

  const endGame = (): void => {
    state.running = false;
    state.choosingUpgrade = false;
    dom.upgradeOverlay.classList.add('hidden');
    showMissionEndedMessage(dom, state.score);
    sound.tone(120, 0.7, 0.06, 'sawtooth', 38);
  };

  const showUpgradeChoices = (): void => {
    state.choosingUpgrade = true;
    state.keys.clear();
    state.pointer.firing = false;
    state.enemyBullets.length = 0;
    dom.upgradeOverlay.classList.remove('hidden');
    sound.tone(440, 0.25, 0.025, 'triangle', 720);
  };

  const applyUpgrade = (type: UpgradeType): void => {
    if (!state.choosingUpgrade) {
      return;
    }

    if (type === 'engine') {
      state.thrustMultiplier *= 1.15;
      state.brakeMultiplier *= 1.15;
      state.bonusFlashText = 'Vector engines upgraded';
    } else if (type === 'weapon') {
      state.permanentFireRateMultiplier *= 0.88;
      state.bonusFlashText = 'Weapon capacitors upgraded';
    } else {
      state.lives = Math.min(7, state.lives + 1);
      state.ship.shield = Math.max(state.ship.shield, 2.6);
      state.bonusFlashText = 'Reserve hull secured';
    }
    state.bonusFlashTimer = 1.8;
    state.choosingUpgrade = false;
    dom.upgradeOverlay.classList.add('hidden');
    state.wave += 1;
    beginWave();
    sound.tone(540, 0.24, 0.035, 'triangle', 960);
  };

  const registerTargetHit = (baseScore: number): void => {
    const previousMultiplier = state.comboMultiplier;
    state.comboCount += 1;
    state.comboMultiplier = Math.min(8, 1 + Math.floor(state.comboCount / 3));
    state.comboTimer = COMBO_WINDOW;
    state.score += baseScore * state.comboMultiplier;
    if (state.comboMultiplier > previousMultiplier) {
      state.bonusFlashText = `Multiplier ×${state.comboMultiplier}`;
      state.bonusFlashTimer = 0.9;
      sound.tone(
        400 + state.comboMultiplier * 55,
        0.13,
        0.025,
        'triangle',
        760 + state.comboMultiplier * 45,
      );
    }
    updateHud(state, dom);
  };

  const resetCombo = (): void => {
    state.comboCount = 0;
    state.comboMultiplier = 1;
    state.comboTimer = 0;
    updateComboHud(state, dom);
  };

  const resetGunBonuses = (): void => {
    state.hasTriShot = false;
    state.hasRapidFire = false;
    state.hasOverdrive = false;
  };

  const fire = (): void => {
    const { ship } = state;
    if (!ship.visible || state.fireCooldown > 0) {
      return;
    }

    const speed = 560;
    const noseX = ship.x + Math.cos(ship.angle) * 19;
    const noseY = ship.y + Math.sin(ship.angle) * 19;
    const triShotActive = state.hasTriShot || state.hasOverdrive;
    const rapidFireActive = state.hasRapidFire || state.hasOverdrive;
    for (const offset of triShotActive ? [-0.15, 0, 0.15] : [0]) {
      const angle = ship.angle + offset;
      state.bullets.push({
        x: noseX,
        y: noseY,
        vx: ship.vx + Math.cos(angle) * speed,
        vy: ship.vy + Math.sin(angle) * speed,
        life: 1.05,
        rapid: rapidFireActive,
        phase: Math.random() * TAU,
      });
    }
    const baseCooldown = triShotActive ? 0.11 : 0.14;
    state.fireCooldown =
      (rapidFireActive ? baseCooldown * 0.4 : baseCooldown) *
      state.permanentFireRateMultiplier;
    ship.vx -= Math.cos(ship.angle) * 3;
    ship.vy -= Math.sin(ship.angle) * 3;
    burst(
      state,
      noseX,
      noseY,
      rapidFireActive ? '#ff9b32' : '#87ffff',
      rapidFireActive ? 7 : 3,
      rapidFireActive ? 115 : 65,
    );
    if (rapidFireActive) {
      state.shake = Math.max(state.shake, 1.8);
    }
    sound.tone(
      rapidFireActive ? 620 : 460,
      0.055,
      0.015,
      'square',
      rapidFireActive ? 390 : 280,
    );
  };

  const hyperspace = (): void => {
    const { ship } = state;
    if (!ship.visible || state.hyperspaceCooldown > 0) {
      return;
    }

    burst(state, ship.x, ship.y, '#ad7dff', 22, 210);
    ship.x = Math.random() * state.width;
    ship.y = Math.random() * state.height;
    ship.shield = Math.max(ship.shield, 1.25);
    state.hyperspaceCooldown = 4;
    burst(state, ship.x, ship.y, '#6ffcff', 22, 210);
    sound.tone(180, 0.3, 0.035, 'triangle', 720);
  };

  const collectBonus = (index: number): void => {
    const pickup = state.pickups[index];
    state.pickups.splice(index, 1);
    state.score += 250;
    if (state.comboCount > 0) {
      state.comboTimer = COMBO_WINDOW;
    }

    if (pickup.type === 'shield') {
      state.shieldBonusTimer = 9;
      state.ship.shield = Math.max(state.ship.shield, state.shieldBonusTimer);
      state.bonusFlashText = 'Shield core acquired';
    } else if (pickup.type === 'tri-shot') {
      state.hasTriShot = true;
      state.bonusFlashText = 'Tri-shot armed until ship lost';
    } else if (pickup.type === 'rapid-fire') {
      state.hasRapidFire = true;
      state.bonusFlashText = 'Rapid fire armed until ship lost';
    } else if (pickup.type === 'overdrive') {
      state.hasOverdrive = true;
      state.bonusFlashText = 'R3 armed until ship lost';
    } else {
      state.lives = Math.min(5, state.lives + 1);
      state.bonusFlashText = 'Extra ship secured';
    }
    state.bonusFlashTimer = 1.8;
    burst(state, pickup.x, pickup.y, pickupColor(pickup.type), 28, 230);
    sound.tone(
      pickup.type === 'extra-ship' ? 680 : 520,
      0.28,
      0.04,
      'triangle',
      980,
    );
    updateHud(state, dom);
  };

  const destroyAsteroid = (index: number): void => {
    const asteroid = state.asteroids[index];
    state.asteroids.splice(index, 1);
    maybeDropBonus(state, asteroid);
    registerTargetHit(
      asteroid.size === 3 ? 20 : asteroid.size === 2 ? 50 : 100,
    );
    state.shake = Math.max(state.shake, asteroid.size * 3.5);
    burst(
      state,
      asteroid.x,
      asteroid.y,
      asteroid.size === 1 ? '#ff63c7' : '#9b78ff',
      8 + asteroid.size * 8,
      110 + asteroid.size * 55,
    );
    sound.tone(
      95 + asteroid.size * 32 + state.comboMultiplier * 8,
      0.12 + asteroid.size * 0.035,
      0.018 + asteroid.size * 0.008,
      'sawtooth',
      48,
    );
    splitAsteroid(state, asteroid);
  };

  const destroyUfo = (index: number): void => {
    const ufo = state.ufos[index];
    state.ufos.splice(index, 1);
    registerTargetHit(600);
    const rewards: PickupType[] = ['tri-shot', 'rapid-fire', 'overdrive'];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    createPickup(state, ufo.x, ufo.y, ufo.vx * 0.22, -18, reward);
    state.bonusFlashText = 'UFO DESTROYED — WEAPON CORE DROPPED';
    state.bonusFlashTimer = 1.7;
    state.shake = Math.max(state.shake, 16);
    explodeUfo(state, sound, ufo);
  };

  const hitShip = (): void => {
    const { ship } = state;
    if (ship.shield > 0 || !ship.visible) {
      return;
    }

    state.lives -= 1;
    ship.visible = false;
    resetGunBonuses();
    state.bonusFlashTimer = 0;
    state.bonusFlashText = '';
    resetCombo();
    state.shake = 24;
    burst(state, ship.x, ship.y, '#63f7ff', 46, 330);
    sound.tone(150, 0.5, 0.06, 'sawtooth', 42);
    updateHud(state, dom);
    if (state.lives <= 0) {
      setTimeout(() => endGame(), 500);
      return;
    }
    setTimeout(() => {
      if (state.running) {
        resetShip();
      }
    }, 900);
  };

  const update = (delta: number): void => {
    if (!state.running || state.choosingUpgrade) {
      return;
    }

    updateTimers(delta);
    updateShip(delta);
    updateProjectiles(delta);
    updateEnemies(delta);
    updatePickups(delta);
    resolveBulletHits();
    resolveShipHits();
    updateParticles(delta);
    advanceWave(delta);
    state.shake *= Math.pow(0.012, delta);
    updateComboHud(state, dom);
    updateBonusHud(state, dom);
  };

  const updateTimers = (delta: number): void => {
    state.fireCooldown = Math.max(0, state.fireCooldown - delta);
    state.hyperspaceCooldown = Math.max(0, state.hyperspaceCooldown - delta);
    if (state.comboTimer > 0) {
      state.comboTimer = Math.max(0, state.comboTimer - delta);
      if (state.comboTimer === 0) {
        resetCombo();
      }
    }
    state.shieldBonusTimer = Math.max(0, state.shieldBonusTimer - delta);
    state.bonusFlashTimer = Math.max(0, state.bonusFlashTimer - delta);
    state.ship.shield = Math.max(0, state.ship.shield - delta);
  };

  const updateShip = (delta: number): void => {
    const { keys, pointer, ship } = state;
    if (!ship.visible) {
      return;
    }

    const rotation = 3.6;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) {
      ship.angle -= rotation * delta;
    }
    if (keys.has('KeyD') || keys.has('ArrowRight')) {
      ship.angle += rotation * delta;
    }
    if (keys.has('KeyW') || keys.has('ArrowUp')) {
      const thrust = 235 * state.thrustMultiplier;
      ship.vx += Math.cos(ship.angle) * thrust * delta;
      ship.vy += Math.sin(ship.angle) * thrust * delta;
      if (Math.random() < 0.8) {
        state.particles.push({
          x: ship.x - Math.cos(ship.angle) * 15,
          y: ship.y - Math.sin(ship.angle) * 15,
          vx: ship.vx - Math.cos(ship.angle) * (80 + Math.random() * 85),
          vy: ship.vy - Math.sin(ship.angle) * (80 + Math.random() * 85),
          life: 0.22 + Math.random() * 0.22,
          maxLife: 0.44,
          size: 1.5 + Math.random() * 2.5,
          color: Math.random() > 0.45 ? '#5dfaff' : '#a56cff',
        });
      }
    }
    if (keys.has('KeyS') || keys.has('ArrowDown')) {
      brakeShip(delta);
    }
    if (pointer.firing) {
      ship.angle = Math.atan2(pointer.y - ship.y, pointer.x - ship.x);
    }
    if (keys.has('Space') || pointer.firing) {
      fire();
    }
    ship.x += ship.vx * delta;
    ship.y += ship.vy * delta;
    wrap(ship, state, ship.radius);
    dom.velocity.textContent = String(
      Math.round(Math.hypot(ship.vx, ship.vy)),
    ).padStart(3, '0');
  };

  const brakeShip = (delta: number): void => {
    const { ship } = state;
    const speed = Math.hypot(ship.vx, ship.vy);
    if (speed <= 0) {
      return;
    }

    const nextSpeed = Math.max(0, speed - 290 * state.brakeMultiplier * delta);
    const directionX = ship.vx / speed;
    const directionY = ship.vy / speed;
    const scale = nextSpeed / speed;
    ship.vx *= scale;
    ship.vy *= scale;
    if (Math.random() < 0.7) {
      const life = 0.18 + Math.random() * 0.18;
      state.particles.push({
        x: ship.x + directionX * 12,
        y: ship.y + directionY * 12,
        vx: ship.vx + directionX * (70 + Math.random() * 70),
        vy: ship.vy + directionY * (70 + Math.random() * 70),
        life,
        maxLife: life,
        size: 1.2 + Math.random() * 2,
        color: Math.random() > 0.45 ? '#ff9d66' : '#ff5fb7',
      });
    }
  };

  const updateProjectiles = (delta: number): void => {
    for (let index = state.bullets.length - 1; index >= 0; index -= 1) {
      const bullet = state.bullets[index];
      bullet.x += bullet.vx * delta;
      bullet.y += bullet.vy * delta;
      bullet.life -= delta;
      wrap(bullet, state, 2);
      if (bullet.life <= 0) {
        state.bullets.splice(index, 1);
      }
    }
    for (let index = state.enemyBullets.length - 1; index >= 0; index -= 1) {
      const bullet = state.enemyBullets[index];
      bullet.x += bullet.vx * delta;
      bullet.y += bullet.vy * delta;
      bullet.life -= delta;
      wrap(bullet, state, bullet.radius);
      if (bullet.life <= 0) {
        state.enemyBullets.splice(index, 1);
      }
    }
  };

  const updateEnemies = (delta: number): void => {
    if (state.wave >= 2 && !state.ufoSpawnedThisWave) {
      state.ufoSpawnTimer -= delta;
      if (state.ufoSpawnTimer <= 0) {
        state.ufoSpawnedThisWave = true;
        spawnUfo(state, sound);
      }
    }
    for (const asteroid of state.asteroids) {
      asteroid.x += asteroid.vx * delta;
      asteroid.y += asteroid.vy * delta;
      asteroid.angle += asteroid.spin * delta;
      wrap(asteroid, state, asteroid.radius);
    }
    for (let index = state.ufos.length - 1; index >= 0; index -= 1) {
      const ufo = state.ufos[index];
      ufo.x += ufo.vx * delta;
      ufo.phase += delta * 1.8;
      ufo.y = ufo.baseY + Math.sin(ufo.phase) * 46;
      ufo.shootTimer -= delta;
      if (ufo.shootTimer <= 0) {
        fireEnemyBullet(state, sound, ufo);
        ufo.shootTimer =
          Math.max(0.62, 1.48 - state.wave * 0.045) + Math.random() * 0.35;
      }
      if (ufo.x < -85 || ufo.x > state.width + 85) {
        state.ufos.splice(index, 1);
      }
    }
  };

  const updatePickups = (delta: number): void => {
    for (let index = state.pickups.length - 1; index >= 0; index -= 1) {
      const pickup = state.pickups[index];
      pickup.x += pickup.vx * delta;
      pickup.y += pickup.vy * delta;
      pickup.angle += pickup.spin * delta;
      pickup.life -= delta;
      wrap(pickup, state, pickup.radius);
      if (pickup.life <= 0) {
        state.pickups.splice(index, 1);
      } else if (
        state.ship.visible &&
        distanceWrapped(state.ship, pickup, state) <
          state.ship.radius + pickup.radius + 3
      ) {
        collectBonus(index);
      }
    }
  };

  const resolveBulletHits = (): void => {
    for (
      let bulletIndex = state.bullets.length - 1;
      bulletIndex >= 0;
      bulletIndex -= 1
    ) {
      const bullet = state.bullets[bulletIndex];
      if (hitUfoWithBullet(bulletIndex, bullet)) {
        continue;
      }

      for (
        let asteroidIndex = state.asteroids.length - 1;
        asteroidIndex >= 0;
        asteroidIndex -= 1
      ) {
        const asteroid = state.asteroids[asteroidIndex];
        if (distanceWrapped(bullet, asteroid, state) < asteroid.radius) {
          state.bullets.splice(bulletIndex, 1);
          destroyAsteroid(asteroidIndex);
          break;
        }
      }
    }
  };

  const hitUfoWithBullet = (
    bulletIndex: number,
    bullet: GameState['bullets'][number],
  ): boolean => {
    for (let ufoIndex = state.ufos.length - 1; ufoIndex >= 0; ufoIndex -= 1) {
      const ufo = state.ufos[ufoIndex];
      if (Math.hypot(bullet.x - ufo.x, bullet.y - ufo.y) < ufo.radius + 3) {
        state.bullets.splice(bulletIndex, 1);
        ufo.health -= 1;
        burst(state, bullet.x, bullet.y, '#ffd45f', 8, 100);
        sound.tone(390, 0.07, 0.015, 'square', 210);
        if (ufo.health <= 0) {
          destroyUfo(ufoIndex);
        }
        return true;
      }
    }
    return false;
  };

  const resolveShipHits = (): void => {
    const { ship } = state;
    if (ship.visible) {
      for (let index = state.enemyBullets.length - 1; index >= 0; index -= 1) {
        const bullet = state.enemyBullets[index];
        if (
          distanceWrapped(ship, bullet, state) <
          ship.radius + bullet.radius
        ) {
          state.enemyBullets.splice(index, 1);
          burst(
            state,
            bullet.x,
            bullet.y,
            ship.shield > 0 ? '#67faff' : '#ff6b3d',
            13,
            145,
          );
          if (ship.shield <= 0) {
            hitShip();
          } else {
            sound.tone(680, 0.08, 0.018, 'triangle', 410);
          }
          break;
        }
      }
    }
    if (ship.visible && ship.shield <= 0) {
      for (const asteroid of state.asteroids) {
        if (
          distanceWrapped(ship, asteroid, state) <
          ship.radius + asteroid.radius * 0.78
        ) {
          hitShip();
          break;
        }
      }
    }
  };

  const updateParticles = (delta: number): void => {
    for (let index = state.particles.length - 1; index >= 0; index -= 1) {
      const particle = state.particles[index];
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.life -= delta;
      wrap(particle, state, 3);
      if (particle.life <= 0) {
        state.particles.splice(index, 1);
      }
    }
  };

  const advanceWave = (delta: number): void => {
    if (
      state.wave >= 2 &&
      state.asteroids.length === 0 &&
      !state.ufoSpawnedThisWave
    ) {
      state.ufoSpawnTimer = 0;
    }
    if (
      state.asteroids.length !== 0 ||
      state.ufos.length !== 0 ||
      (state.wave >= 2 && !state.ufoSpawnedThisWave)
    ) {
      return;
    }

    if (state.nextWaveTimer === 0) {
      state.nextWaveTimer = 1.4;
      const waveBonus = state.wave * 250 * state.comboMultiplier;
      state.score += waveBonus;
      state.comboTimer = Math.max(state.comboTimer, 3.4);
      state.bonusFlashText = `Wave clear +${waveBonus.toLocaleString()}`;
      state.bonusFlashTimer = 1.3;
      updateHud(state, dom);
      return;
    }

    state.nextWaveTimer -= delta;
    if (state.nextWaveTimer > 0) {
      return;
    }
    if (state.wave % WAVES_PER_MISSION === 0) {
      showUpgradeChoices();
    } else {
      state.wave += 1;
      beginWave();
    }
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (
      ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
        event.code,
      )
    ) {
      event.preventDefault();
    }
    if (state.choosingUpgrade) {
      return;
    }
    if (!state.running && event.code === 'Enter') {
      startGame();
      return;
    }
    if (
      (event.code === 'ShiftLeft' || event.code === 'ShiftRight') &&
      !event.repeat
    ) {
      hyperspace();
    }
    state.keys.add(event.code);
  };

  const updatePointer = (event: PointerEvent): void => {
    const bounds = state.canvas.getBoundingClientRect();
    state.pointer.x = event.clientX - bounds.left;
    state.pointer.y = event.clientY - bounds.top;
  };

  const onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 || !state.running || state.choosingUpgrade) {
      return;
    }
    updatePointer(event);
    state.pointer.firing = true;
    state.ship.angle = Math.atan2(
      state.pointer.y - state.ship.y,
      state.pointer.x - state.ship.x,
    );
    fire();
  };

  return { mount };
};
