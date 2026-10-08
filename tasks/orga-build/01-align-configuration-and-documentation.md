---
status: done
---
# Align configuration and documentation

Several mismatches between code, CLI and README:

- `lib/config.js` defaults to `root: '.'` and `outDir: '.out'`; the README
  documents `'pages'` and `'out'`. Decide which is right and make both agree.
- `preBuild` / `postBuild` are in the `Config` typedef and defaults but nothing
  reads them. Remove them.
- `cli.js` parses `--outDir` / `-o` and `--watch` but never uses them. Wire
  `--outDir` through to the config or remove both.
- `loadConfig` catches import errors, logs them, and continues with defaults.
  A broken `orga.config.js` should fail the command.
- Dead code: `lib/watch.js` is unused; in `lib/util.js` only `escapeHtml` is
  used (`buildNav`, `match`, `DefaultLayout`, `$` are dead).
- Stale docs: the README's "Development > TODO Items" section, and the
  `lib/dev-ssr.js` header comment ("the client-side router handles 404").
