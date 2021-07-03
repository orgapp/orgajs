import { push } from '../node'
import { FootnoteReference, Paragraph, PhrasingContent, Token } from '../types'
import { isPhrasingContent } from '../utils'
import { tokenToText } from './utils';
import { Lexer } from '../tokenize';

const isWhitespaces = (node: Token) => {
  return node.type === 'text.plain' && node.value.trim().length === 0
}

export default function paragraph(lexer: Lexer, opts?: Partial<{ breakOn: (t: Token) => boolean; maxEOL: number; nonObjectTextRendered: boolean }>): Paragraph | undefined {
  const { peek, eat } = lexer;
  const breakOn = opts?.breakOn ?? (_t => false);
  const maxEOL = opts?.maxEOL ?? 2;
  const nonObjectTextRendered = opts?.nonObjectTextRendered ?? false;
  let eolCount = 0

  const createParagraph = (): Paragraph => ({
    type: 'paragraph',
    children: [],
    attributes: {},
  })


  const build = (p: Paragraph = undefined): Paragraph | undefined => {
    const token = peek()
    if (!token || eolCount >= maxEOL) {
      return p
    }
    if (breakOn(token)) {
      return p;
    }

    function readAFootnote(par: Paragraph | FootnoteReference = p): PhrasingContent | undefined {
      if (token.type === 'footnote.inline.begin') {
        eat();
        const fn: FootnoteReference =
        {
          children: [],
          type: 'footnote.reference',
          label: token.label,
        };
        let inner: Token;
        while (inner = peek()) {
          if (inner.type === 'footnote.inline.begin') {
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
    } else if (nonObjectTextRendered) {
      // for things like verse blocks, where we have a definitive end, we just render other tokens as text
      p = p || createParagraph()
      push(p)(tokenToText(lexer, token));
      eat();
      eolCount = 0;
      return build(p);
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
