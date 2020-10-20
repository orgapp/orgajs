import { Block } from 'orga'
import { Context, HNode } from '../'
import highlight from './_highlight'

export default (context: Context) => (node: Block): HNode => {

  const { h, u } = context

  const name = node.name.toLowerCase()

  if (name === 'src') {
    let body: HNode = u('text', node.value)
    const lang = node.params[0]
    if (lang && context.highlight) {
      body = u('raw', highlight(lang, node.value))
    }
    return h('pre')(
      h('code', { className: [`language-${lang}`] })(
        body
      )
    )
  }

  switch(name) {
    case 'quote':
      return h('blockquote')(
        u('text', node.value)
      )
    case 'center':
      return h('center')(
        u('text', node.value)
      )
    case 'export':
      return u('raw', node.value)
    case 'comment':
    default:
      return h('pre', { className: [name] })(
        u('text', node.value))
  }
}
