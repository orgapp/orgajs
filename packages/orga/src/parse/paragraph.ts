import { push } from '../node'
import { Paragraph, Token } from '../types'
import * as ast from './utils';
import { Lexer } from '../tokenize';
import phrasingContent from './phrasingContent';
import utils from './utils';
import { Position } from 'unist';

const isWhitespaces = (node: Paragraph['children'][number]) => {
  return node.type === 'text.plain' && node.value.trim().length === 0
}

export default function paragraph(lexer: Lexer, opts?: Partial<{ breakOn: (t: Token) => boolean; maxEOL: number }>): Paragraph | undefined {
  const { peek, eat } = lexer;
  const breakOn = opts?.breakOn ?? (_t => false);
  const maxEOL = opts?.maxEOL ?? 2;
  let eolCount = 0

  const { tryTo } = utils(lexer);

  const createParagraph = (start: Position): Paragraph => ast.paragraph([], { position: start });

  const build = (p?: Paragraph): Paragraph | undefined => {
    const token = peek()
    if (!token || eolCount >= maxEOL) {
      return p
    }
    if (breakOn(token)) {
      return p;
    }

    if (token.type === 'newline') {
      eat()
      eolCount += 1
      p = p ?? createParagraph(token.position)
      push(p)(ast.text(' ', { position: token.position }));
      return build(p)
    }

    if (tryTo(phrasingContent)(phras => {
      p = p ?? createParagraph(phras.position)
      push(p)(phras)
      eolCount = 0
    })) {
      return build(p);
    }
    return p
  }

  const p = build()
  if (!p) return undefined
  // trim whitespaces
  while (p.children.length > 0) {
    const children = p.children as [(typeof p)['children'][number], ...(typeof p)['children'][number][]];
    if (isWhitespaces(children[children.length - 1])) {
      p.children.pop()
      continue
    }
    if (isWhitespaces(children[0])) {
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
