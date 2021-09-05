import { Handler } from 'oast-to-hast'
import { Link } from 'orga'

const handleLink: Handler = (node: Link, context) => {
  const { h, all, defaultHandler } = context

  if (
    node.path.protocol === 'file' &&
    /\.(org|jsx?|tsx)$/.test(node.path.value)
  ) {
    return h('Link', {
      href: node.path.value.replace(/\.[^/.]+$/, ''),
    })(...all(node.children, context))
  }
  return defaultHandler(node.type)
}

export default handleLink
