import u from 'unist-builder'
import { all } from '../transform'

export default (h, node) => {
  return u('root', all(h, node))
}
