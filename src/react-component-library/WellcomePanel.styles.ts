import { rem } from 'polished';
import { styled } from 'styled-components';

export const Card = styled.div`
  position: relative;
  isolation: isolate;
  box-sizing: border-box;
  width: min(${rem(540)}, 100%);
  padding: clamp(${rem(20)}, 6vw, ${rem(43)});
  border: 0;
  background: rgba(93, 239, 255, 0.48);
  color: #effeff;
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
      rgba(9, 25, 42, 0.97),
      rgba(5, 7, 18, 0.98)
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
  color: #b89bff;
  font-size: ${rem(10)};
  font-weight: normal;
  letter-spacing: 0.42em;
  line-height: normal;
  text-transform: uppercase;
`;

export const Title = styled.h1`
  margin: ${rem(13)} 0 ${rem(3)};
  color: #f4feff;
  font-size: clamp(${rem(43)}, 8vw, ${rem(72)});
  font-weight: 900;
  letter-spacing: -0.065em;
  line-height: 0.9;
  text-wrap: wrap;
  text-shadow: ${rem(7)} ${rem(5)} 0 rgba(150, 60, 255, 0.28);
`;

export const Subtitle = styled.p`
  margin: ${rem(17)} auto ${rem(26)};
  color: #9db5c8;
  font-size: ${rem(12)};
  line-height: 1.7;
  text-wrap: wrap;
`;

export const LaunchButton = styled.button`
  box-sizing: border-box;
  min-width: ${rem(190)};
  border: ${rem(1)} solid #69fbff;
  background: rgba(21, 97, 116, 0.2);
  color: #f4feff;
  padding: ${rem(12)} ${rem(16)};
  font: inherit;
  font-size: ${rem(10)};
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition: background 0.2s;
  cursor: pointer;

  &:hover {
    background: rgba(31, 142, 161, 0.35);
  }

  &:focus-visible {
    border-color: #69fbff;
    outline: none;
    box-shadow: inset 0 0 0 ${rem(2)} #69fbff;
  }

  @media (prefers-reduced-motion: reduce) {
    transition-duration: 0.01ms;
  }
`;

export const Arrow = styled.span`
  color: #69fbff;
  margin-left: ${rem(8)};
`;

export const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${rem(18)};
  margin-top: ${rem(25)};
  color: #71899d;
  font-size: ${rem(9)};
  letter-spacing: 0.13em;
  text-transform: uppercase;

  span {
    color: #dcfbff;
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
    color: #b8dce4;
    font-size: ${rem(10)};
    letter-spacing: 0.1em;
    line-height: 1.8;
    text-transform: uppercase;
  }
`;
