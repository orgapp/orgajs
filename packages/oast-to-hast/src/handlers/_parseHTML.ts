import { Root } from 'hast'
import { fromParse5 } from 'hast-util-from-parse5'
import { parseFragment } from 'parse5'
import { Context, HNode } from '../'

export default (html: string, { h }: Context) => {
  const ast = parseFragment(html)
  const hast = fromParse5(ast) as Root
  return h('div')(...(hast.children as HNode[]))
}
