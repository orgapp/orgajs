Monorepo for `orga`, an org-mode parser in the unifiedjs ecosystem (like remark for markdown). Use `pnpm`.

Tasks are tracked with the `task` CLI. Run `task help` before picking up, adding or claiming a task.

## Lezer parser (`@orgajs/lezer`)

- Keep `OrgParser` stateless: only immutable config (nodeSet, log) lives on the class. Every `createParse()` builds fresh state, following lezer-markdown. Incremental parsing reuses tree fragments, never parser state.
- Read document settings (`#+todo:` etc.) fresh from the text on each parse via `getSettings()` from `orga`. Storing them on the parser breaks on reconfigure; extracting them from fragments goes against Lezer's design.
- Per-node metadata can't be attached to Lezer trees (`NodeProp` `perNode` is internal). Use `ContextTracker` for stateful parsing context.

## Review guidelines

Simplicity is a design goal: a finding must be worth the code its fix adds.

- Flag: regressions, data loss, broken builds or hydration, and bugs on common paths (default config, typical project layouts, macOS/Linux).
- Don't flag: unusual inputs a user would have to go out of their way to write (malformed or exotic HTML shells, non-UTF-8 text, nested React wrapper types), Windows-only path edge cases, or preserving Vite outputs nobody asked for. If such a case fails loudly, it is acceptable.
- Don't re-flag edge cases in code a previous round just added unless they are P1. Each fix is new surface; chasing it never converges.
- A clear error with a documented workaround beats code to support the case.
