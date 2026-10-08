---
'oast-to-hast': minor
'orga-build': minor
---

Resolve Org links to headings. Headings get an `id` (`CUSTOM_ID`, or a slug of their text), `[[*Heading]]` and `[[#custom-id]]` link within the page, and `file:x.org::*Heading` / `file:x.org::#custom-id` keep the target as a URL fragment. orga-build rewrites `.org` links to page URLs under Vite's `base`.
