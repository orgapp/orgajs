# orga-build

## 0.10.0

### Minor Changes

- d79fda5: Leave draft pages out of the build. A page with `#+draft: t` (or `true`, `yes`) is served by the dev server for preview, but the build emits no HTML for it and `getPages` doesn't return it, so feeds and index pages no longer need to filter drafts by hand.
- d8f4492: Static HTML by default, with opt-in React islands. Pages are prerendered to plain HTML and ship no JavaScript; the client-side router (wouter) and whole-app hydration are gone, so links are regular page loads. A component module that starts with React's `'use client'` directive becomes an island: it is still prerendered, and the browser imports just that module (plus a shared React chunk) and hydrates it in place. Pass `client="visible"` to defer hydration until the island scrolls into view. Island props must be JSON-serializable.

  The `orga-build/components` and `orga-build/csr` entry points are removed, and the default HTML shell no longer needs a `<script>` tag.

- 89f9c20: Add a `site` option (absolute site URL), exported from `orga-build:content` and passed to endpoints as `ctx.site`. TSX/JSX pages now fill `data` in `getPages` from their literal named exports (`export const title = '…'`), and `export const draft = true` leaves them out of the build.
- 8a8a3dd: Upgrade to Vite 8 and `@vitejs/plugin-react` 6, and move more of the build onto Vite:

  - `orgaBuildPlugin` is now self-contained: in a `vite.config.js`, `vite` serves the site with SSR and `vite build` builds the static site (prerendering runs in Vite's `buildApp` hook). `resolve: { alias }` is no longer needed there.
  - Vite processes `index.html` as the client entry, injecting the bundled script and stylesheets itself.
  - Global `styles` are linked from the HTML shell, so they hot-reload in dev and are no longer loaded twice.
  - Dependencies of pages, layouts and components are pre-bundled at dev startup instead of triggering a reload on first visit.
  - Browser console errors are forwarded to the dev server terminal.
  - A relative `root` passed to `orgaBuildPlugin` now works.

  Breaking: requires Node `^20.19.0 || >=22.12.0` (Vite 8), and `createOrgaBuildConfig` no longer returns `resolve`.

- 3cc8613: Resolve Org links to headings. Headings get an `id` (`CUSTOM_ID`, or a slug of their text), `[[*Heading]]` and `[[#custom-id]]` link within the page, and `file:x.org::*Heading` / `file:x.org::#custom-id` keep the target as a URL fragment. orga-build rewrites `.org` links to page URLs under Vite's `base`.

### Patch Changes

- c9b7b32: Align config, CLI and docs: `--outDir`/`-o` now overrides the output directory, a broken `orga.config.js` fails the command instead of silently using defaults, unknown routes answer 404 in dev, and the unused `preBuild`/`postBuild` options and `--watch` flag are removed.
- f7dcadd: Fix the dev server serving a stale file list: added pages now render without a restart, and deleting a `_layout` or `_components` file no longer breaks every page with "Failed to load url".
- c5fbbf1: Fix two dev server issues: only reload when files in the content root change (unrelated writes in the project caused endless reloads), and pre-bundle `react-dom/client` and wouter's `use-sync-external-store` shim so the client no longer fails with "does not provide an export named" errors.
- a1f9553: Leave protocol-relative (`//cdn...`) and other non-local media URLs alone instead of importing them as assets
- b3f20cd: Hydrate server-rendered pages instead of re-rendering them. The client entry used `createRoot`, which threw away the prerendered HTML and rebuilt the DOM on every page load, causing a visible flicker on navigation.
- bab911a: Escape metadata and media paths in generated code. `#+title: Don't panic` produced `export const title = 'Don't panic'`, a syntax error that failed the build; keywords that aren't valid identifiers (`#+1st:`, `#+class:`) are now skipped instead of breaking the module. In orga-build, an image or video whose file name contains a quote (`[[./it's.png]]`) no longer breaks the page.
- Updated dependencies [8a8a3dd]
  - @orgajs/rollup@1.3.5

## 0.9.0

### Minor Changes

- 8b13493: - add exclude config option to skip files from content scanning
  - decouple Vite's root from the content root (now always cwd)

## 0.8.0

### Minor Changes

- f4b8394: add data endpoint

## 0.7.1

### Patch Changes

- 850bcf9: fix: use native anchor for external links to prevent wouter pushState SecurityError

## 0.7.0

### Minor Changes

- be20652: expose rehypePlugins in orga-build

## 0.6.3

### Patch Changes

- bd2365a: fix types and linting
- Updated dependencies [bd2365a]
  - @orgajs/rollup@1.3.4

## 0.6.2

### Patch Changes

- 292e2f1: Use the shared virtual client entry in production builds so `styles` are imported, hashed by Vite, and injected from built CSS assets.

## 0.6.1

### Patch Changes

- b2110a4: fix index.html resolution conflict

## 0.6.0

### Minor Changes

- 18c8ed7: implement per-page head injection

## 0.5.4

### Patch Changes

- 20f5a03: fix: render video links as `<video controls>` elements

## 0.5.3

### Patch Changes

- 15434f6: Normalize org file: links to canonical slugs and fix index.org link targets

## 0.5.2

### Patch Changes

- ada31b9: org-build output directly to outDir

## 0.5.1

### Patch Changes

- 23b8f16: make orga-build dev mode to be vite-native

## 0.5.0

### Minor Changes

- 06c6d43: Vit Environment API adoption

## 0.4.0

### Minor Changes

- 3a425ad: update to vite 7 🤞

## 0.3.2

### Patch Changes

- 1bff98b: fix HMR issue

## 0.3.1

### Patch Changes

- abbee9a: add docs and rename orga-build/content to orga-build/client

## 0.3.0

### Minor Changes

- ad0bd0d: Add `orga-build:content` virtual module with `getPages()`, `getPage()`, and `getEntries()` functions for querying content entries. Automatically extracts metadata from org-mode headers (e.g., `#+title:`, `#+date:`) and supports hierarchical path filtering.

## 0.2.7

### Patch Changes

- @orgajs/rollup@1.3.3

## 0.2.6

### Patch Changes

- 6d46012: remove log

## 0.2.5

### Patch Changes

- 70ebb3b: handle image and relative links

## 0.2.4

### Patch Changes

- c3fecf6: resolve react/react-dom/wouter properly

## 0.2.3

### Patch Changes

- c71a873: fix dependency issue

## 0.2.2

### Patch Changes

- 107b375: move react and react-dom to peer dependencies

## 0.2.1

### Patch Changes

- cd8358d: replace react-router with wouter

## 0.2.0

### Minor Changes

- 60ad38f: migrate orga-build to be based on vite

### Patch Changes

- Updated dependencies [60ad38f]
  - @orgajs/rollup@1.3.2
  - @orgajs/esbuild@1.1.3
  - @orgajs/node-loader@1.1.3

## 0.1.4

### Patch Changes

- 27d31bf: remove log

## 0.1.3

### Patch Changes

- e504f45: you can refer to image using relative path now

## 0.1.2

### Patch Changes

- 10e8856: [orga-build] copy assets

## 0.1.1

### Patch Changes

- 7c3c600: fix react resolve issue
  - @orgajs/esbuild@1.1.2
  - @orgajs/node-loader@1.1.2

## 0.1.0

### Minor Changes

- 9392c3e: release orga-build
