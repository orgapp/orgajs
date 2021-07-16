import { Token } from '../types'
import { Reader } from '../reader'
import { tokenize as tokenizeInline } from './inline'

interface Props {
  reader: Reader;
}

export default ({ reader }: Props) : Token[] => {
  const { now, match, eat, jump, substring } = reader

  let tokens: Token[] = []

  const indent = now().column - 1

  const bullet = match(/^([-+]|\d+[.)])(?=\s)/)
  if (!bullet) return []
  tokens.push({
    type: 'list.item.bullet',
    indent,
    ordered: /^\d/.test(bullet.captures[1]),
    position: bullet.position,
  })

  jump(bullet.position.end)
  eat('whitespaces')

  const checkbox = match(/^\[(x|X|-| )\](?=\s)/)
  if (checkbox) {
    tokens.push({
      type: 'list.item.checkbox',
      checked: checkbox.captures[1] !== ' ',
      position: checkbox.position,
    })
    jump(checkbox.position.end)
  }

  eat('whitespaces')

  const tagMark = match(/\s+::\s+/)
  if (tagMark) {
    const pos = { start: now(), end: tagMark.position.start }
    tokens.push({
      type: 'list.item.tag',
      value: substring(pos),
      position: pos,
    })
    jump(tagMark.position.end)
  }

  tokens = tokens.concat(tokenizeInline({ reader }))

  return tokens
}
