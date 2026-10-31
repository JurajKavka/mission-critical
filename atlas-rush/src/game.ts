import { matchesCountry } from './answers';
import {
  createMap,
  createResults,
  createTimer,
  formatTime,
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
  root.innerHTML = `<header class="hud"><div><p class="brand">Mission Critical <span>//</span> Atlas Rush</p><p class="label">Sector 01 / Africa</p></div><div class="hud-stats"><div class="telemetry"><span class="label">Identified</span><strong id="progress">00&nbsp;/&nbsp;00</strong></div><div id="timer-slot"></div></div></header>
    <main class="playfield"><div class="map-heading"><span>Survey grid / 01</span><span>AFR · 54</span></div><div id="map-slot" class="map-slot"></div><div class="map-key"><span><i class="key-target"></i> Current target</span><span><i class="key-guessed"></i> Identified</span><span>Island nations shown as markers</span><span id="learning-hint" hidden>Learning mode / Select the target to reveal its name</span></div></main>
    <footer class="command"><div class="command-heading"><div><p class="eyebrow">Target acquired</p><label for="answer">Name the highlighted country</label></div><span class="command-index">01 / 54</span></div><form id="answer-form" autocomplete="off"><input id="answer" name="answer" type="text" placeholder="Enter country name in English" aria-describedby="feedback" required><button class="primary-button" type="submit">Identify<span class="button-arrow" aria-hidden="true">↵</span></button><button class="skip-button" type="button">Skip<span class="button-arrow" aria-hidden="true">→</span></button></form><p id="feedback" class="feedback" aria-live="polite">Type a name, then press Enter. Skip to return to a country later.</p></footer><div class="overlay" id="overlay"></div>`;
  const map = createMap(africa);
  const timer = createTimer();
  const mapSlot = root.querySelector<HTMLElement>('#map-slot')!;
  const timerSlot = root.querySelector<HTMLElement>('#timer-slot')!;
  const progress = root.querySelector<HTMLElement>('#progress')!;
  const form = root.querySelector<HTMLFormElement>('#answer-form')!;
  const answer = root.querySelector<HTMLInputElement>('#answer')!;
  const skip = root.querySelector<HTMLButtonElement>('.skip-button')!;
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
  overlay.innerHTML = `<section class="panel start-panel" role="dialog" aria-modal="true" aria-labelledby="start-title"><p class="eyebrow">Mission Critical // Sector 01</p><h1 id="start-title">Atlas <em>Rush</em></h1><p class="panel-copy">Identify the highlighted countries of Africa before the clock runs out.</p><div class="brief"><span>01 / ${africa.countries.length} countries</span><span>02 / ${formatTime(ROUND_SECONDS)} on the clock</span><span>03 / Skip and return later</span></div><button class="primary-button" type="button">Start survey<span class="button-arrow" aria-hidden="true">↗</span></button><label class="learning-option"><input id="learning-mode" type="checkbox"><span>Learning mode</span></label></section>`;
  if (import.meta.env.DEV) {
    const catalogLink = document.createElement('a');
    catalogLink.className = 'graphics-catalog-link';
    catalogLink.href = '/graphics/';
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
