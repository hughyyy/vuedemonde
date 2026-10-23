# GitHub Pages demo site — feasibility investigation

**Status: investigated, not implemented.** Every claim below was verified
against this repo on 2026-10-23 (build output, a real browser against the built
site served under a `/vuedemonde/` subpath, and the GitHub API). Nothing has
been deployed.

Related: `docs/release-rendering.md`, `docs/per-component-rendering.md`,
`docs/theme-builder.md`, `playground/src/App.vue` (routes).

---

## Verdict

**Feasible, low-risk, and mostly already built.** The playground is a
client-side-only Vue app with no router, no server calls and no data fetching;
`npm run build:demo` already produces a complete static site. Publishing it to
GitHub Pages is a workflow file plus one config line. The theme builder works
there unchanged, **including shareable theme links**.

Effort: roughly half a day for the core site, including the workflow; the
per-component catalogue images (`docs/per-component-rendering.md`) are a
separate, larger piece of work.

---

## 1. What already works (verified)

| Question | Result | Evidence |
| --- | --- | --- |
| Static build exists? | Yes — `dist-demo/` | `npm run build:demo` → 353 KB JS (110 KB gzip) + 156 KB CSS (24 KB gzip), 528 KB total on disk |
| Runs on a subpath (`/vuedemonde/`)? | Yes | Built with `--base=/vuedemonde/`; served from a `/vuedemonde/` directory; HTTP 200, assets resolve |
| App renders there? | Yes | Headless Chromium: title correct, **9 sections, 55 cards, zero console errors** |
| Print routes survive? | Yes | `?print=family&id=primitives&theme=mint` → theme `mint`, 8 cards; `?print=banner` → 24 cards |
| Theme builder loads? | Yes | `?build` → 13 anchor controls, zero console errors |
| Builder share links? | Yes | A constructed `?build#spec=<base64>` link decodes back to `id: "ocean"` |
| Theme persistence? | Yes | `localStorage["vuedemonde-theme"]` restores across reload |
| Any server/API dependency? | **No** | No `fetch()` anywhere in `playground/src` or `src/` |
| Any path-based routing? | **No** | Routes are query-string (`?print=`, `?build`) + hash (`#spec=`); no history API pushState |

The no-router fact is the important one: it means **no `404.html` fallback
trick is needed**, which is normally the main pain point with SPA hosting on
Pages.

## 2. The only real config change: `base`

Vite's default `base` is `/`, which produces `/assets/…` and breaks on a
project page (`https://<user>.github.io/vuedemonde/`). Verified:

```
npx vite build --config vite.demo.config.ts --base=/vuedemonde/
→ <script src="/vuedemonde/assets/index-*.js">
```

Two clean ways to set it:

- **(recommended)** `base: process.env.DEMO_BASE ?? "/"` in
  `vite.demo.config.ts`, with the workflow exporting `DEMO_BASE=/vuedemonde/`.
  Keeps `npm run dev` and the local `dist-demo` behaviour untouched.
  **Verified experimentally** (then reverted): with the env var unset the build
  emits `/assets/…` exactly as today; with `DEMO_BASE=/vuedemonde/` it emits
  `/vuedemonde/assets/…`, same hashes and sizes, so both render harnesses are
  unaffected.
- or hardcode `base: "./"` — relative asset URLs work at any depth, but the
  print routes use absolute query strings so nothing else is affected. Slightly
  less explicit about intent.

**Note:** `scripts/render-release.mjs` and `scripts/visual-regression.mjs`
build the demo themselves via `npx vite build --config vite.demo.config.ts`
with no `--base`, and serve it at the domain root. Defaulting `DEMO_BASE` to
`/` keeps both harnesses working with no edits.

## 3. Proposed workflow

`.github/workflows/pages.yml`, on push to `main` (plus manual dispatch):

