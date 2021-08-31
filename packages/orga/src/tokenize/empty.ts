import { Reader } from 'text-kit'
import { Token } from '../types'

export default ({
  isStartOfLine,
  match,
  endOfLine,
  jump,
  eat,
}: Reader): Token | void => {
  if (!isStartOfLine()) return
  const m = match(/^\s*$/, { end: endOfLine() })
  if (!m) return
  jump(m.position.end)
  return {
    type: 'emptyLine',
    position: m.position,
  }
}
