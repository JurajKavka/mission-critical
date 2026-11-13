# Mission Critical Design Manual

This manual defines the shared visual and interaction language for Mission Critical games. It is extracted from Neon Asteroids and should guide future games without forcing them to copy its exact layout.

## Design principles

### Dark space, bright information

The playfield should feel almost black. Important information appears as crisp cyan, white, violet, magenta, amber, or red light against that darkness. Avoid large bright surfaces.

### Instrument panel, not a conventional website

Interfaces should resemble spacecraft telemetry: compact labels, monospaced numerals, thin borders, restrained panels, and immediate status feedback. Avoid rounded consumer-app cards, large navigation bars, and decorative web layouts.

### Gameplay remains dominant

The canvas occupies the full viewport. Persistent interface elements sit around its edges and do not intercept pointer events. Modal panels are reserved for starts, endings, upgrades, and other genuine pauses.

### Effects communicate state

Color, particles, trails, screen shake, short transitions, and synthesized tones must indicate gameplay events. Effects should clarify hits, danger, rewards, cooldowns, and progression rather than exist as ambient decoration.

## Color system

### Foundation

| Role           | Value     | Use                                   |
| -------------- | --------- | ------------------------------------- |
| Background     | `#02040b` | Page and playfield background         |
| Surface        | `#050b19` | Panels, inputs, background gradients  |
| Raised surface | `#0b1830` | Prominent panels and gradient centers |
| Primary text   | `#f4feff` | Titles, values, projectile cores      |
| Secondary text | `#9db5c8` | Supporting copy and instructions      |
| Muted text     | `#8099ae` | Labels and low-priority information   |

Use the three dark colors for surfaces and the canvas gradient. Tint surfaces with translucent signal colors where needed.

### Signal colors

| Signal  | Value     | Meaning                                  |
| ------- | --------- | ---------------------------------------- |
| Cyan    | `#69fbff` | Player, focus, shields, primary actions  |
| Violet  | `#a176ff` | Asteroids, hyperspace, secondary systems |
| Magenta | `#ff65dc` | Combos, bonuses, special weapons         |
| Amber   | `#ffd35d` | Rewards, rapid fire, targets             |
| Red     | `#ff3b35` | Hostile fire, damage, errors             |
| Green   | `#8eff94` | Extra lives, recovery, success           |

Use one primary signal and at most one supporting signal per element. Reserve red for danger and green for recovery. Use primary text for bright effect cores. New colors need a distinct design purpose.

### Transparency

Use opacity to adapt the palette to its context. Prefer approximately 6% for grids and glow, 16% for fills, 35% for borders and hover fills, 60% for stronger outlines, 85% for overlays, and 96% for readable panel surfaces. Effects may animate opacity continuously. Adjust opacity where needed for legibility and contrast.

## Typography

Use the native monospaced stack:

```css
ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace
```

### Type roles

| Role          | Size                     | Weight | Tracking      | Treatment |
| ------------- | ------------------------ | ------ | ------------- | --------- |
| Display title | `clamp(43px, 8vw, 72px)` | 900    | `-0.065em`    | Uppercase |
| Panel heading | `28px`                   | 700+   | `0.05em`      | Uppercase |
| HUD value     | `20px`                   | 700+   | `0.03em`      | Numeric   |
| Brand         | `12px`                   | 900    | `0.32em`      | Uppercase |
| Action        | `12px`                   | 800    | `0.24em`      | Uppercase |
| HUD label     | `10px`                   | 500+   | `0.18em`      | Uppercase |
| Eyebrow       | `10px`                   | 500+   | `0.42em`      | Uppercase |
| Hint          | `9–10px`                 | 500    | `0.11–0.13em` | Uppercase |

Use wide tracking for labels and compact tracking for values. Display titles may use tight negative tracking to create a dense arcade wordmark.

## Spatial system

Use a compact spacing vocabulary derived from the existing interface:

- `4–6px`: relationship between a label and its value or meter.
- `8–9px`: tightly grouped status elements.
- `13–18px`: control padding and component gaps.
- `22–24px`: viewport HUD inset and major horizontal gaps.
- `30–32px`: modal shell and panel padding.
- `43px`: spacious hero-card padding.

The default viewport inset is `22px`. Keep HUD elements aligned to this shared edge.

## Layout

### Playfield

- Fill the viewport with the canvas.
- Hide document overflow.
- Cap the canvas pixel ratio at `2` to balance sharpness and performance.
- Use a crosshair cursor when pointer aiming or firing is supported.

### HUD

- Place identity at the upper left and numeric telemetry at the upper right.
- Place reserves or health at the lower left.
- Place control hints at the lower right.
- Place temporary bonuses at the lower center.
- Set the HUD container to `pointer-events: none` so it cannot interfere with play.
- Display labels above or beside larger numeric values.

### Modal overlays

- Center modal content with CSS Grid.
- Dim the playfield using a dark translucent or radial veil.
- Use opacity transitions around `200–240ms`.
- Hidden overlays must also disable visibility and pointer events.
- Keep primary start/end cards near `540px` wide and selection panels near `820px` wide.

### Responsive behavior

- Allow primary cards to occupy no more than `92vw`.
- Allow wide panels to occupy no more than `94vw`.
- Collapse three-column selections to one column at `700px` or below.
- Remove fixed card heights when options stack vertically.
- Preserve the canvas as the visual background at every viewport size.

## Components

### Brand label

Use cyan, heavy weight, uppercase text, and very wide tracking. A separator such as `//` reinforces the telemetry language.

