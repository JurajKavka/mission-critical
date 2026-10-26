# Agent Instructions

These instructions apply to the entire repository.

## Design

- Follow [DESIGN.md](./DESIGN.md) when creating or changing game visuals, interface components, motion, sound cues, responsive behavior, or player-facing copy.
- Preserve the shared Mission Critical design language while allowing each game to develop its own gameplay-specific identity.

## Code style

- Write TypeScript using a functional style.
- Prefer arrow functions assigned to `const`.
- Do not introduce classes when functions, closures, or plain objects are sufficient.
- Use descriptive names. Avoid vague names such as `type` when a domain-specific name such as `pickupType` is clearer.
- Use single quotes in TypeScript and JavaScript. Keep Prettier configured with `singleQuote: true`.
- Always use curly braces for `if`, `else`, `for`, `while`, and similar control-flow statements, including one-line bodies.
- Do not use nested ternary expressions. Extract conditional selection into a clearly named function and use explicit `if / else if / else` returns.
- Extract calculations or mappings into focused functions when doing so gives the operation a meaningful domain name, such as `getAsteroidRadius`, `getPickupType`, or `getPickupDetails`.
- Keep functions small and centered on one responsibility.

## Architecture

- Keep source code modular even when the production build must be a single file.
- Separate state, rendering, entity behavior, effects, geometry, DOM access, sound, and application bootstrapping.
- Keep shared runtime dependencies, including the canvas and rendering context, in `GameState` when they are part of the game runtime.
- Pass state explicitly to stateless helpers instead of hiding dependencies in classes or module-level mutable variables.
- Use closure-based factories when private mutable state is required.
- Define explicit domain types for entities, state, and function results.

## Conditional logic

Prefer this:

```ts
export const getValue = (kind: Kind): Value => {
  if (kind === "first") {
    return firstValue;
  } else if (kind === "second") {
    return secondValue;
  } else {
    return fallbackValue;
  }
};
```

Do not write deeply nested ternaries or unbraced control flow.

## Verification

- Preserve strict TypeScript checking.
- Run TypeScript, ESLint, and Prettier checks after changes.
- Keep ESLint's `curly: ['error', 'all']` rule enabled.
- Verify that the Asteroids production build still emits one self-contained `dist/index.html` with inline JavaScript and CSS.
