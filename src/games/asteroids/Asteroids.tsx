import { useState } from 'react';
import type * as React from 'react';
import {
  Breadcrumbs,
  WellcomePanel,
} from '../../react-component-library';
import * as UI from '../../react-component-library/atlas-styles';
import * as WelcomeUI from '../../react-component-library/WellcomePanel.styles';
import { WEAPON_BONUS_DURATION } from './runtime/constants';
import { AsteroidsGame } from './AsteroidsGame';

export const Asteroids: React.FC = () => {
  const [hasLaunched, setHasLaunched] = useState(false);
  const [preview] = useState(
    () =>
      import.meta.env.DEV &&
      new URLSearchParams(window.location.search).get('preview') ===
        'mission-ended',
  );

  if (hasLaunched || preview) {
    return <AsteroidsGame startOnMount={hasLaunched} />;
  }

  return (
    <>
      <UI.GlobalStyles />
      <UI.LandingWrapper>
        <Breadcrumbs
          breadcrumbs={[{ label: 'Neon Asteroids', link: '/games/asteroids/' }]}
        />
        <WellcomePanel
          title={
            <>
              <WelcomeUI.Eyebrow>Deep-space relay online</WelcomeUI.Eyebrow>
              NEON<br />ASTEROIDS
            </>
          }
          subtitle={
            <>
              Break the incoming field into fragments and survive.<br />No drag:
              momentum persists up to the speed limit. Weapon cores last{' '}
              {WEAPON_BONUS_DURATION} seconds. Chain hits before the combo meter
              drains.
            </>
          }
        >
          <WelcomeUI.LaunchButton type="button" onClick={() => setHasLaunched(true)}>
            <span data-action-label>Launch</span>
            <WelcomeUI.Arrow aria-hidden="true">↗</WelcomeUI.Arrow>
          </WelcomeUI.LaunchButton>
          <WelcomeUI.Controls>
            <div><span>A / D</span> rotate</div>
            <div><span>W</span> thrust</div>
            <div><span>S</span> brake</div>
            <div><span>Space</span> fire</div>
            <div><span>Shift</span> hyperspace</div>
          </WelcomeUI.Controls>
          <WelcomeUI.TouchInstructions>
            Steer / thrust · Hold brake · Tap jump · Auto fire
          </WelcomeUI.TouchInstructions>
          {import.meta.env.DEV && (
            <p>
              <a href="/games/asteroids/graphics/">Graphics catalog</a>
            </p>
          )}
        </WellcomePanel>
      </UI.LandingWrapper>
    </>
  );
};
