import palette from './colors.json';

/** The project's color palette, shared with the generated CSS custom properties. */
export const COLORS = palette;

const COLOR_CHANNELS = Object.fromEntries(
  Object.values(COLORS).map((color) => [
    color,
    color
      .slice(1)
      .match(/[\da-f]{2}/gi)
      ?.map((channel) => parseInt(channel, 16))
      .join(', '),
  ]),
);

/** Return RGB channels for canvas and CSS colors with a variable opacity. */
export const getColorRgb = (color: string): string => {
  const cachedChannels = COLOR_CHANNELS[color];
  if (cachedChannels) {
    return cachedChannels;
  }

  const channels = color.match(/[\da-f]{2}/gi);
  if (!channels || channels.length !== 3) {
    throw new Error(`Expected a six-digit hex color: ${color}`);
  }
  return channels.map((channel) => parseInt(channel, 16)).join(', ');
};

export const withOpacity = (color: string, opacity: number): string =>
  `rgba(${getColorRgb(color)}, ${opacity})`;
