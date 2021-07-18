import { Lexer } from '../tokenize'
import { PhrasingContent, StyledText } from '../types'
import utils, { complexTextMarkup, manyEndBy, oneOf, simpleStyledText, text } from './utils';
import phrasingContent from './phrasingContent';

const MARKERS = {
  '*': 'text.bold',
  '/': 'text.italic',
  '+': 'text.strikeThrough',
  '_': 'text.underline',
} as const;

export default (lexer: Lexer): StyledText | undefined => {
  const { peek, eat } = lexer
  const { returning, tryTo } = utils(lexer);

  const token = peek()

  if (token) {
    if (token.type === 'text.plain' || token.type === 'text.code' || token.type === 'text.verbatim') {
      // simple cases - these cannot contain objects
      eat();
      return simpleStyledText(token.type)(token.value, { position: token.position })
    } else if (token.type === 'token.complexStyleChar') {
      // "CONTENTS can contain any object encountered in a paragraph
      // when markup is “bold”, “italic”, “strike-through” or
      // “underline”." - spec v2021.07.03
      eat();
      const matchChar = token.char;
      const newline = () => {
        const token = peek();
        if (token && token.type === 'newline') {
          eat();
          return (text(' ', { position: token.position }));
        }
      };
      const phrasingContentOrNewline = oneOf([newline, phrasingContent]);
      const toks = returning(tryTo(manyEndBy(phrasingContentOrNewline, () => {
        const t = peek();
        if (t && t.type === 'token.complexStyleChar' && t.char === matchChar) {
          eat();
          return t;
        }
      })))();
      if (!toks) return;
      const toksButLast = toks.slice(0, toks.length - 1) as PhrasingContent[];
      return complexTextMarkup(MARKERS[matchChar])(toksButLast, { position: { start: token.position.start, end: toks[toks.length - 1].position.end } });
    }
  }
}
