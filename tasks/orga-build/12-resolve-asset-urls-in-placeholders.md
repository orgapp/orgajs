---
status: todo
---
# Resolve asset URLs in placeholders

Bug. A TSX page can already export an image through Vite:

```tsx
import cover from './cover.png'
export const image = cover
```

In the build, `%orga.image%` in `index.html` prints
`/@orga-build/asset/assets/cover-CAFnVXNa.png`: the `assetUrlMarker` from
`renderBuiltUrl` (`lib/plugin.js`). `lib/prerender.js` replaces the marker in
page content and endpoint bodies, but not in the values passed to
`renderPageHtml` as `page`.

Fix: replace the marker in placeholder values too. `<head>` values are read by
crawlers (`og:image`, `twitter:image`), which need absolute URLs, so:

- with `site` set: `site` + the base path + the file
  (`https://example.com/assets/cover-CAFnVXNa.png`), also when `base` is `'./'`
- without `site`: the same URL page content gets (`toUrl`)

Dev already serves a working path; leave it.

Done when: a build test with the TSX page above outputs the absolute hashed
URL in `<head>`, and the same file referenced inline gets one emitted asset.
