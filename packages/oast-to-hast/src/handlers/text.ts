import { Element } from 'hast'
import { Literal } from 'unist'
import u from 'unist-builder'
import { Context } from '../'

type Handler = (context: Context) => (node: Literal) => Element

const wrap = (tagName: string): Handler => {
  return ({ build }) => (node) => build({
    tagName,
    children: [u('text', node.value)],
  })
}

export const bold = wrap('strong')
export const italic = wrap('i')
export const code = wrap('code')
export const verbatim = wrap('code')
export const underline = wrap('u')
export const strikeThrough = wrap('del')
