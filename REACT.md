# React and Zustand Agent Instructions

These instructions apply when implementing or modifying React components, hooks, or Zustand stores in this repository. They extend [AGENTS.md](./AGENTS.md) and [DESIGN.md](./DESIGN.md). Follow the root instructions when they are stricter.

## Components and types

- Use functional React components as arrow functions assigned to `const`, explicitly typed as `React.FC<ComponentNameProps>`; avoid class components.
- Prefer named exports over default exports for application components and hooks, unless a framework API requires a default export.
- Put JSX in `.tsx` files and non-JSX logic in `.ts` files.
- Define component props with a **type alias**, never an interface. Name it by appending `Props` to the exact component name: `MyComponent` → `MyComponentProps`.
- Keep components focused and use composition. Extract child components or custom hooks when doing so provides a clear responsibility; avoid needless abstractions.
- Prefer explicit, readable prop definitions and preserve strict TypeScript checking; avoid `any` and unnecessary type assertions.

```tsx
import type * as React from 'react';

type GameControlsProps = {
  isDisabled: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const GameControls: React.FC<GameControlsProps> = ({
  isDisabled,
  onCancel,
  onConfirm,
}) => (
  <div>
    <button type="button" onClick={onCancel}>
      Cancel
    </button>
    <button type="button" disabled={isDisabled} onClick={onConfirm}>
      Confirm
    </button>
  </div>
);
```

## Callback and handler names

- Name callback props with the **`on` prefix**, such as `onCancel`, `onLogout`, or `onCancelButtonClick`.
- Name **internal event handlers that perform meaningful logic** with the **`handle` prefix**, such as `handleLogout` or `handleCancelButtonClick`.
- A more specific name like `onCancelButtonClick` / `handleCancelButtonClick` is welcome when several controls or distinct events exist in a component.
- **Pass callback references directly** to child props or DOM event props when no transformation or extra work is needed. Do not create forwarding-only arrow functions, handlers, or `useCallback` wrappers.
- Introduce `handle...` only for actual work, such as validation, state changes, side effects, event handling, or adapting arguments.
- Preserve meaningful domain action names (`submitGuess`, `pauseGame`) rather than renaming domain operations to `handle...`.

```tsx
import type * as React from 'react';

type ConfirmButtonProps = {
  onConfirm: () => void;
};

export const ConfirmButton: React.FC<ConfirmButtonProps> = ({ onConfirm }) => (
  <button type="button" onClick={onConfirm}>
    Confirm
  </button>
);

// An internal handler is useful here because it performs validation.
const handleConfirmButtonClick = () => {
  if (!isValid) {
    setError('Invalid configuration');
    return;
  }

  onConfirm();
};
```

## State ownership and Zustand

- Use Zustand for **shared gameplay state** and React `useState` for transient UI state that only one component or small subtree needs.
- Do not duplicate the same source of truth between local state, Zustand, URL configuration, or IndexedDB.
- Keep game rules and domain transitions as pure TypeScript functions independent of React, Zustand, browser APIs, and persistence.
- Change gameplay state through named store actions; do not mutate the store's state directly from components.
- Use selective store subscriptions (`useGameStore(selectCurrentCountry)`, for example), rather than subscribing to the entire state tree.
- Prefer simple primitive selectors. When selecting multiple fields into an object or array, keep references stable and use Zustand's `useShallow` where appropriate.
- Keep derived values derived, not synchronized into redundant state through effects.
- Do not put high-frequency input text or every timer frame into global gameplay state unless multiple consumers genuinely need it.
- Name custom React hooks with `use...`, Zustand store hooks with `use...Store`, and selectors descriptively (for example, `selectCurrentCountry`).
- Use positive, descriptive names for booleans (for example, `isPaused`, `hasError`).

## Hooks, effects, and rendering

- Follow the Rules of Hooks; do not call hooks conditionally or inside loops/callbacks.
- Keep rendering pure. Do not perform persistence writes, timer setup, navigation, or other side effects during render.
- Use `useEffect` for synchronization with external systems, not for values that can be calculated during rendering or an event/action.
- Always clean up timers, listeners and subscriptions.
- Use `useMemo`, `useCallback` and `React.memo` when they solve a real rendering or referential-stability concern, not as default boilerplate.
- Prefer declarative React rendering. Do not manually edit React-owned DOM elements.
- Use stable domain IDs as keys in dynamic lists; avoid indexes for reorderable collections.
- Prevent unrelated timer/input updates from rebuilding expensive SVG geography.

## Astro boundaries

- Astro owns routes, page metadata, static content and SEO; the React game island owns its interactive UI.
- Pass initial route/configuration data into React through typed props; do not add React Router.
- Avoid reading `window`, `document`, or IndexedDB during server rendering. Use client-safe initialization or effects and avoid hydration mismatches.
- Isolate browser integrations, persistence and URL parsing from React presentation and pure domain logic.

## Styling

- Do **not** use Tailwind.
- Prefer **CSS Modules** (`Component.module.css`) for component-scoped styles, with shared CSS custom properties for colors, typography and spacing.
- Preserve the Mission Critical visual identity from `DESIGN.md` and reuse existing shared design tokens/styles when practical.
- Prefer CSS class names for UI states; use inline styles only for genuinely dynamic values.
- Avoid introducing CSS-in-JS runtime dependencies (including styled-components) for new React code. Do not rewrite unrelated existing styles merely to adopt CSS Modules.
- Follow the root instruction not to use `!important`.

## Accessibility and testing

- Use semantic buttons, form controls, accessible labels and visible focus indicators.
- Keep keyboard and touch interactions usable; handle dialog focus and announce important status updates when appropriate.
- Test pure domain rules independently of React. Test component behavior with React Testing Library, store actions with unit tests, and complete mobile/desktop flows with Playwright where practical.
- Prefer tests of user-visible behavior over tests coupled to component implementation details.
- Maintain strict TypeScript checks and the repository's lint/format conventions, including the React Hooks lint rules when configuring React tooling.
