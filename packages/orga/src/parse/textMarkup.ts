import { Lexer } from '../tokenize'
import { StyledText } from '../types'
import { isStyledText } from '../utils';

export default (lexer: Lexer): StyledText | undefined => {
  const { peek, eat } = lexer

  const token = peek()

  if (isStyledText(token)) {
    eat()
    return token;
  } else {
    return undefined;
  }
}
