module.exports = root

import u from 'unist-builder'
import { all } from '../transform'

function root(h, node) {
  return u('root', all(h, node))
}
