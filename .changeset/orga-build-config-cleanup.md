---
'orga-build': patch
---

Align config, CLI and docs: `--outDir`/`-o` now overrides the output directory, a broken `orga.config.js` fails the command instead of silently using defaults, unknown routes answer 404 in dev, and the unused `preBuild`/`postBuild` options and `--watch` flag are removed.
