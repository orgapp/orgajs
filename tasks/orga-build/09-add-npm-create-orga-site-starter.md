---
status: todo
blocked-by: [orga-build/01-align-configuration-and-documentation, orga-build/02-exclude-drafts-from-production, orga-build/03-resolve-org-links-correctly, orga-build/04-harden-development-rebuilds, orga-build/05-document-optional-pagefind-search, orga-build/06-unify-page-metadata-and-urls, orga-build/07-add-publishing-helpers, orga-build/08-improve-asset-handling]
---
# Add npm create orga-site starter

Bootstrap a minimal hello-world site with one command, like `npm create vite`:

```sh
npm create orga-site my-site
cd my-site && npm install && npm run dev
```

Do this after every other task: the starter should show the tool as it ends
up, and the defaults decided in `orga-build/01-align-configuration-and-documentation`
(`root`, `outDir`) set the template layout.

## How `npm create` works (researched 2026-10-08)

- `npm create <name>` is an alias of `npm init <name>`, which runs
  `npx create-<name>`. So `npm create orga-site` runs the `bin` of the
  `create-orga-site` package. `pnpm create`, `yarn create` and `bun create`
  follow the same convention.
- The name doesn't have to match the tool. `create-vite` and `create-astro`
  use the tool's name; `create-next-app` names what it makes. We use
  `create-orga-site`: it reads better and says what you get. The site's
  README and `AGENTS.md` say it's built with `orga-build`.
- `create-orga-site`, `create-orga-build` and `create-orga` are all free on
  npm (2026-10-08).
- `create-vite` (9.2.1) is the model: one `bin` script plus `template-*/`
  folders copied as-is. Its templates ship `_gitignore`, renamed to
  `.gitignore` when copying.
- Verified with `npm pack --dry-run`: npm drops `.gitignore` files and
  symlinks from published packages. So the template stores `_gitignore`, and
  uses no symlinks (see `CLAUDE.md` below).

## Package: `packages/create-orga-site`

- `bin` script using only `node:fs` / `node:path`, no dependencies.
- No prompts. Target directory is the first argument (default: `orga-site`).
  Refuse to write into a non-empty directory.
- Copy `template/`, rename `_gitignore` -> `.gitignore`, set `name` in
  `package.json` to the directory name.
- Don't run the install: print the next steps (`cd`, install, `npm run dev`)
  using the package manager it was invoked with (`npm_config_user_agent`).

## Keeping the template's `orga-build` version current

Vite and Astro both automate this with a small script run when versions are
bumped; neither maintains it by hand:

- Vite: `scripts/releaseUtils.ts` `updateTemplateVersions()` sets
  `devDependencies.vite` to `^<vite version>` in every
  `packages/create-vite/template-*/package.json`, run by
  `prepare-release.ts` when releasing `create-vite`.
- Astro: the root `version` script is
  `changeset version && node ./scripts/deps/update-example-versions.js`, which
  rewrites the `astro` range in `examples/*/package.json` (e.g.
  `"astro": "^7.3.6"`). `create-astro` then downloads an example from GitHub.

Do the same with changesets, which this repo already uses:

- The template's `package.json` holds a real range, e.g.
  `"orga-build": "^0.9.0"` (`workspace:^` is only rewritten in a package's own
  `package.json`, not in files inside it).
- `scripts/update-template-versions.js` (~15 lines) writes `^<orga-build
  version>` into `packages/create-orga-site/template/package.json`. Run it in
  the root `ci:version` script: `changeset version && node
  scripts/update-template-versions.js`.
- Add `["orga-build", "create-orga-site"]` to `fixed` in
  `.changeset/config.json`, so a new `orga-build` always publishes a starter
  that uses it. This matters while orga-build is 0.x: `^0.9.0` does not
  accept `0.10.0`.

## Template: basic, zero-config

Show the core loop only: write Org, get a website. No `orga.config.js`.

- `package.json`: `dev` and `build` scripts, `orga-build` dependency
- `index.org`: hello world with a title, a heading, some markup, and a link
  to `about.org`
- `about.org`: a second page, showing file links become routes
- `_layout.jsx`: shared page shell (site title, nav), imports `style.css`.
  `.jsx` rather than `.tsx` so no TypeScript setup is needed.
- `style.css`: a few lines of readable defaults
- `AGENTS.md`: how the site works, for coding agents and people:
  - built with `orga-build`; link to its README
  - every `.org`, `.tsx` or `.jsx` file is a page; its path is its URL
  - files and folders starting with `_` or `.` are not pages
  - `_layout.jsx` wraps every page at or below its folder
  - `npm run dev` serves with live reload; `npm run build` writes static HTML
    to the output directory
  - pages ship no JavaScript; `'use client'` components become islands
    (mention only, with a link to the README)
- `CLAUDE.md`: one line, `@AGENTS.md`. This is the convention Claude Code's
  docs give for sharing one file with other agents
  (code.claude.com/docs/en/memory, "Share one file with other coding
  tools"). Current Claude Code reads `AGENTS.md` on its own when there's no
  `CLAUDE.md`; the import covers older versions and sessions that can't.
  Not a symlink: npm drops symlinks on publish, and the docs advise against
  them on Windows (needs Developer Mode; Git checks them out as plain text).
- `_gitignore`: `node_modules`, the output directory

Left out on purpose: islands, endpoints/RSS, content queries, config file,
TypeScript. They're in the README once someone needs them.

## Test

Scaffold into a temp dir, point `orga-build` at the workspace package, build,
and check that `index.html` and `about/index.html` exist, the link between
them resolves, and no JavaScript is emitted.
