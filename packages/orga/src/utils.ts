import { Token } from '../types'

const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g

export const escape = (str: string) => {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string')
  }
  return str.replace(matchOperatorsRe, '\\$&')
}

export const isPhrasingContent = (token: Token): boolean => {
  return token.type.startsWith('text.')
    || token.type === 'footnote.reference'
    || token.type === 'link'
}
