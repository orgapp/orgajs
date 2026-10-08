---
'orga-build': patch
---

Fix the dev server serving a stale file list: added pages now render without a restart, and deleting a `_layout` or `_components` file no longer breaks every page with "Failed to load url".