### Telemetry value

Use a muted uppercase label with a larger near-white value beneath it. Values should have stable widths where practical by padding numbers with leading zeroes.

### Meter

Meters are thin horizontal tracks, usually `2px` high. Use a low-opacity neutral track and a cyan-to-magenta fill for escalating performance such as a combo.

### Primary button

- Use a `1px` cyan border.
- Use a translucent deep-cyan background.
- Use near-white uppercase monospaced text.
- Use a minimum width around `190px`.
- On hover, brighten the background without moving the button.
- On keyboard focus, show a single thicker cyan border rather than a separate outline. Keep the button's size and position stable.
- Do not use rounded corners unless a game's fiction explicitly requires them.

### Text input

- Use a thin, subdued border and a dark background.
- On hover or focus, show a single thicker cyan border without changing the input's size or position.
- Keep focus clearly visible for both keyboard and pointer interaction; avoid a separate outline that creates a double border.

### Upgrade option

Present upgrade choices as equal-width interactive panels with:

- A large cyan symbolic icon.
- A compact uppercase name.
- A muted sentence-case description.
- Left-aligned contents inside the otherwise centered modal.

### Status chip

Use a dark translucent violet background, a faint magenta border, magenta text, and uppercase tracking. Reveal it by combining a short fade with an `8px` upward translation.

### Hero card

The main card uses clipped opposing corners rather than border radius. Build the border from a translucent cyan outer shape and a one-pixel inset dark gradient layer.

## Canvas rendering

### Line language

- Use `1px` lines for ambient grids, shields, and minor detail.
- Use `1.5–2px` lines for player ships, asteroids, pickups, and UFO bodies.
- Use thicker lines only for energy trails and hostile projectiles.
- Prefer stroked silhouettes with translucent fills over solid sprites.

### Entity identity

- Player: cyan outline with a faint cyan interior.
- Large and medium asteroids: violet outlines and translucent violet interiors.
- Small asteroids: magenta to signal increased speed and danger.
- UFO: magenta body with amber canopy and energy lights.
- Shield: animated cyan ring.
- Pickups: rotating hexagonal containers with a short centered label.

### Projectiles and particles

- Standard player shots are compact pale-cyan points.
- Rapid-fire shots use an amber/orange trail with a pale core.
- Hostile shots use a red trail with an amber-white tip.
- Render luminous projectiles and particles with `globalCompositeOperation = 'lighter'`.
- Restore `source-over` before drawing opaque interface elements.

### Motion

- Keep gameplay motion immediate and physics-driven.
- Use screen shake for impact hierarchy: subtle for rapid fire, moderate for asteroid breaks, strong for UFO and player destruction.
- Use short particle lifetimes for thrust and hits; longer bursts may accompany destruction.
- Use pulsing opacity for shields, pickups, and UFO lights.
- Keep interface transitions under `250ms`.

## Sound language

Use short synthesized Web Audio tones rather than external sound assets when practical:

- Square waves: weapon fire and sharp impacts.
- Triangle waves: upgrades, shields, wave starts, and positive system feedback.
- Sawtooth waves: destruction, danger, and failure.
- Descending frequency ramps: impacts and failure.
- Ascending frequency ramps: upgrades, collection, and progression.

Sound effects should be quiet by default and triggered only after a user gesture enables audio.

## Writing style

- Use concise mission language: `Launch`, `Wave clear`, `Hostile UFO detected`.
- Prefer operational nouns: `reserve ships`, `vector engines`, `weapon capacitors`.
- Keep HUD labels short and uppercase.
- Use sentence case for descriptive copy.
- Describe controls with symbols or keys first, followed by the action.

## Accessibility and usability

- Do not rely on color alone; combine color with shape, position, labels, motion, or sound.
- Maintain readable contrast for all persistent text.
- Give the canvas an accessible label.
- Use semantic buttons for interactive controls.
- Prevent gameplay keys from scrolling the page.
- Ensure paused overlays receive pointer input while the HUD does not.
- Keep critical information away from viewport edges using the standard inset.

## New-game checklist

- The canvas fills the viewport and remains the visual focus.
- The background uses the shared deep-space foundation.
- The interface uses the monospaced type system and telemetry hierarchy.
- Cyan identifies the player or primary action.
- Danger, rewards, and recovery use consistent signal colors.
- HUD elements align to a common viewport inset.
- Panels use thin borders, translucent dark fills, and no casual rounded corners.
- Effects communicate gameplay state instead of adding visual noise.
- Controls work with keyboard and any pointer interaction the game advertises.
- Narrow screens retain readable controls and selection panels.
- Source remains modular.

### Palette in code

The shared palette lives in [`src/styles/colors.json`](./src/styles/colors.json).
Use its twelve foundation and signal colors throughout the interface and game
rendering. Apply opacity where needed instead of adding similar shades.

- In Astro and CSS, use `var(--color-cyan)` for a color or
  `rgba(var(--color-cyan-rgb), 0.2)` for a translucent version. The generated
  stylesheet is loaded by the site, game pages, graphics catalogs and Storybook.
- In styled-components, import `theme` from
  `src/react-component-library/theme.ts` and use its named colors, including
  translucent colors. In other TypeScript, import `COLORS` from
  `src/styles/colors.ts`; use `withOpacity(COLORS.cyan, 0.2)` when an actual
  color string is needed, such as for canvas rendering.
- After changing the palette, run `node scripts/generate-colors.mjs` and commit
  the resulting `src/styles/colors.css` alongside the JSON. Do not edit the
  generated stylesheet directly.
