import { Link } from '../types'
import { Lexer } from '../tokenize';

export default (lexer: Lexer): Link | undefined => {
  const { eat, peek } = lexer;

  const token = peek();
  if (token.type === 'link') {
    eat();
    return token;
  }
};
