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
  background: #02040b;
  color: #effeff;
  user-select: none;
}

canvas {
  display: block;
  width: 100%;
  max-width: ${rem(1024)};
  height: 100%;
  margin: 0 auto;
  outline: ${rem(1)} solid rgba(128, 153, 174, 0.35);
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
    color: #b8dce4;
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

.brand {
  color: #69fbff;
  font-size: ${rem(12)};
  font-weight: 900;
  letter-spacing: 0.32em;
}

.stats {
  display: flex;
  gap: ${rem(28)};
  color: #8099ae;
  font-size: ${rem(10)};
  letter-spacing: 0.18em;
  text-align: right;
  text-transform: uppercase;
}

.stats strong {
  display: block;
  margin-top: ${rem(4)};
  color: #f4feff;
  font-size: ${rem(20)};
  letter-spacing: 0.03em;
}

.combo-meter {
  width: ${rem(76)};
  height: ${rem(2)};
  margin-top: ${rem(5)};
  margin-left: auto;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.12);
}

.combo-fill {
  width: 0;
  height: 100%;
  background: linear-gradient(90deg, #63f8ff, #ff65dc);
}

.lives {
  position: absolute;
  left: ${rem(22)};
  bottom: ${rem(22)};
  color: #8da7ba;
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
  border-bottom: ${rem(19)} solid #68faff;
  border-left: ${rem(7)} solid transparent;
  transform: rotate(90deg);
}

.hint {
  position: absolute;
  right: ${rem(22)};
  bottom: ${rem(22)};
  color: rgba(187, 215, 232, 0.62);
  font-size: ${rem(10)};
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.bonus-status {
  position: absolute;
  left: 50%;
  bottom: ${rem(22)};
  padding: ${rem(8)} ${rem(13)};
  border: ${rem(1)} solid rgba(255, 109, 217, 0.36);
  background: rgba(25, 7, 38, 0.58);
  color: #ff9be8;
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
export const GameHud = styled.div.attrs({ className: 'hud' })``;
export const ControlsHint = styled.div`
  margin-top: ${rem(24)};
  color: #9db5c8;
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
  nav {
    color: #69fbff;
    font-size: ${rem(10)};
    font-weight: 900;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }
  a {
    color: #69fbff;
  }
  a:focus-visible {
    outline: ${rem(2)} solid #69fbff;
    outline-offset: ${rem(3)};
  }
`;
