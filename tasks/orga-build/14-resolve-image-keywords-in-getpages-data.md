---
status: done
blocked-by: [orga-build/13-image-keywords-in-org-pages]
---
# Resolve image keywords in getPages data

After `orga-build/13-image-keywords-in-org-pages`, a page's module exports the
resolved image, but `getPages()` still returns `data.image: './cover.png'`:
`orga-build:content` is a JSON manifest built from `readMetadata`
(`lib/files.js`), not from the page modules. A list page can't show covers:

```tsx
getPages('projects').map((p) => <img src={String(p.data.image)} />)
```

In `renderContentModule` (`lib/vite.js`), for each Org entry's
`assetKeywords` value that is a local path, resolve it against the entry's
`dataPath`, emit an `import` at the top of the module, and reference it in the
entry's `data` instead of the string. Vite resolves it like the page module
does, so both point to the same emitted file; the marker in rendered HTML and
endpoint bodies is already replaced by prerender.

TSX pages are out of scope: their `data` only holds literal exports, and they
can import the image themselves.

Done when: `getPages()` returns the hashed URL for an Org page's `image`, a
list page renders it in dev and build, and an RSS-style endpoint using it gets
a working URL.
