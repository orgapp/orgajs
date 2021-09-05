import { Handler } from 'oast-to-hast'
import { Link } from 'orga'

const handleLink: Handler = (node: Link, context) => {
  const { h, all, defaultHandler } = context
  if (node.path.protocol === 'file' && node.path.value.endsWith('.org')) {
    return h('Link', {
      href: node.path.value.replace(/\.org$/, ''),
    })(...all(node.children, context))
  }
  return defaultHandler(node.type)
}

export default handleLink
