import { COLORS } from '../../styles/colors';

import { useEffect, useRef, useState } from 'react';
import type * as React from 'react';
import { ActionButton, Breadcrumbs } from '../../react-component-library';
import * as UI from '../../react-component-library/atlas-styles';
import { ModalDialog } from '../atlas-rush/components/ModalDialog';
import {
  createGame,
  type GameController,
  type GamePhase,
} from './runtime/game';
import type { HudSnapshot } from './runtime/hud';
import type { UpgradeType } from './runtime/types';
import { AsteroidsTouchControls } from './runtime/touch-controls/AsteroidsTouchControls';
import * as S from './Asteroids.styles';

const INITIAL_HUD: HudSnapshot = {
  score: 0,
  wave: 1,
  lives: 3,
  velocity: 0,
  comboCount: 0,
  comboMultiplier: 1,
  comboProgress: 0,
  bonus: '',
};

const UPGRADES: { upgrade: UpgradeType; label: string; description: string }[] =
  [
    {
      upgrade: 'engine',
      label: 'Vector engines',
      description: 'Increase forward thrust and braking force by 15%.',
    },
    {
      upgrade: 'weapon',
      label: 'Weapon capacitors',
      description: 'Reduce firing delay by 12%, up to the system limit.',
    },
    {
      upgrade: 'hull',
      label: 'Reserve hull',
      description: 'Add one reserve ship and restore the spawn shield.',
    },
  ];

type AsteroidsGameProps = {
  startOnMount: boolean;
};

export const AsteroidsGame: React.FC<AsteroidsGameProps> = ({
  startOnMount,
}) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<GameController | null>(null);
  const [hud, setHud] = useState(INITIAL_HUD);
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [preview] = useState(
    () =>
      import.meta.env.DEV &&
      new URLSearchParams(window.location.search).get('preview') ===
        'mission-ended',
  );

  useEffect(() => {
    if (!canvas.current) {
      return;
    }
    const game = createGame(canvas.current, (snapshot, nextPhase) => {
      setHud(snapshot);
      setPhase(nextPhase);
    });
    controller.current = game;
    game.mount();
    if (startOnMount) {
      game.startGame();
    }
    return () => {
      controller.current = null;
      game.unmount();
    };
  }, [startOnMount]);

  const handleLaunch = (): void => controller.current?.startGame();
  const handleUpgrade = (upgrade: UpgradeType): void =>
    controller.current?.applyUpgrade(upgrade);
  const isEnded = phase === 'ended' || (preview && phase === 'ready');
  const score = preview && phase === 'ready' ? 128400 : hud.score;

  return (
    <>
      <S.GlobalStyles />
      <S.GameCanvas ref={canvas} aria-label="Neon Asteroids game field" />
      {phase === 'playing' && (
        <div className="touch-controls">
          <AsteroidsTouchControls />
        </div>
      )}
      <S.GameHud>
        <div className="hud-top">
          <Breadcrumbs
            breadcrumbs={[
              { label: 'Neon Asteroids', link: '/games/asteroids/' },
            ]}
          />
          <div className="stats">
            <div>
              Score<strong>{String(hud.score).padStart(6, '0')}</strong>
            </div>
            <div>
              Wave<strong>{String(hud.wave).padStart(2, '0')}</strong>
            </div>
            <div>
              Combo
              <strong
                style={{
                  color:
                    hud.comboMultiplier > 1
                      ? COLORS['magenta']
                      : COLORS['primary-text'],
                }}
              >
                {hud.comboCount
                  ? `${String(hud.comboCount).padStart(2, '0')} ×${hud.comboMultiplier}`
                  : '-- ×1'}
              </strong>
              <div className="combo-meter">
                <div
                  className="combo-fill"
                  style={{ width: `${hud.comboProgress * 100}%` }}
                />
              </div>
            </div>
            <div>
              Velocity<strong>{String(hud.velocity).padStart(3, '0')}</strong>
            </div>
          </div>
        </div>
        <div className="lives">
          Reserve ships
          <div className="ships" aria-label={`${hud.lives} reserve ships`}>
            {Array.from({ length: hud.lives }, (_, index) => (
              <span className="ship-life" key={index} />
            ))}
          </div>
        </div>
        <div className={`bonus-status${hud.bonus ? ' active' : ''}`}>
          {hud.bonus}
        </div>
        <div className="hint">
          A/D rotate · W thrust · S brake · Space/click fire · Shift hyperspace
        </div>
      </S.GameHud>
      {isEnded && (
        <ModalDialog labelledBy="asteroids-title">
          <S.GamePanel>
            <UI.Eyebrow>Fleet signal lost</UI.Eyebrow>
            <h1 id="asteroids-title">
              Mission
              <br />
              ended
            </h1>
            <p>
              Final score: <strong>{score.toLocaleString()}</strong>
              <br />
              The asteroid field is still transmitting.
            </p>
            <ActionButton label="Launch again" onClick={handleLaunch} />
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
          </S.GamePanel>
        </ModalDialog>
      )}
      {phase === 'upgrade' && (
        <ModalDialog labelledBy="upgrade-title">
          <S.GamePanel>
            <UI.Eyebrow>Mission sector cleared</UI.Eyebrow>
            <h2 id="upgrade-title">Select one system upgrade</h2>
            <p>Permanent for this run</p>
            <S.UpgradeOptions>
              {UPGRADES.map(({ upgrade, label, description }) => (
                <div key={upgrade}>
                  <ActionButton
                    label={label}
                    onClick={() => handleUpgrade(upgrade)}
                  />
                  <p>{description}</p>
                </div>
              ))}
            </S.UpgradeOptions>
          </S.GamePanel>
        </ModalDialog>
      )}
    </>
  );
};
