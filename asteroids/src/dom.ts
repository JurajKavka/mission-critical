import type { GameDom } from './types';

const getElement = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Required element #${id} was not found.`);
  }
  return element as T;
};

const getCanvasContext = (
  canvas: HTMLCanvasElement,
): CanvasRenderingContext2D => {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('This browser does not support the 2D canvas API.');
  }
  return context;
};

export const getGameDom = (): GameDom => {
  const canvas = getElement<HTMLCanvasElement>('game');
  return {
    canvas,
    context: getCanvasContext(canvas),
    overlay: getElement<HTMLDivElement>('overlay'),
    upgradeOverlay: getElement<HTMLDivElement>('upgradeOverlay'),
    upgradeButtons: [
      ...document.querySelectorAll<HTMLButtonElement>('[data-upgrade]'),
    ],
    startButton: getElement<HTMLButtonElement>('start'),
    title: getElement<HTMLHeadingElement>('title'),
    eyebrow: getElement<HTMLDivElement>('eyebrow'),
    subtitle: getElement<HTMLParagraphElement>('subtitle'),
    score: getElement<HTMLElement>('score'),
    wave: getElement<HTMLElement>('wave'),
    combo: getElement<HTMLElement>('combo'),
    comboFill: getElement<HTMLDivElement>('comboFill'),
    velocity: getElement<HTMLElement>('velocity'),
    ships: getElement<HTMLDivElement>('ships'),
    bonusStatus: getElement<HTMLDivElement>('bonusStatus'),
  };
};
