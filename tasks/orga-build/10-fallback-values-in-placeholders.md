---
status: todo
---
# Fallback values in placeholders

Today a `%orga.<key>%` placeholder whose key the page doesn't export becomes an
empty string (`lib/html.js`, `renderPageHtml`). A site can't give a default
`og:image` or description in `index.html`.

Add a fallback after `|`:

```html
<meta property="og:image" content="%orga.image|https://example.com/og.png%" />
<meta name="description" content="%orga.description|Notes by me%" />
```

- The page's value wins when it is set and not empty; otherwise the fallback.
- The fallback is plain text: it can't contain `%` or another placeholder.
  It is HTML-escaped like page values.
- Same behaviour in dev (`lib/dev-ssr.js`) and build (`lib/prerender.js`),
  since both go through `renderPageHtml`.

Done when: a page with `#+image:` gets its value, one without it (and one with
`#+image:` left empty) gets the fallback, in dev and build; README documents it
next to the `%orga.<key>%` paragraph.
