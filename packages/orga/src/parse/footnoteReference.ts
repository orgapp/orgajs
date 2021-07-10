import { push } from '../node'
import { FootnoteReference, Token } from '../types'
import * as ast from './utils';
import { Lexer } from '../tokenize';
import phrasingContent from './phrasingContent';
import utils from './utils';

export default function footnoteReference(lexer: Lexer): FootnoteReference | undefined {
  const { eat, peek } = lexer;

  const { tryTo } = utils(lexer);

  const token = peek();
  if (token && token.type === 'footnote.reference') {
    eat();
    return {
      ...token,
      children: [],
    };
  }

  const readAFootnote = (par?: FootnoteReference): FootnoteReference | undefined => {
    const token = peek();
    if (token && token.type === 'footnote.inline.begin') {
      eat();
      const fn = ast.inlineFootnotePartial(token.label, [], { position: token.position });
      let inner: Token | undefined;
      while (inner = peek()) {
        if (inner.type === 'footnote.inline.begin') {
          // nested footnote reference
          readAFootnote(fn);
        } else if (inner.type === 'footnote.reference.end') {
          eat();
          if (par) push(par)(fn);
          return fn;
        } else {
          if (!tryTo(phrasingContent)(phras => {
            push(fn)(phras);
          })) {
            return undefined;
          }
        }
      }
    }
  }
  return readAFootnote();
}
