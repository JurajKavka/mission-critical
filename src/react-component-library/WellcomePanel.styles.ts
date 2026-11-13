import { theme } from './theme';
import { rem } from 'polished';
import { styled } from 'styled-components';

export const Card = styled.div`
  position: relative;
  isolation: isolate;
  box-sizing: border-box;
  width: min(${rem(540)}, 100%);
  padding: clamp(${rem(20)}, 6vw, ${rem(43)});
  border: 0;
  background: ${theme.colors.welcomeBorder};
  color: ${theme.colors['primary-text']};
  font:
    ${rem(16)} / normal ui-monospace,
    'SFMono-Regular',
    Menlo,
    Consolas,
    monospace;
  text-align: center;
  text-rendering: auto;
  user-select: none;
  clip-path: polygon(
    ${rem(19)} 0,
    100% 0,
    100% calc(100% - ${rem(19)}),
    calc(100% - ${rem(19)}) 100%,
    0 100%,
    0 ${rem(19)}
  );

  &::before {
    position: absolute;
    z-index: -1;
    inset: ${rem(1)};
    background: linear-gradient(
      145deg,
      ${theme.colors.welcomeGradientStart},
      ${theme.colors.welcomeGradientEnd}
    );
    clip-path: polygon(
      ${rem(18.5)} 0,
      100% 0,
      100% calc(100% - ${rem(18.5)}),
      calc(100% - ${rem(18.5)}) 100%,
      0 100%,
      0 ${rem(18.5)}
    );
    content: '';
  }
`;

export const Eyebrow = styled.span`
  display: block;
  margin-bottom: ${rem(13)};
  color: ${theme.colors['violet']};
  font-size: ${rem(10)};
  font-weight: normal;
  letter-spacing: 0.42em;
  line-height: normal;
  text-transform: uppercase;
`;

export const Title = styled.h1`
  margin: ${rem(13)} 0 ${rem(3)};
  color: ${theme.colors.text};
  font-size: clamp(${rem(43)}, 8vw, ${rem(72)});
  font-weight: 900;
  letter-spacing: -0.065em;
  line-height: 0.9;
  text-wrap: wrap;
  text-shadow: ${rem(7)} ${rem(5)} 0 ${theme.colors.welcomeTitleShadow};
`;

export const Subtitle = styled.p`
  margin: ${rem(17)} auto ${rem(26)};
  color: ${theme.colors.secondary};
  font-size: ${rem(12)};
  line-height: 1.7;
  text-wrap: wrap;
`;

export const LaunchButton = styled.button`
  box-sizing: border-box;
  min-width: ${rem(190)};
  border: ${rem(1)} solid ${theme.colors.cyan};
  background: ${theme.colors.actionSurface};
  color: ${theme.colors.text};
  padding: ${rem(12)} ${rem(16)};
  font: inherit;
  font-size: ${rem(10)};
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition: background 0.2s;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.actionHover};
  }

  &:focus-visible {
    border-color: ${theme.colors.cyan};
    outline: none;
    box-shadow: inset 0 0 0 ${rem(2)} ${theme.colors.cyan};
  }

  @media (prefers-reduced-motion: reduce) {
    transition-duration: 0.01ms;
  }
`;

export const Arrow = styled.span`
  color: ${theme.colors.cyan};
  margin-left: ${rem(8)};
`;

export const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${rem(18)};
  margin-top: ${rem(25)};
  color: ${theme.colors['muted-text']};
  font-size: ${rem(9)};
  letter-spacing: 0.13em;
  text-transform: uppercase;

  span {
    color: ${theme.colors['primary-text']};
  }

  @media (any-pointer: coarse) {
    display: none;
  }
`;

export const TouchInstructions = styled.div`
  display: none;

  @media (any-pointer: coarse) {
    display: block;
    margin-top: ${rem(25)};
    color: ${theme.colors['secondary-text']};
    font-size: ${rem(10)};
    letter-spacing: 0.1em;
    line-height: 1.8;
    text-transform: uppercase;
  }
`;
