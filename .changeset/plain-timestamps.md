---
"orga": major
---

Timestamps are now timezone-free plain data, parsed as written
([#327](https://github.com/orgapp/orgajs/issues/327)).

- `Timestamp` is `{ active, start, end?, repeater?, warning? }`, where
  `start` and `end` are `{ year, month, day, hour?, minute? }`, instead of
  `{ date: Date, end?: Date }`. The field names match
  `Temporal.PlainDateTime`; see the README for conversions.
- Repeaters (`+1w`, `++1w`, `.+1w`) and warning delays (`-2d`, `--2d`) now
  parse instead of giving `undefined`.
- `Planning.timestamp` is typed `Timestamp | undefined`; it is `undefined`
  when the text after the keyword is not a timestamp.
- The `planning.timestamp` token's position covers the timestamp only,
  without the whitespace around it.
- The `timezone` option is removed, and so are the `date-fns` and
  `date-fns-tz` dependencies.
