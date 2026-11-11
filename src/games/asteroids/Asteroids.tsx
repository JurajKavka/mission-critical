import { useState } from 'react';
import type * as React from 'react';
import {
  ActionButton,
  Breadcrumbs,
  StartGamePanel,
} from '../../react-component-library';
import * as UI from '../../react-component-library/atlas-styles';
import { WEAPON_BONUS_DURATION } from './runtime/constants';
import { AsteroidsGame } from './AsteroidsGame';
import * as S from './Asteroids.styles';

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
        <StartGamePanel
          title={
            <>
              Neon <em>Asteroids</em>
            </>
          }
          subtitle={
            <>
              Break the incoming field into fragments and survive. No drag:
              momentum persists up to the speed limit. Weapon cores last{' '}
              {WEAPON_BONUS_DURATION} seconds. Chain hits before the combo meter
              drains.
            </>
          }
        >
          <ActionButton label="Launch" onClick={() => setHasLaunched(true)} />
          <S.ControlsHint>
            <span className="desktop-controls">
              A / D rotate · W thrust · S brake · Space fire · Shift
              hyperspace
            </span>
            <span className="mobile-controls">
              Steer / thrust · Hold brake · Tap jump · Auto fire
            </span>
          </S.ControlsHint>
          {import.meta.env.DEV && (
            <p>
              <a href="/games/asteroids/graphics/">Graphics catalog</a>
            </p>
          )}
        </StartGamePanel>
      </UI.LandingWrapper>
    </>
  );
};
