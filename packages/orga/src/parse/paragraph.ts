import { push } from '../node'
import { FootnoteReference, Paragraph, PhrasingContent, Token } from '../types'
import { isStyledText } from '../utils';
import * as ast from './utils';
import { Lexer } from '../tokenize';

const isWhitespaces = (node: Token) => {
  return node.type === 'text.plain' && node.value.trim().length === 0
}

export default function paragraph(lexer: Lexer, opts?: Partial<{ breakOn: (t: Token) => boolean; maxEOL: number }>): Paragraph | undefined {
  const { peek, eat } = lexer;
  const breakOn = opts?.breakOn ?? (_t => false);
  const maxEOL = opts?.maxEOL ?? 2;
  let eolCount = 0

  const createParagraph = (): Paragraph => ast.paragraph([]);

  const build = (p: Paragraph = undefined): Paragraph | undefined => {
    const token = peek()
    if (!token || eolCount >= maxEOL) {
      return p
    }
    if (breakOn(token)) {
      return p;
    }

    const phrasingContent = (): PhrasingContent | undefined => {
      const token = peek();
      if (token.type === 'footnote.reference') {
        return {
          ...token,
          children: [],
        };
      }
      if (token.type === 'link') {
        return token;
      }
      if (isStyledText(token)) {
        return token;
      }
    };

    function readAFootnote(par: Paragraph | FootnoteReference = p): PhrasingContent | undefined {
      if (token.type === 'footnote.inline.begin') {
        eat();
        const fn = ast.inlineFootnotePartial(token.label, []);
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
          } else {
            const phras = phrasingContent();
            if (phras) {
              eat();
              push(fn)(phras);
            } else {
              return undefined;
            }
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
      push(p)(ast.text(' ', { position: token.position }));
      return build(p)
    }

    const phras = phrasingContent();

    if (phras) {
      eat();
      p = p || createParagraph()
      push(p)(phras)
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
