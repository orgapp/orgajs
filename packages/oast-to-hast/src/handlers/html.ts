import { HTML } from 'orga'
import { Context, HNode } from '../'

export default (context: Context) =>
  (node: HTML): HNode => {
    const { u } = context
    return u('raw', node.value)
  }
