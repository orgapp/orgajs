---
'orga-build': minor
---

Add `assetKeywords`: Org keywords holding local file paths (e.g. `#+image: ./cover.png` with `assetKeywords: ['image']`) are imported as assets, so `%orga.image%` and the layout's `image` prop get the emitted file's URL
