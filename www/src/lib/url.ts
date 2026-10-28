const getBaseUrl = (): string => import.meta.env.BASE_URL.replace(/\/+$/, '');

export const asset = (path: string): string =>
  `${getBaseUrl()}/${path.replace(/^\/+/, '')}`;

export const home = (): string => `${getBaseUrl()}/`;

export const getGameUrl = (gameId: string): string => asset(`games/${gameId}/`);
