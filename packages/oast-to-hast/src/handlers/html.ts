import { HTML } from 'orga'
import { Context } from '../'

export default (node: HTML, context: Context) => {
  const { u } = context
  return u('raw', node.value)
}
