import { PhrasingContent } from '../types'
import { Lexer } from '../tokenize';
import link from './link';
import utils from './utils';
import footnoteReference from './footnoteReference';
import textMarkup from './textMarkup';

export default (lexer: Lexer): PhrasingContent | undefined => {
  const { tryTo } = utils(lexer);

  let res: PhrasingContent;
  if (tryTo(footnoteReference)(c => { res = c })) {
    return res;
  }
  if (tryTo(link)(c => { res = c })) {
    return res;
  }
  if (tryTo(textMarkup)(c => { res = c })) {
    return res;
  }
};
