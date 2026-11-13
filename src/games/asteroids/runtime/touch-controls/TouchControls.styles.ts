import { theme } from '../../../../react-component-library/theme';
import { rem } from 'polished';
import { styled } from 'styled-components';

export const Controls = styled.div<{ $alwaysVisible: boolean }>`
  position: fixed;
  z-index: 1;
  bottom: max(${rem(22)}, env(safe-area-inset-bottom));
  left: 50%;
  width: min(100%, 1024px);
  padding-right: max(${rem(22)}, env(safe-area-inset-right));
  padding-left: max(${rem(22)}, env(safe-area-inset-left));
  box-sizing: border-box;
  display: ${({ $alwaysVisible }) => ($alwaysVisible ? 'flex' : 'none')};
  align-items: end;
  justify-content: space-between;
  color: ${theme.colors['cyan-b8dce4']};
  font:
    800 ${rem(10)} / 1 ui-monospace,
    'SFMono-Regular',
    Menlo,
    Consolas,
    monospace;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  pointer-events: none;
  transform: translateX(-50%);

  @media (any-pointer: coarse) {
    display: flex;
  }
`;

export const StickGroup = styled.div`
  display: grid;
  justify-items: center;
  gap: ${rem(8)};
`;

export const Stick = styled.div`
  display: grid;
  width: ${rem(120)};
  height: ${rem(120)};
  place-items: center;
  border: ${rem(1)} solid ${theme.colors.touchControlBorder};
  border-radius: 50%;
  background: ${theme.colors.touchControlSurface};
  pointer-events: auto;
  touch-action: none;
`;

export const Knob = styled.div`
  width: ${rem(42)};
  height: ${rem(42)};
  border: ${rem(1)} solid ${theme.colors.cyan};
  border-radius: 50%;
  background: ${theme.colors.touchControlFill};
  pointer-events: none;
`;

export const Actions = styled.div`
  display: flex;
  gap: ${rem(12)};
  align-items: end;
`;

export const Action = styled.button`
  && {
    min-width: ${rem(72)};
    min-height: ${rem(64)};
    padding: ${rem(10)};
    border: ${rem(1)} solid ${theme.colors.focusBorder};
    background: ${theme.colors.touchButtonSurface};
    color: ${theme.colors['ice-eaffff']};
    font: inherit;
    letter-spacing: inherit;
    pointer-events: auto;
    touch-action: none;

    &:hover {
      transform: none;
    }

    &:active {
      background: ${theme.colors.touchControlActive};
    }

    &:disabled {
      opacity: 0.5;
    }

    &:focus-visible {
      outline: ${rem(2)} solid ${theme.colors.text};
      outline-offset: ${rem(2)};
    }
  }
`;
