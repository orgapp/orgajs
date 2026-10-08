---
status: done
---
# Make Timestamp timezone-free plain data

Replace the `Date`-based `Timestamp` in `orga` with plain, timezone-free
data parsed from the text, and drop `date-fns` and `date-fns-tz`. Breaking
change: major version of `orga`. Fixes
[#327](https://github.com/orgapp/orgajs/issues/327).

## Why

- `src/timestamp.ts` turns Org's local times into UTC instants with
  `zonedTimeToUtc` and the parsing machine's timezone. The same file gives
  different ASTs on different machines, and the original text can't be
  rebuilt from the value.
- Repeaters and warning delays fail to parse. `SCHEDULED: <2026-01-05 Mon
  10:00 +1w>` and `DEADLINE: <2026-01-09 Fri -2d>` give `timestamp:
  undefined`, though `Planning.timestamp` is typed as always set.
- Active vs. inactive, repeater and warning delay are dropped.
- The `planning.timestamp` token's span includes the spaces around the
  timestamp (`" <2026-01-05 Mon> "`), which is awkward for source-preserving
  editors (the use case in #327).
- `Date` objects make the AST not plain JSON, unlike other unist trees.

## Shape

Field names match `Temporal.PlainDate` / `Temporal.PlainDateTime`, so
consumers can call `Temporal.PlainDateTime.from(ts.start)` directly. Don't
put Temporal objects in the AST: Safari doesn't ship Temporal yet (as of
2026-10), and the AST should stay plain JSON.

```ts
export interface DateTime {
	year: number
	month: number // 1-12
	day: number
	hour?: number // both set, or neither
	minute?: number
}

export interface Timestamp {
	active: boolean // <...> vs [...]
	start: DateTime
	end?: DateTime // from 10:00-11:00 (same day) or <a>--<b>
	repeater?: string // "+1w", "++1w", ".+1w", as written
	warning?: string // "-2d", "--2d", as written
}
```

Keep repeater and warning as raw strings; parse them only if someone needs
the parts. No `raw` field: once the span is tight, the token's position
gives the exact source text.

## Do

- Rewrite `packages/orga/src/timestamp.ts` to return the shape above.
  Handle repeaters, warnings and both range forms. Return `undefined` only
  for text that isn't a timestamp.
- Narrow the `planning.timestamp` token's position to the timestamp itself,
  without surrounding whitespace.
- Type `Planning.timestamp` as `Timestamp | undefined`, or don't create a
  `planning` node when the timestamp is invalid. Pick whichever keeps the
  parser simpler, and say which in the PR.
- Remove the `timezone` option (`src/options.ts`, `src/tokenize/index.ts`,
  `src/tokenize/planning.ts`) and the `date-fns` and `date-fns-tz`
  dependencies.
- No `toDate` helper. Document in `packages/orga/README.org` how to get a
  `Temporal.PlainDateTime` / `ZonedDateTime` from `start`.
- Check other packages for uses of `timestamp.date`, `.end` or the
  `timezone` option (none found as of 2026-10-08) and update them.
- Add a major changeset for `orga`.

## Done when

- Tests in `packages/orga` cover: date only, date + time, time range,
  `<a>--<b>` range, inactive, repeater, warning, repeater + warning, and an
  exact token position for each.
- `pnpm build` and `pnpm test` pass across the repo.
- `date-fns` and `date-fns-tz` are gone from `packages/orga/package.json`.
