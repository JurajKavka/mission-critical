# Mission Critical website

Static Astro catalog for the games in this repository. The production build is
published at <https://jurajkavka.github.io/mission-critical/>.

## Commands

Run these from `www/` after installing dependencies in both `www/` and
`asteroids/`:

| Command           | Purpose                                     |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Build the games, then start Astro locally   |
| `npm run lint`    | Lint TypeScript and Astro source            |
| `npm run format`  | Format the website source                   |
| `npm run check`   | Run lint, formatting, and Astro diagnostics |
| `npm run build`   | Build the games and complete static catalog |
| `npm run preview` | Serve the complete production bundle        |

The catalog is configured with the `/mission-critical` base path used by a
GitHub Pages project site. Development stays on `/`; the production build and
preview use the repository subpath.

## Adding a game

Add the game's metadata to `src/data/games.ts`, using an ID that matches its
sibling package directory, then extend `prepare:games` to build it. The dynamic
game page reads each self-contained `dist/index.html` and emits it at
`games/<game-id>/index.html`, giving development and production the same clean
`/games/<game-id>/` URL.

## Publishing

The Pages workflow builds the Astro catalog and Neon Asteroids, validates both,
and uploads `www/dist`. In GitHub, set **Settings → Pages → Build and
deployment → Source** to **GitHub Actions**. Pushes to `main` then deploy the
site automatically.
