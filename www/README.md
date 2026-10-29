# Mission Critical website

Static Astro catalog for the games in this repository.

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

The catalog is served from the domain root. Set the `SITE_URL` build variable
to the public site URL to generate absolute social-image URLs.

## Adding a game

Add the game's metadata to `src/data/games.ts`, using an ID that matches its
sibling package directory, then extend `prepare:games` to build it. The dynamic
game page reads each self-contained `dist/index.html` and emits it at
`games/<game-id>/index.html`, giving development and production the same clean
`/games/<game-id>/` URL.

## Publishing

The production build emits the static site to `www/dist`. The GitHub Actions
workflow validates both the catalog and Neon Asteroids but does not publish the
website.
