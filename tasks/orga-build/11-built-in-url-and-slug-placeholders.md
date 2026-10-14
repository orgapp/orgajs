---
status: done
---
# Built-in url and slug placeholders

Placeholders only read the page's exports, so `index.html` can't output the
page's own address (`og:url`, `<link rel="canonical">`), though orga-build knows
both `site` and the slug.

Add two built-in placeholders:

| Placeholder    | `/writing/post` with `site: 'https://example.com'` |
|----------------|----------------------------------------------------|
| `%orga.slug%`  | `/writing/post`                                    |
| `%orga.url%`   | `https://example.com/writing/post`                 |

- The URL is decided by orga-build only. A page keyword or export named `url`
  or `slug` is ignored for these placeholders: letting pages set their own
  URL invites conflicts with routes, feeds and links over time. Document both
  names as reserved.
- `url` is `site + slug`, the same form the README gives for a page's absolute
  URL, so feeds and canonical links agree.
- Without `site`, `%orga.url%` is empty (works with the fallback syntax from
  `orga-build/10-fallback-values-in-placeholders`).

Done when: dev and build output the values above, a page with `#+url: /x`
still gets its real URL, and the README lists the built-ins.
