---
status: todo
---
# Resolve Org links correctly

Partly works: `rewriteOrgFileLinks` in `lib/orga.js` rewrites a link to its
page slug only when the href ends in `.org`.

Missing:
- `file:x.org::*Heading` and `file:x.org::#custom-id`: the search option is
  either lost or keeps the href from matching, so the link is left unresolved.
- Headings get no `id` attribute (`packages/oast-to-hast/lib/handlers/headline.js`
  and `section.js`), so in-page anchors have nothing to target. Derive ids from
  `CUSTOM_ID` when set, otherwise from a slug of the heading text.
- Links within the same page (`[[*Heading]]`, `[[#custom-id]]`).
- Links must respect Vite's `base`.

Scope for now: heading ids, `CUSTOM_ID`, `file::search`, same-page links.
Cross-file `id:` links need a global index of IDs; leave them for later.
