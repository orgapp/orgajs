import { Token } from '../types'
import { Reader } from 'text-kit'
import { tokenize as tokenizeInline } from './inline'

export default (reader: Reader): Token[] => {
  const { now, match, eat, jump, substring, endOfLine } = reader

  let tokens: Token[] = []

  const indent = now().column - 1

  const bullet = match(/^([-+]|\d+[.)])(?=\s)/y)
  if (!bullet) return []
  tokens.push({
    type: 'list.item.bullet',
    indent,
    ordered: /^\d/.test(bullet.result[1]),
    position: bullet.position,
  })

  jump(bullet.position.end)
  eat('whitespaces')

  const checkbox = match(/^\[(x|X|-| )\](?=\s)/y)
  if (checkbox) {
    tokens.push({
      type: 'list.item.checkbox',
      checked: checkbox.result[1] !== ' ',
      position: checkbox.position,
    })
    jump(checkbox.position.end)
  }

  eat('whitespaces')

  const tagMark = match(/\s+::\s+/, { end: endOfLine() })
  if (tagMark) {
    const pos = { start: now(), end: tagMark.position.start }
    tokens.push({
      type: 'list.item.tag',
      value: substring(pos.start, pos.end),
      position: pos,
    })
    jump(tagMark.position.end)
  }

  tokens = tokens.concat(tokenizeInline(reader))

  return tokens
}
