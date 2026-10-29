export interface Position {
  x: number;
  y: number;
}

export interface MovingEntity extends Position {
  vx: number;
  vy: number;
}

export type AsteroidSize = 1 | 2 | 3;
export type PickupType =
  'shield' | 'tri-shot' | 'rapid-fire' | 'overdrive' | 'extra-ship';
export type UpgradeType = 'engine' | 'weapon' | 'hull';

export interface Asteroid extends MovingEntity {
  angle: number;
  spin: number;
  radius: number;
  size: AsteroidSize;
  shape: number[];
}

export interface Bullet extends MovingEntity {
  life: number;
  rapid: boolean;
  phase: number;
}

export interface EnemyBullet extends MovingEntity {
  life: number;
  radius: number;
}

export interface Ufo extends Position {
  vx: number;
  baseY: number;
  phase: number;
  shootTimer: number;
  health: number;
  maxHealth: number;
  radius: number;
}

export interface Pickup extends MovingEntity {
  angle: number;
  spin: number;
  radius: number;
  life: number;
  type: PickupType;
}

export interface Particle extends MovingEntity {
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export interface Star extends Position {
  size: number;
  phase: number;
  layer: number;
}

export interface Ship extends MovingEntity {
  angle: number;
  radius: number;
  shield: number;
  visible: boolean;
}

export interface PointerState extends Position {
  firing: boolean;
}

export interface GameState {
  readonly canvas: HTMLCanvasElement;
  readonly context: CanvasRenderingContext2D;
  readonly galaxyCanvas: HTMLCanvasElement;
  width: number;
  height: number;
  running: boolean;
  score: number;
  wave: number;
  lives: number;
  comboCount: number;
  comboMultiplier: number;
  comboTimer: number;
  fireCooldown: number;
  hyperspaceCooldown: number;
  shieldBonusTimer: number;
  hasTriShot: boolean;
  hasRapidFire: boolean;
  hasOverdrive: boolean;
  bonusFlashTimer: number;
  bonusFlashText: string;
  nextWaveTimer: number;
  ufoSpawnTimer: number;
  ufoSpawnedThisWave: boolean;
  choosingUpgrade: boolean;
  thrustMultiplier: number;
  brakeMultiplier: number;
  permanentFireRateMultiplier: number;
  shake: number;
  lastTime: number;
  readonly keys: Set<string>;
  readonly asteroids: Asteroid[];
  readonly bullets: Bullet[];
  readonly ufos: Ufo[];
  readonly enemyBullets: EnemyBullet[];
  readonly pickups: Pickup[];
  readonly particles: Particle[];
  readonly stars: Star[];
  readonly pointer: PointerState;
  readonly ship: Ship;
}

export interface GameDom {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  overlay: HTMLDivElement;
  upgradeOverlay: HTMLDivElement;
  upgradeButtons: HTMLButtonElement[];
  startButton: HTMLButtonElement;
  title: HTMLHeadingElement;
  eyebrow: HTMLDivElement;
  subtitle: HTMLParagraphElement;
  score: HTMLElement;
  wave: HTMLElement;
  combo: HTMLElement;
  comboFill: HTMLDivElement;
  velocity: HTMLElement;
  ships: HTMLDivElement;
  bonusStatus: HTMLDivElement;
}
