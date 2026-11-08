import { rem } from 'polished';
import { styled } from 'styled-components';

export const Controls = styled.div<{ $alwaysVisible: boolean }>`
  position: fixed;
  z-index: 1;
  right: max(${rem(22)}, env(safe-area-inset-right));
  bottom: max(${rem(22)}, env(safe-area-inset-bottom));
  left: max(${rem(22)}, env(safe-area-inset-left));
  display: ${({ $alwaysVisible }) => ($alwaysVisible ? 'flex' : 'none')};
  align-items: end;
  justify-content: space-between;
  color: #b8dce4;
  font:
    800 ${rem(10)} / 1 ui-monospace,
    'SFMono-Regular',
    Menlo,
    Consolas,
    monospace;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  pointer-events: none;

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
  border: ${rem(1)} solid rgba(99, 248, 255, 0.55);
  border-radius: 50%;
  background: rgba(5, 22, 35, 0.58);
  pointer-events: auto;
  touch-action: none;
`;

export const Knob = styled.div`
  width: ${rem(42)};
  height: ${rem(42)};
  border: ${rem(1)} solid #69fbff;
  border-radius: 50%;
  background: rgba(99, 248, 255, 0.24);
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
    border: ${rem(1)} solid rgba(105, 251, 255, 0.7);
    background: rgba(5, 35, 48, 0.78);
    color: #eaffff;
    font: inherit;
    letter-spacing: inherit;
    pointer-events: auto;
    touch-action: none;

    &:hover {
      transform: none;
    }

    &:active {
      background: rgba(13, 73, 85, 0.96);
    }

    &:disabled {
      opacity: 0.5;
    }

    &:focus-visible {
      outline: ${rem(2)} solid #f4feff;
      outline-offset: ${rem(2)};
    }
  }
`;
