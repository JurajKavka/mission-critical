import type { Region } from './types';

export const createLearningControls = (
  map: SVGSVGElement,
  region: Region,
  answer: HTMLInputElement,
): { setEnabled: (enabled: boolean) => void; hide: () => void } => {
  const tooltip = document.createElement('div');
  tooltip.className = 'country-tooltip';
  tooltip.setAttribute('role', 'status');
  tooltip.hidden = true;
  document.body.append(tooltip);
  let enabled = false;

  const isTarget = (element: EventTarget | null): element is Element =>
    element instanceof Element && element.matches('path.country--target');

  const hide = (): void => {
    tooltip.hidden = true;
  };

  const showCountry = (path: Element, x: number, y: number): void => {
    const country = region.countries.find(
      (candidate) => candidate.id === path.getAttribute('data-country'),
    );
    if (!enabled || !isTarget(path) || !country) {
      return;
    }
    tooltip.textContent = country.name;
    tooltip.hidden = false;
    const bounds = tooltip.getBoundingClientRect();
    tooltip.style.left = `${Math.max(8, Math.min(x + 12, window.innerWidth - bounds.width - 8))}px`;
    tooltip.style.top = `${Math.max(8, Math.min(y - bounds.height - 12, window.innerHeight - bounds.height - 8))}px`;
  };

  map.addEventListener('click', (event) => {
    const target = event.target;
    if (enabled && isTarget(target)) {
      showCountry(target, event.clientX, event.clientY);
      answer.focus();
    }
  });
  map.addEventListener('keydown', (event) => {
    const target = event.target;
    if (
      enabled &&
      isTarget(target) &&
      (event.key === 'Enter' || event.key === ' ')
    ) {
      event.preventDefault();
      const bounds = target.getBoundingClientRect();
      showCountry(target, bounds.left + bounds.width / 2, bounds.top);
    }
  });
  map.addEventListener('focusin', (event) => {
    const target = event.target;
    if (enabled && isTarget(target)) {
      const bounds = target.getBoundingClientRect();
      showCountry(target, bounds.left + bounds.width / 2, bounds.top);
    }
  });
  document.addEventListener('pointerdown', (event) => {
    const target = event.target;
    if (!isTarget(target)) {
      hide();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      hide();
    }
  });

  const setEnabled = (nextEnabled: boolean): void => {
    enabled = nextEnabled;
    hide();
    map.classList.toggle('continent-map--learning', enabled);
    map.setAttribute('role', enabled ? 'group' : 'img');
    map.setAttribute(
      'aria-label',
      enabled
        ? `${region.name} map. Select the highlighted country to reveal its name.`
        : `${region.name} map. The highlighted country is the current target.`,
    );
  };

  return { setEnabled, hide };
};
