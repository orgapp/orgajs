---
'orga-build': patch
---

Hydrate server-rendered pages instead of re-rendering them. The client entry used `createRoot`, which threw away the prerendered HTML and rebuilt the DOM on every page load, causing a visible flicker on navigation.
