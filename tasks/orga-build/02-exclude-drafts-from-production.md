---
status: done
---
# Exclude drafts from production

Nothing exists yet; the README tells users to filter `data.draft` by hand in
every `getPages` call.

- Filter once during route discovery in `lib/files.js` (`discoveredRoutes` /
  `contentEntries`). Routes, `getPages`, layouts' `pages` prop, and every
  endpoint built from `getPages` (feeds, sitemaps) then exclude drafts for free.
- Draft = `#+draft:` set to a truthy value (`t`, `true`, `yes`). TSX pages need
  an equivalent once their exports reach `data` (see
  `orga-build/06-unify-page-metadata-and-urls`).
- Include drafts in dev so they can be previewed.
- Update the README examples that filter drafts manually.
