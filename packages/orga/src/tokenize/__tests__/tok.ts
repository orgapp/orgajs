import { read } from 'text-kit'
import { ParseOptions } from '../../options'
import { tokenize } from '../index'

export default (text: string, options: Partial<ParseOptions> = {}) => {
  const { substring } = read(text)
  const tokens = tokenize(text, options).all()
  return tokens.map(({ position, ...token }) => ({
    ...token,
    _text: substring(position.start, position.end),
  }))
}
