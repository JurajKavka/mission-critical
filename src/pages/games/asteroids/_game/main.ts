import './styles.css';

import {
  getGameDom,
  mountGraphicsCatalogLink,
  showMissionEndedMessage,
} from './dom';
import { createGame } from './game';

const dom = getGameDom();
if (import.meta.env.DEV) {
  const developmentPreview = new URLSearchParams(location.search).get(
    'preview',
  );
  if (developmentPreview === 'mission-ended') {
    showMissionEndedMessage(dom, 128400);
  } else {
    mountGraphicsCatalogLink(dom);
  }
}
createGame(dom).mount();
