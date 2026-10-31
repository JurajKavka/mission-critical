import './styles.css';
import './catalog.css';
import {
  createMap,
  createResults,
  createTimer,
  updateMap,
  updateTimer,
} from './components';
import { africa } from './regions';

const map = createMap(africa);
updateMap(map, 'DZA', new Set(['NGA', 'ZAF', 'KEN']));
document.querySelector('#catalog-map')!.append(map);
const timer = createTimer();
updateTimer(timer, 163);
document.querySelector('#catalog-timer')!.append(timer);
document.querySelector('#catalog-results')!.append(
  createResults({
    total: africa.countries.length,
    guessed: 37,
    elapsedSeconds: 300,
    completed: false,
  }),
);