```yaml
name: Deploy demo to GitHub Pages
on:
  push: { branches: [main] }
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with: { node-version: 22, cache: npm }   # vite 7 needs ^20.19 || >=22.12
      - run: npm ci
      - run: npm run build:demo
        env: { DEMO_BASE: /vuedemonde/ }
      - uses: actions/configure-pages@v6
      - uses: actions/upload-pages-artifact@v5
        with: { path: dist-demo }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

Action versions checked against the GitHub API today: `checkout@v7.0.1`,
`setup-node@v7.1.0`, `configure-pages@v6.0.0`, `upload-pages-artifact@v5.0.0`,
`deploy-pages@v5.0.1`. Node 22 satisfies `vite@7.3.6`'s
`^20.19.0 || >=22.12.0` engine constraint.

Repo state supporting this: `hughyyy/vuedemonde` is **public**, default branch
`main`, and has **no Pages site configured yet** (`GET /repos/.../pages` →
404), so the first deploy will create it under the `github-pages` environment.

## 4. Demo-site UX shape

The current playground is a single scrolling page with a sticky sidebar of 9
family anchors (`App.vue`), plus `?build` and the print routes. For a public
demo the useful additions are, in priority order:

1. **Deep links per component** — `?component=<id>` scrolling to (or filtering
   to) one demo card, so the README can link "see it live" next to each image.
   This pairs directly with the per-component registry proposed in
   `docs/per-component-rendering.md`; building that registry once serves both.
2. **Keep the theme-builder entry point prominent** — the sidebar already has
   a "Theme builder →" link (`App.vue`, `pg-nav-item--tool`), so this is
   already satisfied; on a public site it deserves a line in the README and the
   page intro too.
3. **A "try every theme" control** on the page — already present via
   `ThemeBar.vue` (select + accent), so this is just making it obvious.
4. Open Graph/Twitter meta + a favicon in `playground/index.html`; currently
   only `<title>` is set.

None of these block the first deploy.

## 5. Risks and their mitigations

| Risk | Assessment | Mitigation |
| --- | --- | --- |
| **`base` path breaks assets** | Verified it does not when set correctly | `DEMO_BASE` env var; smoke-test the built site under `/vuedemonde/` in CI (a `curl` + grep for the app root, or a Playwright check) |
| **Teleported overlays** under a subpath | No issue — teleport targets `body`, unaffected by `base` | none needed |
| **Remote images** (`picsum.photos` in `LayoutSection.vue:44`) | Reaches the network; returns 302 today | Fine for a live demo. Not a Pages-hosted asset, so rate limits/outages only affect the MediaGallery demo. Optional: vendor 8 small local images into `playground/public/` for a fully self-contained site |
| **Bundle size** (353 KB JS / 110 KB gzip, 24 KB gzip CSS) | Acceptable for a component demo | optional `build.rollupOptions` code-split by section if it grows |
| **Pages must be enabled once** | Repo has none configured | Repo Settings → Pages → Source: **GitHub Actions** (one-time, human step). Or `gh api -X POST repos/.../pages -f build_type=workflow` |
| **Custom domain later** | Out of scope | add `CNAME` in `playground/public/` when wanted |
| **Stale demo vs. library** | Real risk: the demo can drift from the published package | The workflow builds from `main`, so the site always reflects the branch. Optionally gate on `npm test` + `npm run typecheck` in the same job before deploy |
| **Secrets** | None needed | `GITHUB_TOKEN` with `pages: write` is sufficient; no npm token involved |

**Do not** publish from a `dist/` (library) output — the demo is `dist-demo/`.
`dist/` is gitignored already, and `dist-demo/` likewise, so a Pages build
should run `npm ci && npm run build:demo` in the workflow rather than commit
build output.

## 6. Recommendation

1. **Ship the Pages workflow** (small, self-contained, immediately useful).
2. **Add `DEMO_BASE`** to `vite.demo.config.ts` so local dev and both render
   harnesses are unaffected.
3. **Link the demo and the theme builder from the README**; both already work
   on a static host, including `#spec=` share links.
4. Defer per-component deep links until the component registry from
   `docs/per-component-rendering.md` exists — then both features land together.

The theme builder is the standout: because it derives 21 tokens from 13 anchors
entirely client-side and encodes drafts in the URL hash, a static demo gives
users a **working theme designer with no backend**, and its output pane already
emits the exact CSS block plus registration checklist a consumer needs.
