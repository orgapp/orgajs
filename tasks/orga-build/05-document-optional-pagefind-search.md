---
status: todo
---
# Document optional Pagefind search

README recipe only, no code. The output is now static HTML, so Pagefind can
index it directly:

- run `npx pagefind --site out` after `orga-build`
- limit indexing to article content with `data-pagefind-body` (e.g. via
  `containerClass` or the layout)
- load the Pagefind UI from a layout, or as an island
