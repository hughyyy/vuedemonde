# dependencies.md

Vue de monde's dependency register — every third-party package the library ships
code against, and why. Anything new must be named here (module + version) with
its justification before it lands.

## Runtime

| package | version | role | justification |
|---|---|---|---|
| `vue` | `^3.5.0` (peer) | component runtime | The library is a Vue 3 component set; Vue is the host app's dependency, declared as a peer so we never ship a second copy. Nothing above the standard Composition API + `<script setup>` is used. |

There is **no UI-library dependency by standing decision** — every component is
a hand-authored SFC on the CSS custom-property tokens in `theme.css`. This is
the point of the project: ~100 primitives with zero third-party styling deps.

Charts are inline SVG computed in the SFCs (`charts/shared.ts` has the palette +
scaling helpers) — no chart library. The icon set is ~29 hand-authored inline
SVG strokes (`src/kit/icons.ts`) — no icon package.

## Build & dev (all devDependencies)

| package | version | role |
|---|---|---|
| `vite` | `^7.0.0` | library + playground builds |
| `@vitejs/plugin-vue` | `^6.0.0` | SFC compile |
| `typescript` | `^5.8.0` | type checking |
| `vue-tsc` | `^3.0.0` | vue-aware typecheck + declaration emit |
| `vitest` | `^5.0.1` | unit tests |
| `@vue/test-utils` | `^2.5.1` | component mounting in tests |
| `happy-dom` | `^20.14.5` | DOM environment for tests |
| `playwright` | `^1.64.1` | headless Chromium screenshots for the release renderer (`scripts/render-release.mjs`) — dev-time only, never a runtime dep |

No browser-only or OS-level integrations.
