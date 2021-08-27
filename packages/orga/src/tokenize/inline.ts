import { Reader } from 'text-kit'
import { Point } from 'unist'
import { Style, Token } from '../types'
import uri from '../uri'

const MARKERS: { [key: string]: Style } = {
  '*': 'bold',
  '=': 'verbatim',
  '/': 'italic',
  '+': 'strikeThrough',
  _: 'underline',
  '~': 'code',
}

const tokenizeLink: Tokenizer = (reader: Reader) => {
  const tokens: Token[] = []
  const { match, eat, findClosing, jump, getChar, now } = reader
  const linkOpening = eat(/^\[/)
  if (!linkOpening) return

  tokens.push({
    type: 'opening',
    element: 'link',
    position: linkOpening.position,
  })

  const linkClosing = findClosing(linkOpening.position.start)
  if (!linkClosing) return
  const path = match(/^\[([^\]]*)\]/)
  if (!path) return
  const linkInfo = uri(path.result[1])
  if (!linkInfo) return

  tokens.push({
    type: 'link.path',
    ...linkInfo,
    position: { ...path.position },
  })
  jump(path.position.end)
  if (getChar() === '[') {
    const descClosing = findClosing()
    if (!descClosing) {
      return
    }
    eat() // descOpening
    const desc = tokenize(reader.read({ end: descClosing }), [
      tokenizeText(now()),
    ])
    tokens.push(...desc)
  }

  jump(linkClosing)
  tokens.push({
    type: 'closing',
    element: 'link',
    position: eat().position,
  })

  return tokens
}

const tokenizeText =
  (bol: Point | undefined = undefined) =>
  (reader: Reader) => {
    const tokens: Token[] = []
    const { now, eat, jump, getChar, findClosing, substring } = reader
    const marker = getChar()
    const style = MARKERS[marker]
    if (!style) return
    // check pre
    const pre = getChar(-1)
    const isBOL = (bol && bol.offset === now().offset) || now().column === 1
    if (!isBOL && !/[\s({'"]/.test(pre)) return
    const tokenStart = now()

    const closing = findClosing(now())
    if (!closing) return

    eat()
    const valueStart = now()
    // check border
    if (getChar().match(/\s/)) return

    jump(closing)
    // check border
    if (getChar(-1).match(/\s/)) return
    // check post
    const post = getChar(1)
    if (post && ` \t\n-.,;:!?')}["`.indexOf(post) === -1) return

    const valueEnd = now()
    eat() // closing
    tokens.push({
      type: 'text',
      style,
      value: substring(valueStart, valueEnd),
      position: { start: tokenStart, end: now() },
    })
    return tokens
  }

const tokFootnoteRefernece = (reader: Reader) => {
  const tokens: Token[] = []

  const { eat, now, jump } = reader
  const fnb = eat(/^\[fn:/)
  if (!fnb) return
  tokens.push({
    type: 'opening',
    element: 'footnote.reference',
    position: fnb.position,
  })
  const closing = reader.findClosing(fnb.position.start)
  if (!closing) return
  const label = eat(/^[\w_-]+/)
  if (label) {
    tokens.push({
      type: 'footnote.label',
      label: label.value,
      position: label.position,
    })
  }
  if (label && now().offset === closing.offset) {
    tokens.push({
      type: 'closing',
      element: 'footnote.reference',
      position: eat().position,
    })
    return tokens
  }

  if (!eat(/^:/)) return
  const defRange = {
    start: now(),
    end: closing,
  }

  const more = tokenize(reader.read(defRange))
  tokens.push(...more)
  jump(closing)

  tokens.push({
    type: 'closing',
    element: 'footnote.reference',
    position: eat().position,
  })

  return tokens
}

type Tokenizer = (reader: Reader) => Token[] | undefined

const ALL: Tokenizer[] = [tokFootnoteRefernece, tokenizeLink, tokenizeText()]

export const tokenize = (
  reader: Reader,
  tokenizers: Tokenizer[] = ALL,
  { ignoring }: { ignoring: string[] } = { ignoring: [] }
): Token[] => {
  const { now, eat, jump, substring, getChar, toPoint } = reader

  const _tokens: Token[] = []

  let cursor = now().offset

  const push = (...tokens: Token[]) => {
    if (tokens.length === 0) return
    // collect plain text
    const textEnd = tokens[0].position.start
    if (cursor < textEnd.offset) {
      _tokens.push({
        type: 'text',
        value: substring(cursor, textEnd),
        position: { start: toPoint(cursor), end: { ...textEnd } },
      })
    }

    cursor = tokens[tokens.length - 1].position.end.offset
    _tokens.push(...tokens)
  }

  main: while (getChar()) {
    const newline = eat('newline')
    if (newline) {
      push({
        type: 'newline',
        position: newline.position,
      })
      break // newline breaks inline
    }

    for (const t of tokenizers) {
      const r = reader.read()
      const tokens = t(r)
      if (tokens) {
        push(...tokens)
        jump(r.now())
        continue main
      }
    }

    eat()
  }

  if (cursor < now().offset) {
    const value = substring(cursor, reader.now())
    _tokens.push({
      type: 'text',
      value,
      position: { start: toPoint(cursor), end: reader.now() },
    })
  }

  return _tokens
}
