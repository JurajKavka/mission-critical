import { regionMetadata } from '../../../../games/atlas-rush/data/regions';
import type {
  LevelId,
  RegionId,
} from '../../../../games/atlas-rush/domain/types';
import { createRandomSeed } from '../../../../games/atlas-rush/infrastructure/browser-url';
import { getChallengePath } from '../../../../games/atlas-rush/infrastructure/challenge-url';
import { takeLandingSettings } from '../../../../games/atlas-rush/infrastructure/landing-settings';

const form = document.querySelector<HTMLFormElement>('#survey-settings');
const start = document.querySelector<HTMLButtonElement>('#start-survey');

const getRegionId = (value: FormDataEntryValue | null): RegionId => {
  if (typeof value === 'string' && Object.hasOwn(regionMetadata, value)) {
    return value as RegionId;
  }
  return 'africa';
};

const getLevel = (value: FormDataEntryValue | null): LevelId => {
  if (value === 'middle' || value === 'expert') {
    return value;
  }
  return 'beginner';
};

if (form && start) {
  const previous = takeLandingSettings();
  if (previous) {
    const regionInput = form.querySelector<HTMLInputElement>(
      `input[name="region"][value="${previous.regionId}"]`,
    );
    const levelInput = form.querySelector<HTMLInputElement>(
      `input[name="level"][value="${previous.level}"]`,
    );
    const learningInput = form.querySelector<HTMLInputElement>(
      'input[name="learning"]',
    );
    if (regionInput) {
      regionInput.checked = true;
    }
    if (levelInput) {
      levelInput.checked = true;
    }
    if (learningInput) {
      learningInput.checked = previous.learning;
    }
  }
  start.disabled = false;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = new FormData(form);
    const challenge = {
      regionId: getRegionId(fields.get('region')),
      level: getLevel(fields.get('level')),
      learning: fields.has('learning'),
      seed: createRandomSeed(),
    };
    window.location.assign(getChallengePath(challenge));
  });
}
