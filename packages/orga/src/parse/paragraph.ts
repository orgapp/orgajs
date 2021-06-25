import { push } from '../node'
import { FootnoteAnonymous, FootnoteInline, Paragraph, PhrasingContent, Token } from '../types'
import { isPhrasingContent } from '../utils'
import { Lexer } from '../tokenize';

type FootnoteInlineOrAnon = FootnoteInline | FootnoteAnonymous;

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

    function readAFootnote(par: Paragraph | FootnoteInlineOrAnon = p): PhrasingContent | undefined {
      const begins = ['footnote.inline.begin', 'footnote.anonymous.begin'];
      if (begins.includes(token.type)) {
        eat();
        const fn: FootnoteInlineOrAnon =
        {
          children: [],
          ...(token.type === 'footnote.inline.begin'
            ? { type: 'footnote.inline', label: token.label }
            : { type: 'footnote.anonymous' })
        };
        let inner: Token;
        while (inner = peek()) {
          if (begins.includes(inner.type)) {
            // nested footnote reference
            readAFootnote(fn);
          } else if (inner.type === 'footnote.reference.end') {
            eat();
            push(par)(fn);
            eolCount = 0;
            return fn;
          } else if (isPhrasingContent(inner)) {
            eat();
            fn.children.push(inner);
          } else {
            return undefined;
          }
        }
      }
    }

    if (readAFootnote()) {
      return build(p);
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
