import { Point } from 'unist'
import { isGreaterOrEqual } from '../position'
import { Reader } from '../reader'
import { FootnoteReference, Link, PhrasingContent, StyledText, Token, Newline } from '../types'
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

export const tokenize = ({ reader, start, end }: Props, { ignoring }: { ignoring: string[] } = { ignoring: [] }): Token[] => {
  const { now, eat, eol, match, jump, substring, getChar } = reader
  start = start || { ...now() }
  end = end || { ...eol() }
  jump(start)

  let cursor: Point = { ...start }

  const _tokens: Token[] = []

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

  const tokFootnoteAnonOrInline = (): Token[] => {
    const tokens: Token[] = [];

    let m = match(/^\[fn:(\w*):/);
    if (!m) return [];
    tokens.push({
      type: 'footnote.inline.begin',
      label: m.captures[1],
      position: m.position,
    });
    jump(m.position.end);

    m = match(/^\]/);
    if (m) {
      // empty body
      tokens.push({ type: 'text.plain', value: '', position: { start: m.position.start, end: m.position.start, indent: m.position.indent } });
    } else {
      tokens.push(...tokenize({ reader }, { ignoring: [']'] }));
    }

    m = match(/^\]/);
    if (!m) return [];
    tokens.push({
      type: 'footnote.reference.end',
      position: m.position
    });

    jump(tokens[0].position.start);

    return tokens;
  }

  const tokFootnote = (): FootnoteReference => {
    const m = match(/^\[fn:(\w+)\]/);
    if (m) {
      return {
        type: 'footnote.reference',
        label: m.captures[1],
        position: m.position,
        children: [],
      }
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

  const tryToTokens = (tok: () => Token[]) => {
    const tokens = tok()
    if (tokens.length === 0) return false
    cleanup()
    _tokens.push(...tokens)
    jump(tokens[tokens.length - 1].position.end)
    cursor = { ...now() }
    return true
  }

  const tryTo = (tok: () => PhrasingContent) => {
    return tryToTokens(() => {
      const r = tok();
      return r ? [r] : [];
    });
  }

  const cleanup = () => {
    if (isGreaterOrEqual(cursor, now())) return
    const position = { start: { ...cursor }, end: { ...now() } }
    const value = substring(position)
    _tokens.push({
      type: 'text.plain',
      value,
      position,
    })
  }

  const tokNewline = (): Newline => {
    const save = { ...now() };
    const newline = eat('char');
    jump(save);
    if (newline.value === '\n') {
      return {
        type: 'newline',
        position: newline.position,
      };
    }
  }

  const tok = () => {
    if (isGreaterOrEqual(now(), end)) {
      return;
    }
    const char = getChar()

    if (ignoring.includes(char)) {
      return [];
    }

    if (char === '[') {
      if (tryTo(tokLink)) return tok()
      if (tryTo(tokFootnote)) return tok()
      if (tryToTokens(tokFootnoteAnonOrInline)) return tok();
    }

    if (MARKERS[char]) {
      const pre = getChar(-1)
      if (now().column === 1 || /[\s({'"]/.test(pre)) {
        if (tryTo(tokStyledText(char))) return tok()
      }
    }

    if (tryTo(tokNewline)) return tok()

    eat()
    tok()
  }

  tok()
  cleanup()
  return _tokens

}
