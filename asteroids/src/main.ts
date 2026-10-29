import './styles.css';

import { getGameDom, mountGraphicsCatalogLink } from './dom';
import { createGame } from './game';

const dom = getGameDom();
if (import.meta.env.DEV) {
  mountGraphicsCatalogLink(dom);
}
createGame(dom).mount();
