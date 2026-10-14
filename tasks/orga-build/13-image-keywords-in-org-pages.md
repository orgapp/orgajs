---
status: todo
blocked-by: [orga-build/12-resolve-asset-urls-in-placeholders]
---
# Image keywords in Org pages

`#+image: ./cover.png` is exported as the literal `"./cover.png"`, so it
can't be used for `og:image` or in layouts. Inline images work because
`mediaAssets` (`lib/orga.js`) turns them into `import` statements that Vite
resolves, hashes and emits.

Add a config option naming the keywords that hold file paths:

```js
// orga.config.js
export const assetKeywords = ['image']
```

Reuse `mediaAssets`, don't write a second resolver:

- For each listed keyword in `tree.data` whose value is a local path (same
  scheme / `//` check as inline images), register it in the same `imports`
  map, delete it from `tree.data` so `rehype-recma` doesn't export it as a
  literal, and add a jsx node `export { asset_x as image }`. `handleJsx` in
  `packages/orgx` already accepts export declarations.
- Vite then does the rest: hashing, de-duplicating with the inline copy of
  the same file, and failing the build on a missing file. Check that error
  names the file; that's enough, no custom check.
- URLs (`#+image: https://...`) stay literal.
- Only listed keywords: guessing from the value would rewrite things like
  `#+repo: ./x`.

With `orga-build/12-resolve-asset-urls-in-placeholders`, `%orga.image%` in
`<head>` becomes the absolute hashed URL, and layouts get the resolved URL in
the `image` prop.

Done when: an Org page with `#+image: ./cover.png` and `[[./cover.png]]` emits
one asset, `og:image` is its absolute URL, a layout rendering
`<img src={props.image}>` works in dev and build, and a missing file fails the
build. README documents `assetKeywords`.
