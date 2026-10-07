---
status: todo
blocked-by: [orga-build/02-exclude-drafts-from-production, orga-build/06-unify-page-metadata-and-urls]
---
# Add publishing helpers

Worth doing in a smaller form.

Endpoints (`rss.xml.ts`, `sitemap.xml.ts`) already produce these files. Prefer
README recipes built on `getPages` over new API:

- RSS feed recipe (escape XML, absolute URLs from `site`)
- sitemap recipe (needs `site`)
- `robots.txt` is a static file or a one-line endpoint; no helper needed

Both pick up draft exclusion automatically once drafts are filtered at
discovery.
