# Mission Critical

A collection of neon arcade games built with Astro. See the [design manual](./DESIGN.md) for the shared visual and interaction language and the source notes for [Neon Asteroids](./src/games/asteroids/README.md) and [Atlas Rush](./src/pages/games/atlas-rush/_game/README.md).

Shared React components live in `src/react-component-library/` and are imported through its `index.ts`. Run `npm run storybook` to explore the library, or `npm run build-storybook` to generate a static catalog. Add `*.stories.tsx` files beside components in that folder; Storybook discovers stories only there. Game-specific React components remain with their games.

Install dependencies with `npm ci`, then run commands from the repository root:

| Command            | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| `npm run clean`    | Remove root dependency, build, and cache directories |
| `npm run dev`      | Start the website and games locally                  |
| `npm run check`    | Run ESLint, Prettier, and Astro/TypeScript checks    |
| `npm run test`     | Run the Vitest unit suite once without watching      |
| `npm run test:e2e` | Run the Playwright browser suite once                |
| `npm run build`    | Build the static website into `dist/`                |
| `npm run preview`  | Serve the production build                           |

After cleaning, run `npm ci` to reinstall dependencies. Install the Playwright browser once with `npx playwright install chromium`. The browser suite starts its own local server; Chromium must be allowed to launch in the execution environment.

Game routes live in `src/pages/games/`. Atlas Rush uses a static settings page and React game islands at `/games/atlas-rush/{region}/`; its domain, state, components and infrastructure live in `src/games/atlas-rush/`, while the original geography paths remain under its `_game/` directory. Astro pages can import shared components from `src/components/`. Add new games to `src/data/games.ts` and create their routes under `src/pages/games/`.

The graphics catalogs are available at `/games/asteroids/graphics/` and `/games/atlas-rush/graphics/`. Set `SITE_URL` to the public site URL when building to generate absolute canonical and social-image URLs.

For Cloudflare, use the repository root as the root directory, `npm run build` as the build command, and `dist` as the build output directory.
