# Atlas Rush

Identify countries and US states against the clock. The [settings page](/games/atlas-rush/) starts one of five playable region routes: `/games/atlas-rush/africa/`, `/asia/`, `/europe/`, `/south-america/` and `/usa/` under that base path. Each round's time is the selected difficulty's seconds per target multiplied by the region's target count; configure levels in [`domain/levels.ts`](../../../../games/atlas-rush/domain/levels.ts).

Atlas Rush uses a pure TypeScript domain, per-game Zustand store and React island under `src/games/atlas-rush/`; the geography modules in this directory remain the source of SVG paths. Challenge URLs encode difficulty, learning mode, answer comparison and seed, not progress. A valid unfinished IndexedDB save offers Continue or Start new; if storage is unavailable the game continues in memory. Refresh or closing the page restores the last successfully saved time checkpoint, so the most recent unsaved time or progress may be lost. The mobile on-screen keyboard is available on compact coarse-pointer layouts, with a native keyboard option.

Correct full names and aliases submit automatically as you type. Enable **Speed mode** on the settings page to complete and submit after the first matching letters. New surveys use `DEFAULT_PREFIX_LENGTH` (currently four) in [`domain/answer-comparison.ts`](../../../../games/atlas-rush/domain/answer-comparison.ts); the letter count has no input setting. Prefix matches briefly disable typing while the remaining characters appear, then submit and restore focus for the next answer. Matching ignores case, spacing, punctuation and accents, and checks every accepted alternate name for the highlighted target. Shorter names and aliases are accepted in full. Enter checks an answer manually; there is no Identify button. A link with `?speed=4` enables four-letter matching; omitting `speed` requires full names. Each prefix length has separate saved progress, while existing full-name saves remain compatible.

Run `npm run test` for unit tests and `npm run test:e2e` for browser tests; install the browser once with `npx playwright install chromium`. The graphics catalog remains at `/games/atlas-rush/graphics/`. See the [architecture and handoff](../../../../../docs/atlas-rush-migration.md) for the URL, persistence, hosting and validation details.

Country boundaries are derived from the public-domain [Natural Earth 1:110m dataset](https://www.naturalearthdata.com/) via [world.geo.json](https://github.com/johan/world.geo.json). Cabo Verde, Comoros, Mauritius, São Tomé and Príncipe, and Seychelles are shown as location markers because they are too small for that dataset.

US state boundaries are derived from [PublicaMundi's GeoJSON dataset](https://github.com/PublicaMundi/MappingAPI/blob/master/data/geojson/us-states.json). Alaska and Hawaii are shown as inset maps.

European boundaries are derived from the public-domain [Natural Earth 1:50m dataset](https://www.naturalearthdata.com/). The map includes Cyprus, Kosovo, Turkey and a cropped portion of Russia. Andorra, Liechtenstein, Malta, Monaco, San Marino and Vatican City are shown as location markers.

The Asia map also includes Oceania. Its boundaries use Natural Earth 1:110m data, with markers for Bahrain, Maldives, Singapore and the smallest Pacific island countries.
