import { push, setChildren } from '../node'
import { Lexer } from '../tokenize'
import { Headline } from '../types'
import utils, * as ast from './utils'
import parseSection from './section';

export default function parseHeadline(minDepth: number = 0) {
  return (lexer: Lexer): Headline => {

    const { peek, eat, eatAll } = lexer
    const { tryTo } = utils(lexer)

    const parse = (headline: Headline): Headline => {
      let token = peek()
      if (!token) return;
      if (token && token.type === 'stars') {
        if (token.level < minDepth) {
          return;
        }
        headline.level = token.level
        eat();
        token = peek();
      } else {
        // cannot form a headline without stars
        return undefined;
      }

      if (token && token.type === 'todo') {
        headline.keyword = token.keyword
        headline.actionable = token.actionable
        eat();
        token = peek();
      }

      while (token && token && 'value' in token && token.value) {
        headline.content += token.value
        eat();
        token = peek();
      }

      if (token && token.type === 'tags') {
        headline.tags = token.tags
        eat();
      }

      // newline that ends the heading line
      eat('newline');

      // these belong to the heading line
      eatAll('newline');

      tryTo(parseSection())(n => setChildren(headline)([n]));
      while (tryTo(parseHeadline(headline.level + 1))(push(headline))) { };
      return headline;
    }

    return parse(ast.heading(-1, ''));
  }
}
