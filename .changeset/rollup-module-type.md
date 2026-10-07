---
'@orgajs/rollup': patch
---

Mark compiled `.org` modules as JavaScript (`moduleType: 'js'`), as Rolldown (Vite 8) requires for plugins that transform non-JS files.
