import { push } from '../node'
import { Paragraph, PhrasingContent, Token } from '../types'
import { isPhrasingContent } from '../utils'
import { Lexer } from '../tokenize';

const isWhitespaces = node => {
  return node.type === 'text.plain' && node.value.trim().length === 0
}

export default function paragraph(lexer: Lexer): Paragraph | undefined {
  const { peek, eat } = lexer;
  let eolCount = 0

  const createParagraph = (): Paragraph => ({
    type: 'paragraph',
    children: [],
    attributes: {},
  })


  const build = (p: Paragraph = undefined): Paragraph | undefined => {
    const token = peek()
    if (!token || eolCount >= 2) {
      return p
    }

    if (token.type === 'footnote.inline.begin' || token.type === 'footnote.anonymous.begin') {
      eat();
      const children: PhrasingContent[] = [];
      let inner: Token;
      while (inner = eat()) {
        if (inner.type === 'footnote.reference.end') {
          push(p)({ children: children, ...(token.type === 'footnote.inline.begin' ? { type: 'footnote.inline', label: token.label } : { type: 'footnote.anonymous' }) });
          eolCount = 0;
          return build(p);
        } else if (isPhrasingContent(inner)) {
          children.push(inner);
        } else {
          return undefined;
        }
      }
    }

    if (token.type === 'newline') {
      eat()
      eolCount += 1
      p = p || createParagraph()
      push(p)({ type: 'text.plain', value: ' ', position: token.position })
      return build(p)
    }

    if (isPhrasingContent(token)) {
      p = p || createParagraph()
      push(p)(token)
      eat()
      eolCount = 0
      return build(p)
    }
    return p
  }

  const p = build()
  if (!p) return undefined
  // trim whitespaces
  while (p.children.length > 0) {
    if (isWhitespaces(p.children[p.children.length - 1])) {
      p.children.pop()
      continue
    }
    if (isWhitespaces(p.children[0])) {
      p.children.slice(1)
      continue
    }
    break
  }

  if (p.children.length === 0) {
    return undefined
  }

  return p

}
