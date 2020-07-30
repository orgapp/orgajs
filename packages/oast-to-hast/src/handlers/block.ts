import { Element, Node } from 'hast'
import u from 'unist-builder'
import highlight from './_highlight'
import { Block } from 'orga'
import { _all, HNode } from '../transform'
import { Context } from '../'

const a = (h, node) => {
  const name = node.name.toUpperCase()
  switch(name) {
  case `SRC`:
    return src(h, node)
  case `QUOTE`:
    return quote(h, node)
  case `COMMENT`:
    return undefined
  case `CENTER`:
    return center(h, node)
  default:
    const props = { className: name.toLowerCase() }
    return h(node, `pre`, props, [u('text', node.value || '')])
  }
}

function quote(h, node) {
  return h(node, `blockquote`, [u(`text`, node.value)])
}

function center(h, node) {
  return h(node, `center`, [u(`text`, node.value)])
}

function src(h, node) {
  const lang = node.params[0].toLowerCase()
  const props: any = {}
  if (lang) {
    props.className = ['language-' + lang]
  }

  const code = node.value

  let body = u(`text`, code)
  if (h.highlight) {
    const highlighted = highlight(lang, code)
    body = u(`raw`, highlighted)
  }

  return h(node, `pre`, [
    h(node, `code`, props, [body])
  ])
}

export default (context: Context) => (node: Block): HNode => {

  const e = (tagName: string) => (...children: HNode[]): HNode => {
    return context.build({
      tagName,
      children,
    })
  }

  if (node.name.toLowerCase() === 'src') {

    return e('pre')(
      e('code')(
        u('text', node.value)
      )
    )
  }
  return undefined
}
