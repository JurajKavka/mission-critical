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

export const mountGraphicsCatalogLink = (dom: GameDom): void => {
  const graphicsCatalogLink = document.createElement('a');
  graphicsCatalogLink.className = 'graphics-catalog-link';
  graphicsCatalogLink.href = '/graphics/';
  graphicsCatalogLink.textContent = 'Graphics catalog';
  graphicsCatalogLink.target = '_blank';
  graphicsCatalogLink.rel = 'noreferrer';
  dom.overlay.append(graphicsCatalogLink);
};

export const showMissionEndedMessage = (
  dom: GameDom,
  finalScore: number,
): void => {
  dom.eyebrow.textContent = 'Fleet signal lost';
  dom.title.innerHTML = 'MISSION<br>ENDED';
  dom.subtitle.innerHTML = `Final score: <strong>${finalScore.toLocaleString()}</strong><br>The asteroid field is still transmitting.`;
  dom.startButton.textContent = 'Launch again';
  dom.overlay.classList.remove('hidden');
};
