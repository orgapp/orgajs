import { Token } from '../../types'
import { Reader } from '../reader'
import { tokenize as tokenizeInline } from './inline'

interface Props {
  reader: Reader;
}

export default ({ reader }: Props) : Token[] => {
  const { now, match, eat, jump, skipWhitespaces, getLine } = reader

// /^(\s*)([-+]|\d+[.)])\s+(?:\[(x|X|-| )\][ \t]+)?(?:([^\n]+)[ \t]+::[ \t]*)?(.*)$/
  let tokens: Token[] = []

  const indent = now().column

  const bullet = match(/^([-+]|\d+[.)])(?=\s)/)
  if (!bullet) return []
  tokens.push({
    type: 'list.item.bullet',
    indent,
    ordered: /^\d/.test(bullet.captures[1]),
    position: bullet.position,
  })

  jump(bullet.position.end)
  skipWhitespaces()

  const checkbox = match(/^\[(x|X|-| )\](?=\s)/)
  if (checkbox) {
    tokens.push({
      type: 'list.item.checkbox',
      checked: checkbox.captures[1] !== ' ',
      position: checkbox.position,
    })
    jump(checkbox.position.end)
  }

  skipWhitespaces()

  const tagMark = match(/\s+::\s+/)
  if (tagMark) {
    tokens.push({
      type: 'list.item.tag',
      value: tagMark.captures[0],
      position: { start: now(), end: tagMark.position.start },
    })
    jump(tagMark.position.end)
  }

  tokens = tokens.concat(tokenizeInline({ reader }))

  eat('line')

  return tokens
}
