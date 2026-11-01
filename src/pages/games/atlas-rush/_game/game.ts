import { matchesCountry } from './answers';
import {
  createMap,
  createResults,
  createTimer,
  updateMap,
  updateTimer,
} from './components';
import { createLearningControls } from './learning';
import { africa, ROUND_SECONDS } from './regions';
import type { Country } from './types';

const shuffleCountries = (countries: readonly Country[]): Country[] => {
  const shuffled = [...countries];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled;
};

export const startGame = (root: HTMLElement): void => {
  const map = createMap(africa);
  const timer = createTimer();
  const mapSlot = root.querySelector<HTMLElement>('#map-slot')!;
  const timerSlot = root.querySelector<HTMLElement>('#timer-slot')!;
  const progress = root.querySelector<HTMLElement>('#progress')!;
  const form = root.querySelector<HTMLFormElement>('#answer-form')!;
  const answer = root.querySelector<HTMLInputElement>('#answer')!;
  const skip = root.querySelector<HTMLButtonElement>('#skip')!;
  const feedback = root.querySelector<HTMLElement>('#feedback')!;
  const overlay = root.querySelector<HTMLElement>('#overlay')!;
  const index = root.querySelector<HTMLElement>('.command-index')!;
  const learningHint = root.querySelector<HTMLElement>('#learning-hint')!;
  mapSlot.append(map);
  timerSlot.append(timer);
  const learning = createLearningControls(map, africa, answer);
  let remaining = shuffleCountries(africa.countries);
  let guessed = new Set<string>();
  let startedAt = 0;
  let interval = 0;
  let active = false;
  let learningMode = false;

  const render = (): void => {
    updateMap(map, active ? (remaining[0]?.id ?? null) : null, guessed);
    progress.innerHTML = `${String(guessed.size).padStart(2, '0')}&nbsp;/&nbsp;${africa.countries.length}`;
    index.textContent = `${String(guessed.size + 1).padStart(2, '0')} / ${africa.countries.length}`;
  };
  const finish = (completed: boolean): void => {
    active = false;
    learning.setEnabled(false);
    window.clearInterval(interval);
    const elapsedSeconds = Math.min(
      ROUND_SECONDS,
      (performance.now() - startedAt) / 1000,
    );
    updateTimer(timer, completed ? ROUND_SECONDS - elapsedSeconds : 0);
    render();
    const results = createResults({
      total: africa.countries.length,
      guessed: guessed.size,
      elapsedSeconds,
      completed,
    });
    overlay.replaceChildren(results);
    overlay.classList.add('overlay--visible');
    const replay = results.querySelector<HTMLButtonElement>('button')!;
    replay.addEventListener('click', begin);
    replay.focus();
  };
  const tick = (): boolean => {
    const seconds = ROUND_SECONDS - (performance.now() - startedAt) / 1000;
    updateTimer(timer, seconds);
    if (seconds <= 0) {
      finish(false);
      return false;
    }
    return true;
  };
  const begin = (): void => {
    remaining = shuffleCountries(africa.countries);
    guessed = new Set<string>();
    startedAt = performance.now();
    active = true;
    learning.setEnabled(learningMode);
    learningHint.hidden = !learningMode;
    overlay.classList.remove('overlay--visible');
    answer.value = '';
    feedback.textContent =
      'Type a name, then press Enter. Skip to return to a country later.';
    feedback.classList.remove('feedback--error');
    render();
    updateTimer(timer, ROUND_SECONDS);
    interval = window.setInterval(tick, 200);
    answer.focus();
  };
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!active || !tick()) {
      return;
    }
    const country = remaining[0];
    if (!matchesCountry(country, answer.value)) {
      feedback.textContent = 'Not a match. Try again or skip this target.';
      feedback.classList.add('feedback--error');
      answer.select();
      return;
    }
    guessed.add(country.id);
    learning.hide();
    remaining.shift();
    answer.value = '';
    feedback.textContent = `${country.name} identified. Next target acquired.`;
    feedback.classList.remove('feedback--error');
    if (remaining.length === 0) {
      finish(true);
    } else {
      render();
      answer.focus();
    }
  });
  skip.addEventListener('click', () => {
    if (!active || !tick()) {
      return;
    }
    const country = remaining.shift();
    learning.hide();
    if (country) {
      remaining.push(country);
    }
    answer.value = '';
    feedback.textContent =
      'Target deferred. It will return later in the round.';
    feedback.classList.remove('feedback--error');
    render();
    answer.focus();
  });
  render();
  updateTimer(timer, ROUND_SECONDS);
  if (import.meta.env.DEV) {
    const catalogLink = document.createElement('a');
    catalogLink.className = 'graphics-catalog-link';
    catalogLink.href = '/games/atlas-rush/graphics/';
    catalogLink.textContent = 'Graphics catalog';
    catalogLink.target = '_blank';
    catalogLink.rel = 'noreferrer';
    overlay.querySelector('.start-panel')!.append(catalogLink);
  }
  overlay.classList.add('overlay--visible');
  const start = overlay.querySelector<HTMLButtonElement>('button')!;
  const learningCheckbox =
    overlay.querySelector<HTMLInputElement>('#learning-mode')!;
  start.addEventListener('click', () => {
    learningMode = learningCheckbox.checked;
    begin();
  });
  start.focus();
};
