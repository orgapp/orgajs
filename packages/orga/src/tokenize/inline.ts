import { Point } from 'unist'
import { isEqual } from '../position'
import { Reader } from '../reader'
import { FootnoteReference, Link, PhrasingContent, StyledText, Token } from '../types'
import uri from '../uri'
import { escape } from '../utils'

const POST = `[\\s-\\.,:!?'\\)}]|$`
const BORDER = `[^,'"\\s]`

const MARKERS: { [key: string]: StyledText['type'] } = {
  '*': 'text.bold',
  '=': 'text.verbatim',
  '/': 'text.italic',
  '+': 'text.strikeThrough',
  '_': 'text.underline',
  '~': 'text.code',
}

interface Props {
  reader: Reader
  start?: Point
  end?: Point
}

export const tokenize = ({ reader, start, end } : Props): Token[] => {
  const { now, eat, eol, match, jump, substring, getChar } = reader
  start = start || { ...now() }
  end = end || { ...eol() }
  jump(start)

  let cursor = { ...start }

  const _tokens: PhrasingContent[] = []

  const tokLink = (): Link => {
    const m = match(/^\[\[([^\]]*)\](?:\[([^\]]*)\])?\]/m)
    if (!m) return undefined
    const linkInfo = uri(m.captures[1])
    return {
      type: 'link',
      description: m.captures[2],
      ...linkInfo,
      position: m.position,
    }
  }

  const tokFootnote = (): FootnoteReference => {
    const m = match(/^\[fn:(\w+)\]/)
    if (!m) return undefined
    return {
      type: 'footnote.reference',
      label: m.captures[1],
      position: m.position,
    }
  }

  const tokStyledText = (marker: string) => (): StyledText => {
    const m = match(
      RegExp(`^${escape(marker)}(${BORDER}(?:.*?(?:${BORDER}))??)${escape(marker)}(?=(${POST}.*))`, 'm'))
    if (!m) return undefined
    return {
      type: MARKERS[marker],
      value: m.captures[1],
      position: m.position,
    }
  }

  const tryTo = (tok: () => PhrasingContent) => {
    const token = tok()
    if (!token) return false
    cleanup()
    _tokens.push(token)
    jump(token.position.end)
    cursor = { ...now() }
    return true
  }

  const cleanup = () => {
    if (isEqual(cursor, now())) return
    const position = { start: { ...cursor }, end: { ...now() } }
    const value = substring(position)
    _tokens.push({
      type: 'text.plain',
      value,
      position,
    })
  }

  const tok = () => {
    if (isEqual(now(), end)) {
      return
    }
    const char = getChar()

    if (char === '[') {
      if (tryTo(tokLink)) return tok()
      if (tryTo(tokFootnote)) return tok()
    }

    if (MARKERS[char]) {
      const pre = getChar(-1)
      if (now().column === 1 || /[\s\({'"]/.test(pre)) {
        if (tryTo(tokStyledText(char))) return tok()
      }
    }

    eat()
    tok()
  }

  tok()
  cleanup()
  return _tokens

}
