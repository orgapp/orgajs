---
'orga-build': minor
---

Add a `site` option (absolute site URL), exported from `orga-build:content` and passed to endpoints as `ctx.site`. TSX/JSX pages now fill `data` in `getPages` from their literal named exports (`export const title = '…'`), and `export const draft = true` leaves them out of the build.
