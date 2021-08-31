import { Reader } from 'text-kit'
import { Token } from '../types'

export default (reader: Reader): Token | void => {
  const keyword = reader.match(/#\+(\w+):\s*([^\n]*)$/my)
  if (keyword) {
    reader.eat('line')
    return {
      type: 'keyword',
      key: keyword.result[1],
      value: keyword.result[2],
      position: keyword.position,
    }
  }
}
