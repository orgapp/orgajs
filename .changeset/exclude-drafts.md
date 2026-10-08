---
'orga-build': minor
---

Leave draft pages out of the build. A page with `#+draft: t` (or `true`, `yes`) is served by the dev server for preview, but the build emits no HTML for it and `getPages` doesn't return it, so feeds and index pages no longer need to filter drafts by hand.
