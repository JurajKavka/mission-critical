import { theme } from '../../react-component-library/theme';
import { createGlobalStyle, styled } from 'styled-components';
import { rem } from 'polished';
import { Panel } from '../../react-component-library/atlas-styles';
import { mb } from '../../react-component-library/media-breakpoints';

export const GlobalStyles = createGlobalStyle`
body {
  user-select: none;
}

.touch-instructions {
  display: none;
}

@media (any-pointer: coarse) {
  .hint,
  .card .controls {
    display: none;
  }
  .touch-instructions {
    display: block;
    margin-top: ${rem(25)};
    color: ${theme.colors['secondary-text']};
    font-size: ${rem(10)};
    letter-spacing: 0.1em;
    line-height: 1.8;
    text-transform: uppercase;
  }
  .lives {
    bottom: ${rem(180)};
  }
  .bonus-status {
    bottom: ${rem(180)};
  }
}

.combo-meter {
  width: ${rem(76)};
  height: ${rem(2)};
  margin-top: ${rem(5)};
  margin-left: auto;
  overflow: hidden;
  background: ${theme.colors.meterTrack};
}

.combo-fill {
  width: 0;
  height: 100%;
  background: linear-gradient(
    90deg,
    ${theme.colors['cyan']},
    ${theme.colors.magenta}
  );
}

.lives {
  position: absolute;
  left: ${rem(22)};
  bottom: ${rem(22)};
  color: ${theme.colors['muted-text']};
  font-size: ${rem(10)};
  letter-spacing: 0.19em;
  text-transform: uppercase;
}

.ships {
  display: flex;
  gap: ${rem(9)};
  margin-top: ${rem(9)};
}

.ship-life {
  width: 0;
  height: 0;
  border-right: ${rem(7)} solid transparent;
  border-bottom: ${rem(19)} solid ${theme.colors['cyan']};
  border-left: ${rem(7)} solid transparent;
  transform: rotate(90deg);
}

.hint {
  position: absolute;
  right: ${rem(22)};
  bottom: ${rem(22)};
  color: ${theme.colors.disabledTelemetry};
  font-size: ${rem(10)};
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.bonus-status {
  position: absolute;
  left: 50%;
  bottom: ${rem(22)};
  padding: ${rem(8)} ${rem(13)};
  border: ${rem(1)} solid ${theme.colors.bonusBorder};
  background: ${theme.colors.bonusSurface};
  color: ${theme.colors['magenta']};
  font-size: ${rem(10)};
  font-weight: 800;
  letter-spacing: 0.18em;
  opacity: 0;
  text-transform: uppercase;
  transform: translateX(-50%) translateY(${rem(8)});
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.bonus-status.active {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

@media (any-pointer: coarse) {
  .lives, .bonus-status { bottom: ${rem(180)}; }
}
`;

export const GameStats = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: ${rem(28)};
  color: ${theme.colors.muted};
  font-size: ${theme.fontSizes.label};
  letter-spacing: 0.18em;
  text-align: right;

  strong {
    display: block;
    margin-top: ${rem(4)};
    color: ${theme.colors.text};
    font-size: ${rem(20)};
    letter-spacing: 0.03em;
  }

  ${mb('compact', { max: true })} {
    display: grid;
    grid-template-columns: repeat(2, auto);
    gap: ${rem(2)} ${rem(8)};
    font-size: ${theme.fontSizes.tiny};
    letter-spacing: 0.1em;

    > div {
      position: relative;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: ${rem(4)};
      white-space: nowrap;
    }

    strong {
      margin-top: 0;
      font-size: ${theme.fontSizes.body};
    }

    .combo-meter {
      position: absolute;
      right: 0;
      bottom: -${rem(3)};
      width: ${rem(52)};
      margin: 0;
    }
  }
`;

export const PlayfieldEdgeGlow = styled.div`
  display: none;
  ${mb('l', { pointer: 'fine' })} {
    display: block;
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      ${theme.colors.cyanBorderStrong},
      ${theme.colors.cyanFaint} ${rem(3)},
      transparent ${rem(16)},
      transparent calc(100% - ${rem(16)}),
      ${theme.colors.cyanFaint} calc(100% - ${rem(3)}),
      ${theme.colors.cyanBorderStrong}
    );
    mask-image: linear-gradient(
      transparent,
      black ${rem(18)},
      black calc(100% - ${rem(18)}),
      transparent
    );
    opacity: 0.16;
    pointer-events: none;
  }
`;

export const GameCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
`;

export const GameHud = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

export const ControlsHint = styled.div`
  margin-top: ${rem(24)};
  color: ${theme.colors.secondary};
  font-size: ${rem(10)};
  line-height: 1.8;
  text-transform: uppercase;
  @media (any-pointer: coarse) {
    .desktop-controls {
      display: none;
    }
  }
  @media (any-pointer: fine) {
    .mobile-controls {
      display: none;
    }
  }
`;
export const UpgradeOptions = styled.div`
  display: grid;
  gap: ${rem(10)};
  margin-top: ${rem(20)};
  button {
    width: 100%;
  }
`;

export const GamePanel = styled(Panel)`
  a {
    color: ${theme.colors.cyan};
  }
  a:focus-visible {
    outline: ${rem(2)} solid ${theme.colors.cyan};
    outline-offset: ${rem(3)};
  }
`;
