# Atlas Rush

Identify the countries of Africa against the clock. Start a round, enter the English name of each highlighted country, or skip to return to it later. The timer duration is `ROUND_SECONDS` in `src/regions.ts`. The region data is separate from the game so more regions can be added later.

Country boundaries are derived from the public-domain [Natural Earth 1:110m dataset](https://www.naturalearthdata.com/) via [world.geo.json](https://github.com/johan/world.geo.json). Cabo Verde, Comoros, Mauritius, São Tomé and Príncipe, and Seychelles are shown as location markers because they are too small for that dataset.

Run `npm install` and `npm run dev` for development. Hover over a country to see its name. The start screen includes a development-only **Graphics catalog** link to `/graphics/`; the catalog uses the same map, timer, and results components as the game. Country hover labels are omitted from production, but names remain in the client for answer checking. `npm run check` runs lint, formatting, TypeScript, and production builds. The standalone production files are `dist/index.html` and `dist/graphics/index.html`. The website also serves them at `/games/atlas-rush/` and `/games/atlas-rush/graphics/`.
