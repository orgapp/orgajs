---
'orga-build': minor
---

Add `assetKeywords`: Org keywords holding local file paths (e.g. `#+image: ./cover.png` with `assetKeywords: ['image']`) are imported as assets, so `%orga.image%`, the layout's `image` prop and the page's `data.image` from `getPages()` get the emitted file's URL
