import { HTML } from 'orga'
import { Context } from '../'
import parseHTML from './_parseHTML.js'

export default (node: HTML, context: Context) => {
  return parseHTML(node.value, context)
}
