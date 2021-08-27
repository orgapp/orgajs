import { Block } from 'orga'
import { Context, HNode } from '../'
import parseHTML from './_parseHTML'

export default (node: Block, context: Context) => {
  const { h, u } = context

  const name = node.name.toLowerCase()

  if (name === 'src') {
    const body: HNode = u('text', node.value)
    const lang = node.params[0]
    return h('pre')(h('code', { className: [`language-${lang}`] })(body))
  }

  switch (name) {
    case 'quote':
      return h('blockquote')(u('text', node.value))
    case 'center':
      return h('center')(u('text', node.value))
    case 'export':
      if (node.params[0].toLowerCase() === 'html') {
        return parseHTML(node.value, context)
      }
      return u((node.params[0] || 'raw').toLowerCase(), node.value)
    case 'comment':
      return undefined
    default:
      return h('pre', { className: [name] })(u('text', node.value))
  }
}
