import type { Preview } from '@storybook/react-vite';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from '../src/react-component-library/atlas-styles';
import { ATLAS_THEME } from '../src/react-component-library/theme';
import '../src/styles/global.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider theme={ATLAS_THEME}>
        <GlobalStyles />
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
};

export default preview;
