import './graphics.css';

import { drawFrame } from './renderer';
import { createGameState } from './state';
import { createBackgroundStars, renderGalaxyTexture } from './starfield';
import type { AsteroidSize, GameState, PickupType } from './types';

interface GraphicItem {
  name: string;
  configure: (state: GameState) => void;
}

interface GraphicPreview {
  state: GameState;
}

const PREVIEW_WIDTH = 280;
const PREVIEW_HEIGHT = 170;
const centerX = PREVIEW_WIDTH / 2;
const centerY = PREVIEW_HEIGHT / 2;
const asteroidShape = [0.82, 1.04, 0.9, 1.08, 0.78, 1, 0.86, 1.06, 0.8];

const hideShip = (state: GameState): void => {
  state.ship.visible = false;
};

const showShip = (
  state: GameState,
  shield: number,
  thrusting: boolean,
): void => {
  state.ship.x = centerX;
  state.ship.y = centerY;
  state.ship.angle = -Math.PI / 2;
  state.ship.shield = shield;
  if (thrusting) {
    state.keys.add('KeyW');
  }
};

const showAsteroid = (
  state: GameState,
  asteroidSize: AsteroidSize,
  radius: number,
): void => {
  hideShip(state);
  state.asteroids.push({
    x: centerX,
    y: centerY,
    vx: 0,
    vy: 0,
    angle: -0.18,
    spin: 0,
    radius,
    size: asteroidSize,
    shape: asteroidShape,
  });
};

const showPickup = (state: GameState, pickupType: PickupType): void => {
  hideShip(state);
  state.pickups.push({
    x: centerX,
    y: centerY,
    vx: 0,
    vy: 0,
    angle: 0,
    spin: 0,
    radius: 18,
    life: 12,
    type: pickupType,
  });
};

const graphicItems: GraphicItem[] = [
  {
    name: 'Playfield background',
    configure: hideShip,
  },
  {
    name: 'Player ship',
    configure: (state) => {
      showShip(state, 0, false);
    },
  },
  {
    name: 'Player ship // Thrust',
    configure: (state) => {
      showShip(state, 0, true);
    },
  },
  {
    name: 'Player ship // Shield',
    configure: (state) => {
      showShip(state, 1, false);
    },
  },
  {
    name: 'Large asteroid',
    configure: (state) => {
      showAsteroid(state, 3, 52);
    },
  },
  {
    name: 'Medium asteroid',
    configure: (state) => {
      showAsteroid(state, 2, 31);
    },
  },
  {
    name: 'Small asteroid',
    configure: (state) => {
      showAsteroid(state, 1, 17);
    },
  },
  {
    name: 'Shield bonus',
    configure: (state) => {
      showPickup(state, 'shield');
    },
  },
  {
    name: 'Tri-shot bonus',
    configure: (state) => {
      showPickup(state, 'tri-shot');
    },
  },
  {
    name: 'Rapid-fire bonus',
    configure: (state) => {
      showPickup(state, 'rapid-fire');
    },
  },
  {
    name: 'R3 overdrive bonus',
    configure: (state) => {
      showPickup(state, 'overdrive');
    },
  },
  {
    name: 'Extra ship bonus',
    configure: (state) => {
      showPickup(state, 'extra-ship');
    },
  },
  {
    name: 'Hostile UFO',
    configure: (state) => {
      hideShip(state);
      state.ufos.push({
        x: centerX,
        y: centerY,
        vx: 0,
        baseY: centerY,
        phase: 0,
        shootTimer: 1,
        health: 3,
        maxHealth: 3,
        radius: 24,
      });
    },
  },
  {
    name: 'Player projectile',
    configure: (state) => {
      hideShip(state);
      state.bullets.push({
        x: centerX,
        y: centerY,
        vx: 260,
        vy: 0,
        life: 1,
        rapid: false,
        phase: 0,
      });
    },
  },
  {
    name: 'Rapid-fire projectile',
    configure: (state) => {
      hideShip(state);
      state.bullets.push({
        x: centerX + 10,
        y: centerY,
        vx: 260,
        vy: 0,
        life: 1,
        rapid: true,
        phase: 0,
      });
    },
  },
  {
    name: 'Hostile projectile',
    configure: (state) => {
      hideShip(state);
      state.enemyBullets.push({
        x: centerX + 8,
        y: centerY,
        vx: 225,
        vy: 0,
        life: 1,
        radius: 4,
      });
    },
  },
  {
    name: 'Impact particle',
    configure: (state) => {
      hideShip(state);
      state.particles.push(
        {
          x: centerX - 8,
          y: centerY + 4,
          vx: 0,
          vy: 0,
          life: 0.8,
          maxLife: 1,
          size: 7,
          color: '#69fbff',
        },
        {
          x: centerX + 7,
          y: centerY - 5,
          vx: 0,
          vy: 0,
          life: 0.65,
          maxLife: 1,
          size: 5,
          color: '#ff65dc',
        },
      );
    },
  },
];

const getCatalog = (): HTMLElement => {
  const catalog = document.querySelector<HTMLElement>('#graphicsCatalog');
  if (!catalog) {
    throw new Error('Missing graphics catalog element.');
  }
  return catalog;
};

const createPreviewState = (canvas: HTMLCanvasElement): GameState => {
  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  canvas.width = PREVIEW_WIDTH * pixelRatio;
  canvas.height = PREVIEW_HEIGHT * pixelRatio;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('This browser does not support the 2D canvas API.');
  }

  context.scale(pixelRatio, pixelRatio);
  const state = createGameState({ canvas, context });
  state.width = PREVIEW_WIDTH;
  state.height = PREVIEW_HEIGHT;
  state.ship.x = centerX;
  state.ship.y = centerY;
  state.stars.push(...createBackgroundStars(PREVIEW_WIDTH, PREVIEW_HEIGHT));
  renderGalaxyTexture(state.galaxyCanvas, PREVIEW_WIDTH, PREVIEW_HEIGHT);
  return state;
};

const createGraphicCard = (
  graphicItem: GraphicItem,
  index: number,
): GraphicPreview => {
  const card = document.createElement('article');
  card.className = 'graphic-card';

  const canvas = document.createElement('canvas');
  canvas.className = 'graphic-preview';
  canvas.setAttribute('aria-label', graphicItem.name);

  const details = document.createElement('div');
  details.className = 'graphic-details';

  const itemIndex = document.createElement('span');
  itemIndex.className = 'graphic-index';
  itemIndex.textContent = `Asset ${String(index + 1).padStart(2, '0')}`;

  const name = document.createElement('h2');
  name.className = 'graphic-name';
  name.textContent = graphicItem.name;

  details.append(itemIndex, name);
  card.append(canvas, details);
  getCatalog().append(card);

  const state = createPreviewState(canvas);
  graphicItem.configure(state);
  return { state };
};

const previews = graphicItems.map(createGraphicCard);

const renderPreviews = (time: number): void => {
  for (const preview of previews) {
    drawFrame(preview.state, time);
  }
  requestAnimationFrame(renderPreviews);
};

requestAnimationFrame(renderPreviews);
