import { push, setChildren } from '../node'
import { Lexer } from '../tokenize'
import { Headline } from '../types'
import utils, * as ast from './utils'
import {
  eat as eatTok,
  matching,
  tokenValued,
} from './utils';
import parseSection from './section';

export default function parseHeadline(minDepth: number = 0) {
  return (lexer: Lexer): Headline | undefined => {

    const { eat, eatAll } = lexer
    const { returning, tryMany, tryTo } = utils(lexer)

    const stars = returning(tryTo(matching(eatTok('stars'), t => t.level >= minDepth)))();
    if (!stars) {
      // need stars with a depth greater than (or equal to) the minimum
      return;
    }
    const headline = ast.heading(stars.level, '', { position: stars.position });

    tryTo(eatTok('todo'))(t => {
      headline.keyword = t.keyword
      headline.actionable = t.actionable
    });

    // actual title
    tryMany(tokenValued())(t => {
      headline.content += t.value
    });

    tryTo(eatTok('tags'))(t => {
      headline.tags = t.tags
    });

    // newline that ends the heading line
    eat('newline');

    // these belong to the heading line
    eatAll('newline');

    //tryTo(parseSection())(s => push(headline)(s));
    tryTo(parseSection())(n => setChildren(headline)([n]));
    tryMany(parseHeadline(headline.level + 1))(push(headline));
    return headline;
  };
}
