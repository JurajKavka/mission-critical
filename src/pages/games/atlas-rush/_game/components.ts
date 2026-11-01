import type { Region, Results } from './types';

const svgNamespace = 'http://www.w3.org/2000/svg';

export const createMap = (region: Region): SVGSVGElement => {
  const svg = document.createElementNS(svgNamespace, 'svg');
  svg.setAttribute('viewBox', region.viewBox);
  svg.setAttribute('role', 'img');
  svg.setAttribute(
    'aria-label',
    `${region.name} map. The highlighted country is the current target.`,
  );
  svg.classList.add('continent-map');
  for (const country of region.countries) {
    const path = document.createElementNS(svgNamespace, 'path');
    path.setAttribute('d', country.path);
    path.setAttribute('data-country', country.id);
    path.setAttribute('vector-effect', 'non-scaling-stroke');
    path.classList.add('country');
    svg.append(path);
  }
  return svg;
};

export const updateMap = (
  map: SVGSVGElement,
  target: string | null,
  guessed: ReadonlySet<string>,
): void => {
  for (const path of map.querySelectorAll<SVGPathElement>('[data-country]')) {
    const id = path.dataset.country ?? '';
    path.classList.toggle('country--target', id === target);
    path.classList.toggle('country--guessed', guessed.has(id));
    if (id === target && map.classList.contains('continent-map--learning')) {
      path.setAttribute('tabindex', '0');
      path.setAttribute('role', 'button');
      path.setAttribute('aria-label', 'Reveal the target country name');
    } else {
      path.removeAttribute('tabindex');
      path.removeAttribute('role');
      path.removeAttribute('aria-label');
    }
  }
};

export const formatTime = (seconds: number): string => {
  const wholeSeconds = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(wholeSeconds / 60)).padStart(2, '0')}:${String(wholeSeconds % 60).padStart(2, '0')}`;
};

export const createTimer = (): HTMLElement => {
  const timer = document.createElement('div');
  timer.className = 'telemetry timer';
  timer.innerHTML =
    '<span class="label">Time remaining</span><strong class="timer-value">00:00</strong>';
  return timer;
};

export const updateTimer = (timer: HTMLElement, seconds: number): void => {
  const value = timer.querySelector('.timer-value');
  if (value) {
    value.textContent = formatTime(seconds);
  }
  timer.classList.toggle('timer--urgent', seconds <= 30);
};

export const createResults = (results: Results): HTMLElement => {
  const section = document.createElement('section');
  section.className = 'panel results';
  section.setAttribute('role', 'dialog');
  section.setAttribute('aria-modal', 'true');
  section.setAttribute('aria-labelledby', 'results-title');
  const percentage = Math.round((results.guessed / results.total) * 100);
  section.innerHTML = `<p class="eyebrow">Mission report // ${results.completed ? 'complete' : 'time expired'}</p>
    <h2 id="results-title">${results.completed ? 'Atlas complete' : 'Time is up'}</h2>
    <p class="panel-copy">${results.completed ? `All countries identified in ${formatTime(results.elapsedSeconds)}.` : 'Your survey is complete.'}</p>
    <dl class="results-grid">
      <div><dt>Countries</dt><dd>${results.total}</dd></div>
      <div><dt>Guessed</dt><dd>${results.guessed}</dd></div>
      <div><dt>Not guessed</dt><dd>${results.total - results.guessed}</dd></div>
      <div><dt>Coverage</dt><dd>${percentage}%</dd></div>
    </dl>
    <p class="ratio">${results.guessed} / ${results.total} countries identified</p>
    <button class="primary-button" type="button">Play again<span class="button-arrow" aria-hidden="true">↗</span></button>`;
  return section;
};
