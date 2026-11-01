# Mission Critical

A collection of neon arcade games built with Astro. See the [design manual](./DESIGN.md) for the shared visual and interaction language and the source notes for [Neon Asteroids](./src/games/asteroids/README.md) and [Atlas Rush](./src/games/atlas-rush/README.md).

Install dependencies with `npm ci`, then run commands from the repository root:

| Command           | Purpose                                              |
| ----------------- | ---------------------------------------------------- |
| `npm run clean`   | Remove root dependency, build, and cache directories |
| `npm run dev`     | Start the website and games locally                  |
| `npm run check`   | Run ESLint, Prettier, and Astro/TypeScript checks    |
| `npm run build`   | Build the static website into `dist/`                |
| `npm run preview` | Serve the production build                           |

After cleaning, run `npm ci` to reinstall dependencies.

Game routes live in `src/pages/games/`; game logic and styles live in `src/games/`. Astro pages can import shared components from `src/components/`. Add new games to `src/data/games.ts` and create their routes under `src/pages/games/`.

The graphics catalogs are available at `/games/asteroids/graphics/` and `/games/atlas-rush/graphics/`. Set `SITE_URL` to the public site URL to generate absolute social-image URLs.

For Cloudflare, use the repository root as the root directory, `npm run build` as the build command, and `dist` as the build output directory.
