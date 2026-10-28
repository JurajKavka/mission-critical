export type GameStatus = 'online';

export type Game = {
  readonly id: string;
  readonly name: string;
  readonly designation: string;
  readonly description: string;
  readonly objective: string;
  readonly controls: readonly string[];
  readonly accent: 'violet';
  readonly status: GameStatus;
};

export const games: readonly Game[] = [
  {
    id: 'asteroids',
    name: 'Neon Asteroids',
    designation: 'MC–001',
    description:
      'Thread the debris field, split incoming rock, and keep your combo signal alive.',
    objective: 'Survive escalating waves',
    controls: ['Keyboard', 'Pointer'],
    accent: 'violet',
    status: 'online',
  },
];
