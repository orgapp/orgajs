---
'orga-build': minor
---

Static HTML by default, with opt-in React islands. Pages are prerendered to plain HTML and ship no JavaScript; the client-side router (wouter) and whole-app hydration are gone, so links are regular page loads. A component module that starts with React's `'use client'` directive becomes an island: it is still prerendered, and the browser imports just that module (plus a shared React chunk) and hydrates it in place. Pass `client="visible"` to defer hydration until the island scrolls into view. Island props must be JSON-serializable.

The `orga-build/components` and `orga-build/csr` entry points are removed, and the default HTML shell no longer needs a `<script>` tag.
