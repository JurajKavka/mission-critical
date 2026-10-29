# Neon Asteroids

A TypeScript/Vite port of the Mission Critical Asteroids game.

## Source layout

- `game.ts` exposes a functional game controller and coordinates each simulation phase.
- `renderer.ts` contains stateless canvas rendering functions.
- `entities.ts`, `effects.ts`, and `geometry.ts` contain reusable game-domain behavior.
- `state.ts` and `types.ts` define runtime state, including the canvas and rendering context.
- `dom.ts`, `hud.ts`, and `sound.ts` isolate browser integrations.
- `main.ts` is the application bootstrap.

## Development

```sh
npm install
npm run dev
```

Development mode adds a **Graphics catalog** link to the game's start screen.
The link and catalog are not included in the production build. Tune their
shared colors and rendering values in `src/graphics-config.ts`; both the
catalog and game use that source file.

## Production build

```sh
npm run build
```

The build produces `dist/index.html`. CSS and JavaScript are inlined, so that file can be opened or distributed on its own.
