import { read } from 'text-kit'
import { LexerOptions, withDefault } from '../../options'
import { tokenize } from '../index'

export default (text: string, options: Partial<LexerOptions> = {}) => {
  const { substring } = read(text)
  const tokens = tokenize(text, withDefault(options)).all()
  return tokens.map(({ position, ...token }) => ({
    ...token,
    _text: substring(position.start, position.end),
  }))
}
