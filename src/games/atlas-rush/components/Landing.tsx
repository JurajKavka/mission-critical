import { useEffect, useState } from 'react';
import type * as React from 'react';
import { ActionButton } from '../../../react-component-library/ActionButton';
import { Breadcrumbs } from '../../../react-component-library/Breadcrumbs';
import { StartGamePanel } from '../../../react-component-library/StartGamePanel';
import { regionMetadata } from '../data/regions';
import { levels } from '../domain/levels';
import { DEFAULT_PREFIX_LENGTH } from '../domain/answer-comparison';
import type { LevelId, RegionId } from '../domain/types';
import { createRandomSeed } from '../infrastructure/browser-url';
import { getChallengePath } from '../infrastructure/challenge-url';
import { takeLandingSettings } from '../infrastructure/landing-settings';
import * as UI from '../../../react-component-library/atlas-styles';

const REGIONS = [
  regionMetadata.world,
  regionMetadata.africa,
  regionMetadata['south-america'],
  regionMetadata.usa,
  regionMetadata.europe,
  regionMetadata.asia,
];

export const Landing: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [regionId, setRegionId] = useState<RegionId>('world');
  const [selectedLevel, setSelectedLevel] = useState<LevelId>('beginner');
  const [isLearning, setIsLearning] = useState(false);
  const [isSpeedMode, setIsSpeedMode] = useState(false);
  useEffect(() => {
    const previous = takeLandingSettings();
    if (previous) {
      setRegionId(previous.regionId);
      setSelectedLevel(previous.level);
      setIsLearning(previous.learning);
      if (previous.answerComparison?.mode === 'prefix') {
        setIsSpeedMode(true);
      }
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
        ...(isSpeedMode
          ? {
              answerComparison: {
                mode: 'prefix',
                minimumCharacters: DEFAULT_PREFIX_LENGTH,
              } as const,
            }
          : {}),
      }),
    );
  };
  return (
    <>
      <UI.GlobalStyles />
      <UI.LandingWrapper>
        <Breadcrumbs
          breadcrumbs={[{ label: 'Atlas Rush', link: '/games/atlas-rush/' }]}
        />
        <StartGamePanel
          title={
            <>
              Atlas <em>Rush</em>
            </>
          }
          subtitle="Identify countries before the clock runs out."
        >
          <UI.SettingsForm id="survey-settings" onSubmit={handleSubmit}>
            <fieldset disabled={!isReady}>
              <legend>Select a region</legend>
              <div className="regions">
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
              </div>
            </fieldset>
            <fieldset disabled={!isReady}>
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
            <label className="learning">
              <input
                type="checkbox"
                name="learning"
                disabled={!isReady}
                checked={isLearning}
                onChange={(event) => setIsLearning(event.target.checked)}
              />{' '}
              Learning mode
            </label>
            <label className="mode-option">
              <input
                type="checkbox"
                name="speed"
                disabled={!isReady}
                checked={isSpeedMode}
                onChange={(event) => setIsSpeedMode(event.target.checked)}
              />{' '}
              Speed mode
            </label>
            <div className="start-action">
              <ActionButton
                label="Start survey"
                type="submit"
                disabled={!isReady}
              />
            </div>
            <noscript>
              <p>Enable JavaScript to start a survey.</p>
            </noscript>
          </UI.SettingsForm>
        </StartGamePanel>
      </UI.LandingWrapper>
    </>
  );
};
