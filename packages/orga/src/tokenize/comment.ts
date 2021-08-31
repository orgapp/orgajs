import { Reader } from 'text-kit'
import { Token } from '../types'

export default ({ match, eat }: Reader): Token | void => {
  if (match(/^#\s/y)) {
    const comment = match(/^#\s+(.*)$/my)
    if (comment) {
      eat('line')
      return {
        type: 'comment',
        position: comment.position,
        value: comment.result[1],
      }
    }
  }
}
