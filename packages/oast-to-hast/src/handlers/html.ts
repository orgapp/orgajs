import { HTML } from 'orga'
import { Context } from '../'
import parseHTML from './_parseHTML'

export default (node: HTML, context: Context) => {
  return parseHTML(node.value, context)
}
