import mime from 'mime'
import { Link } from 'orga'
import { Context, HNode } from '../'
import { all } from '../transform'

export default (node: Link, context: Context) => {
  const { h, u, properties, attributes } = context
  const { path, children } = node

  const type = mime.getType(path.value)

  let description: HNode[] = []
  if (children.length > 0) {
    description = all(context)(children)
  } else {
    description = [u('text', path.value)]
  }

  if (type && type.startsWith('image')) {
    let cap: HNode | undefined
    const c = attributes['caption'] as string
    if (c) {
      cap = h('figcaption')(u('text', c))
    } else if (children.length > 0) {
      cap = h('figcaption')(...description)
    }

    let image = h('img', { src: path.value, ...properties })()
    if (cap) {
      image = h('figure')(image, cap)
    }
    return image
  }

  return h('a', { href: path.value })(...description)
}
