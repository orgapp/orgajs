---
'orga-build': patch
---

Resolve asset URLs in HTML shell placeholders: a page exporting an imported image (`export const image = cover`) fills `%orga.image%` with the hashed asset's URL, absolute when `site` is set
