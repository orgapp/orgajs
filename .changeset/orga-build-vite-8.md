---
'orga-build': minor
---

Upgrade to Vite 8 and `@vitejs/plugin-react` 6, and move more of the build onto Vite:

- `orgaBuildPlugin` is now self-contained: in a `vite.config.js`, `vite` serves the site with SSR and `vite build` builds the static site (prerendering runs in Vite's `buildApp` hook). `resolve: { alias }` is no longer needed there.
- Vite processes `index.html` as the client entry, injecting the bundled script and stylesheets itself.
- Global `styles` are linked from the HTML shell, so they hot-reload in dev and are no longer loaded twice.
- Dependencies of pages, layouts and components are pre-bundled at dev startup instead of triggering a reload on first visit.
- Browser console errors are forwarded to the dev server terminal.
- A relative `root` passed to `orgaBuildPlugin` now works.

Breaking: requires Node `^20.19.0 || >=22.12.0` (Vite 8), and `createOrgaBuildConfig` no longer returns `resolve`.
