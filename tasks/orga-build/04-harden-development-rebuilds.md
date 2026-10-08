---
status: done
---
# Harden development rebuilds

Partly done: `hotUpdate` in `lib/vite.js` clears the file caches and the
content module, then reloads the page. "reloads the browser on server-rendered
edits" in `lib/__tests__/dev.test.js` covers edits.

Missing tests for:
- adding, deleting, and renaming a page (route appears / disappears, no stale
  module, route conflict surfaces as an error rather than a crash)
- adding, deleting, or editing a `_layout` and `_components`
- `getPages` output after a metadata edit (content module invalidation)
