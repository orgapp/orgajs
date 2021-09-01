import { Reader } from 'text-kit'
import { Token } from '../types'

export default ({ eat }: Reader): Token | void => {
  const hr = eat(/^\s*-{5,}\s*$/my)
  if (hr) {
    return {
      type: 'hr',
      position: hr.position,
    }
  }
}
