import './styles.css';

import { getGameDom } from './dom';
import { createGame } from './game';

createGame(getGameDom()).mount();
