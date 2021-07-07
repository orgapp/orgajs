import * as tok from './tokenize/types';

const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g

export const escape = (str: string): string => {
  return str.replace(matchOperatorsRe, '\\$&')
}

export const isStyledText = (token: tok.Token): token is tok.StyledText =>
  token.type.startsWith('text.');
