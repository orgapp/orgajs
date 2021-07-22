import { Literal } from 'hast'
import u from 'unist-builder'
import { Context, HNode } from '../'

type Handler = (context: Context) => (node: Literal) => HNode

const wrap = (tagName: string): Handler => {
  return ({ h }) =>
    (node: Literal) =>
      h(tagName)(u('text', node.value))
}

export const bold = wrap('strong')
export const italic = wrap('i')
export const code = wrap('code')
export const verbatim = wrap('code')
export const underline = wrap('u')
export const strikeThrough = wrap('del')
