---
status: todo
---
# Improve asset handling

Worth doing in a smaller form.

Already have: tests "emits images and CSS imported by pages" and "rebases
relative asset URLs for nested pages" in `lib/__tests__/build.test.js`.

Remaining:
- `src.startsWith('http')` is the only skip check: `data:` URIs and
  protocol-relative `//cdn...` URLs are turned into imports (not verified
  whether they fail). Skip any URL with a scheme or a leading `//`.

Dropped: image dimensions, responsive formats, caching. Users can add a Vite
plugin such as `vite-imagetools`. Missing-alt warnings aren't worth the code.
