import { theme } from '../../react-component-library/theme';
import { createGlobalStyle, styled } from 'styled-components';
import { rem } from 'polished';
import { Panel } from '../../react-component-library/atlas-styles';

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
  color: ${theme.colors['ice-effeff']};
  user-select: none;
}

canvas {
  display: block;
  width: 100%;
  max-width: ${rem(1024)};
  height: 100%;
  margin: 0 auto;
  outline: ${rem(1)} solid ${theme.colors.canvasOutline};
  outline-offset: -${rem(1)};
  cursor: crosshair;
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
    color: ${theme.colors['cyan-b8dce4']};
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

.hud {
  position: fixed;
  inset: 0;
  width: 100%;
  max-width: ${rem(1024)};
  margin: 0 auto;
  padding: ${rem(22)};
  pointer-events: none;
}

.hud-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${rem(24)};
}

.stats {
  display: flex;
  gap: ${rem(28)};
  color: ${theme.colors.muted};
  font-size: ${rem(10)};
  letter-spacing: 0.18em;
  text-align: right;
  text-transform: uppercase;
}

.stats strong {
  display: block;
  margin-top: ${rem(4)};
  color: ${theme.colors.text};
  font-size: ${rem(20)};
  letter-spacing: 0.03em;
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
    ${theme.colors['cyan-bright']},
    ${theme.colors.magenta}
  );
}

.lives {
  position: absolute;
  left: ${rem(22)};
  bottom: ${rem(22)};
  color: ${theme.colors['blue-8da7ba']};
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
  border-bottom: ${rem(19)} solid ${theme.colors['cyan-68faff']};
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
  color: ${theme.colors['magenta-light']};
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

export const GameCanvas = styled.canvas``;
export const GameHud = styled.div.attrs({ className: 'hud' })`
  nav {
    pointer-events: auto;
  }
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
