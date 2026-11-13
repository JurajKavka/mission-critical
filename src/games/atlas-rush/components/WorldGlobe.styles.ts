import { rem } from 'polished';
import { styled } from 'styled-components';
import { theme } from '../../../react-component-library/theme';
import { Map } from '../../../react-component-library/atlas-styles';

export const Globe = styled(Map)`
  overflow: hidden;

  .globe-ocean {
    stroke: ${theme.colors.cyan};
    stroke-opacity: 0.6;
    stroke-width: ${rem(1)};
  }

  .globe-ocean-core {
    stop-color: ${theme.colors.panelLight};
  }

  .globe-ocean-edge {
    stop-color: ${theme.colors.panelDark};
  }

  .globe-grid {
    fill: none;
    stroke: ${theme.colors.cyan};
    stroke-opacity: 0.12;
    stroke-width: ${rem(0.5)};
    pointer-events: none;
  }

  .globe-marker {
    fill: ${theme.colors.amber};
    stroke: ${theme.colors.text};
    stroke-width: ${rem(1.5)};
  }

  .globe-marker-ring {
    fill: none;
    stroke: ${theme.colors.amber};
    stroke-width: ${rem(1)};
  }

  [role='button'] {
    cursor: pointer;
  }

  [role='button']:focus {
    outline: none;
  }

  [role='button']:focus-visible path,
  [role='button']:focus-visible .globe-marker-ring {
    stroke: ${theme.colors.text};
    stroke-width: ${rem(2)};
  }
`;
