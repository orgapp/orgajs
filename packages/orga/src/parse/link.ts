import { Link } from '../types'
import { Lexer } from '../tokenize';

export default (lexer: Lexer): Link | undefined => {
  const { eat } = lexer;
  return eat('link');
};
