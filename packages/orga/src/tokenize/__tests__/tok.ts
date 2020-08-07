import { read } from "text-kit"
import { ParseOptions } from '../../options'
import { tokenize } from "../index"

export default (text: string, options: ParseOptions = undefined) => {
  const { substring } = read(text);
  const tokens = tokenize(text, options).all();
  return tokens.map(({ position, ...token }) => ({
    ...token,
    _text: substring(position),
  }))
}
