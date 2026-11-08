import { useEffect, useState } from 'react';
import type * as React from 'react';
import { ActionButton } from '../../../react-component-library/ActionButton';
import { BreadcrumbDivider } from '../../../react-component-library/BreadcrumbDivider';
import { Breadcrumbs } from '../../../react-component-library/Breadcrumbs';
import { Panel } from '../../../react-component-library/atlas-styles';
import { regionMetadata } from '../data/regions';
import { levels } from '../domain/levels';
import type { LevelId, RegionId } from '../domain/types';
import { createRandomSeed } from '../infrastructure/browser-url';
import { getChallengePath } from '../infrastructure/challenge-url';
import { takeLandingSettings } from '../infrastructure/landing-settings';
import * as UI from './landing-styles';

const REGIONS = [
  regionMetadata.africa,
  regionMetadata['south-america'],
  regionMetadata.usa,
  regionMetadata.europe,
];

export const Landing: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [regionId, setRegionId] = useState<RegionId>('africa');
  const [selectedLevel, setSelectedLevel] = useState<LevelId>('beginner');
  const [isLearning, setIsLearning] = useState(false);
  useEffect(() => {
    const previous = takeLandingSettings();
    if (previous) {
      setRegionId(previous.regionId);
      setSelectedLevel(previous.level);
      setIsLearning(previous.learning);
    }
    setIsReady(true);
  }, []);
  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.location.assign(
      getChallengePath({
        regionId,
        level: selectedLevel,
        learning: isLearning,
        seed: createRandomSeed(),
      }),
    );
  };
  return (
    <>
      <UI.GlobalStyles />
      <UI.Wrapper>
        <Breadcrumbs as="nav" aria-label="Game location">
          <a href="/">Mission Critical</a>
          <BreadcrumbDivider />
          <span>Atlas Rush</span>
        </Breadcrumbs>
        <Panel aria-labelledby="title">
          <h1 id="title">
            Atlas <em>Rush</em>
          </h1>
          <p>Identify countries before the clock runs out.</p>
          <UI.SettingsForm id="survey-settings" onSubmit={handleSubmit}>
            <fieldset>
              <legend>Select a region</legend>
              {REGIONS.map((region) => (
                <label key={region.id}>
                  <input
                    type="radio"
                    name="region"
                    value={region.id}
                    checked={regionId === region.id}
                    onChange={() => setRegionId(region.id)}
                  />{' '}
                  {region.name}
                </label>
              ))}
            </fieldset>
            <fieldset>
              <legend>Select a level</legend>
              {levels.map((level) => (
                <label key={level.id}>
                  <input
                    type="radio"
                    name="level"
                    value={level.id}
                    checked={selectedLevel === level.id}
                    onChange={() => setSelectedLevel(level.id)}
                  />{' '}
                  {level.label}
                </label>
              ))}
            </fieldset>
            <div className="start-action">
              <ActionButton
                label="Start survey"
                type="submit"
                disabled={!isReady}
              />
            </div>
            <label className="learning">
              <input
                type="checkbox"
                name="learning"
                checked={isLearning}
                onChange={(event) => setIsLearning(event.target.checked)}
              />{' '}
              Learning mode
            </label>
            <noscript>
              <p>Enable JavaScript to start a survey.</p>
            </noscript>
          </UI.SettingsForm>
        </Panel>
      </UI.Wrapper>
    </>
  );
};
