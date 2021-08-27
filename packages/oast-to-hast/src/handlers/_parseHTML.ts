import { Root } from 'hast'
import fromParse5 from 'hast-util-from-parse5'
import parse5 from 'parse5'
import { Context, HNode } from '../'

export default (html: string, { h }: Context) => {
  const ast = parse5.parseFragment(html)
  const hast = fromParse5(ast) as Root
  return h('div')(...(hast.children as HNode[]))
}
