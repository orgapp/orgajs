import { push, setChildren } from '../node'
import { Lexer } from '../tokenize'
import { Document } from '../types'
import utils, * as ast from './utils'
import parseHeadline from './headline';
import parseSection from './section';

export default (lexer: Lexer): Document => {
  const { tryTo } = utils(lexer)

  const doc = ast.document([]);

  tryTo(parseSection())(n => setChildren(doc)([n]));
  while (tryTo(parseHeadline())(push(doc))) { };

  return doc;
}
