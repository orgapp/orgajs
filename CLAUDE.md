Monorepo for `orga`, an org-mode parser in the unifiedjs ecosystem (like remark for markdown). Use `pnpm`.

## Lezer parser (`@orgajs/lezer`)

- Keep `OrgParser` stateless: only immutable config (nodeSet, log) lives on the class. Every `createParse()` builds fresh state, following lezer-markdown. Incremental parsing reuses tree fragments, never parser state.
- Read document settings (`#+todo:` etc.) fresh from the text on each parse via `getSettings()` from `orga`. Storing them on the parser breaks on reconfigure; extracting them from fragments goes against Lezer's design.
- Per-node metadata can't be attached to Lezer trees (`NodeProp` `perNode` is internal). Use `ContextTracker` for stateful parsing context.
