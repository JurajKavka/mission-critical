import { WellcomeScreenContentWrapper } from '../../../react-component-library/WellcomeScreenContentWrapper';
import { useEffect, useState } from 'react';
import type * as React from 'react';
import { ActionButton } from '../../../react-component-library/ActionButton';
import { Breadcrumbs } from '../../../react-component-library/Breadcrumbs';
import { CheckboxButton } from '../../../react-component-library/CheckboxButton';
import { RadioButton } from '../../../react-component-library/RadioButton';
import { WellcomePanel } from '../../../react-component-library/WellcomePanel';
import { regionMetadata } from '../data/regions';
import { levels } from '../domain/levels';
import { DEFAULT_PREFIX_LENGTH } from '../domain/answer-comparison';
import type { LevelId, RegionId } from '../domain/types';
import { createRandomSeed } from '../infrastructure/browser-url';
import { getChallengePath } from '../infrastructure/challenge-url';
import { takeLandingSettings } from '../infrastructure/landing-settings';
import * as UI from '../../../react-component-library/atlas-styles';
import { AtlasRushLayout } from '../../../react-component-library/game-layouts';

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
      <AtlasRushLayout.LandingWrapper>
        <AtlasRushLayout.TopBar>
          <Breadcrumbs
            breadcrumbs={[{ label: 'Atlas Rush', link: '/games/atlas-rush/' }]}
          />
        </AtlasRushLayout.TopBar>
        <WellcomeScreenContentWrapper>
          <WellcomePanel
            title={
              <>
                Atlas <em>Rush</em>
              </>
            }
          >
            <UI.SettingsForm id="survey-settings" onSubmit={handleSubmit}>
              <fieldset disabled={!isReady}>
                <legend>Select a region</legend>
                <div className="regions">
                  {REGIONS.map((region) => (
                    <RadioButton
                      key={region.id}
                      label={region.name}
                      name="region"
                      value={region.id}
                      checked={regionId === region.id}
                      onChange={() => setRegionId(region.id)}
                    />
                  ))}
                </div>
              </fieldset>
              <fieldset disabled={!isReady}>
                <legend>Select a level</legend>
                {levels.map((level) => (
                  <RadioButton
                    key={level.id}
                    label={level.label}
                    name="level"
                    value={level.id}
                    checked={selectedLevel === level.id}
                    onChange={() => setSelectedLevel(level.id)}
                  />
                ))}
              </fieldset>
              <fieldset disabled={!isReady}>
                <legend>Select a mode</legend>
                <CheckboxButton
                  label="Learning mode"
                  name="learning"
                  checked={isLearning}
                  onChange={(event) => setIsLearning(event.target.checked)}
                />
                <CheckboxButton
                  label="Speed mode"
                  name="speed"
                  checked={isSpeedMode}
                  onChange={(event) => setIsSpeedMode(event.target.checked)}
                />
              </fieldset>
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
          </WellcomePanel>
        </WellcomeScreenContentWrapper>
      </AtlasRushLayout.LandingWrapper>
    </>
  );
};
