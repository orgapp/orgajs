---
status: done
---
# Unify page metadata and URLs

Worth doing in a smaller form.

Already have: `%orga.<key>%` placeholders in `index.html` filled from page
exports, and Vite's `base` for the base path.

Missing:
- a `site` option (absolute site URL) so pages and endpoints can build
  canonical URLs; expose it to pages and endpoint `GET(ctx)`
- `data` for `.tsx` / `.jsx` pages is always `{}` in `contentEntries`
  (`lib/files.js`). Fill it from the page's named exports (`title`, `date`,
  ...) so `getPages` treats Org and TSX pages the same.

Skip head-override APIs: the user's `index.html` and layouts already cover it.
