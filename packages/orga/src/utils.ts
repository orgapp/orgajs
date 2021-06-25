import { Token } from './types'
import { PhrasingContent } from 'orga';

const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g

export const escape = (str: string): string => {
  return str.replace(matchOperatorsRe, '\\$&')
}

export const isPhrasingContent = (token: Token): token is PhrasingContent => {
  return token.type.startsWith('text.')
    || token.type === 'footnote.reference'
    || token.type === 'link'
}
