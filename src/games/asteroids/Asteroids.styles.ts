import { theme } from '../../react-component-library/theme';
import { createGlobalStyle, styled } from 'styled-components';
import { rem } from 'polished';
import {
  Panel,
  SiteShell,
  TopBar,
} from '../../react-component-library/atlas-styles';
import { mb } from '../../react-component-library/media-breakpoints';

export const GlobalStyles = createGlobalStyle`
:root {
  color-scheme: dark;
  font-family: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
}

* {
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  background: ${theme.colors.void};
  color: ${theme.colors['primary-text']};
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

export const GameShell = styled(SiteShell)`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  height: 100dvh;
`;

export const GameHeader = styled(TopBar)`
  grid-area: 1 / 1;
  align-self: start;
  z-index: 1;
  pointer-events: none;

  > nav a {
    pointer-events: auto;
  }

  ${mb('compact', { max: true })} {
    flex-direction: column;
    align-items: stretch;
    height: auto;
    gap: 0;
    padding-bottom: ${rem(8)};

    > nav {
      min-height: ${rem(48)};
      align-content: center;
    }
  }
`;

export const GameStats = styled.div`
  display: flex;
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
    flex-wrap: wrap;
    justify-content: space-between;
    gap: ${rem(8)};

    strong {
      font-size: ${rem(16)};
    }

    .combo-meter {
      width: ${rem(52)};
    }
  }
`;

export const GameField = styled.main`
  grid-area: 1 / 1;
  position: relative;
  width: min(100%, ${rem(1024)});
  justify-self: center;
`;

export const GameCanvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
  outline: ${rem(1)} solid ${theme.colors.canvasOutline};
  outline-offset: -${rem(1)};
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
