import { Lexer } from '../tokenize'
import { StyledText } from '../types'
import { isStyledText } from '../utils';

export default (lexer: Lexer): StyledText | undefined => {
  const { peek, eat } = lexer

  const token = peek()

  if (token && isStyledText(token)) {
    eat()
    return token;
  }
}
