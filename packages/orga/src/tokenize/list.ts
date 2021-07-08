import { Token } from '../types'
import { Reader } from '../reader'
import { tokenize as tokenizeInline } from './inline'
import * as tk from './util';

interface Props {
  reader: Reader;
}

export default ({ reader }: Props): Token[] => {
  const { now, match, eat, jump, substring } = reader

  let tokens: Token[] = []

  const indent = now().column - 1

  const bullet = match(/^([-+]|\d+[.)])(?=\s)/)
  if (!bullet) return []
  tokens.push(tk.tokListBullet(indent, /^\d/.test(bullet.captures[1]), { position: bullet.position }));

  jump(bullet.position.end)
  eat('whitespaces')

  const checkbox = match(/^\[(x|X|-| )\](?=\s)/)
  if (checkbox) {
    const position = checkbox.position;
    tokens.push(tk.tokListCheckbox(checkbox.captures[1] !== ' ', { position }));
    jump(position.end)
  }

  eat('whitespaces')

  const tagMark = match(/\s+::\s+/)
  if (tagMark) {
    const position = { start: now(), end: tagMark.position.start }
    tokens.push(tk.tokListItemTag(substring(position), { position }));
    jump(tagMark.position.end)
  }

  tokens = tokens.concat(tokenizeInline({ reader }))

  return tokens
}
