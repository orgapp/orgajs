# orga-build improvements

Reviewed after d8f44924 (static HTML by default with `'use client'` islands).
Paths are relative to `packages/orga-build/` unless noted.

## Already done

- Client JavaScript is optional (d8f44924). Pages prerender to static HTML;
  modules starting with `'use client'` become islands that hydrate in place
  (`client="visible"` defers them). The client router is gone.
- Metadata and media paths are serialized safely in generated code
  (`packages/orgx/lib/plugin/rehype-recma.js`, `mediaAssets` in `lib/orga.js`).

## Parked (not tasks)

- **Source-aware content checking.** Parked until
  `orga-build/03-resolve-org-links-correctly` is done. Then a build-time
  warning for internal links whose target page or anchor doesn't exist, with
  file/line, covers the common case. Skip strict CI mode, ambiguous-reference
  detection, and duplicate-ID reports for now.
- **Content graph queries.** Depends on resolved links. Users can derive
  outgoing links and backlinks themselves from `getPages`, so this doesn't
  need to be in core.
- **Typed metadata schemas.** Large API surface for a tool whose goal is
  simplicity. Revisit if users ask; schema-free folder-to-page publishing
  stays the default either way.
- **Org compatibility contract.** About the `orga` parser and
  `oast-to-hast`, so it belongs in their backlog, not orga-build's. Babel
  blocks are already not executed during builds.
