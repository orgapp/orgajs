import mime from 'mime'
import { Link, Paragraph } from 'orga'
import { Context, HNode } from '../'

export default (context: Context) =>
  (node: Link): HNode => {
    const { h, u, properties } = context
    const { value, description } = node

    const type = mime.getType(value)
    if (type && type.startsWith('image')) {
      let cap: string | undefined
      if ('parent' in node) {
        const p = node['parent'] as Paragraph
        cap = (p.attributes['caption'] as string) || description
      }

      let image = h('img', { src: node.value, ...properties })()
      if (cap && cap.length > 0) {
        image = h('figure')(image, h('figcaption')(u('text', cap)))
      }
      return image
    }

    return h('a', { href: value })(u('text', description || value))
  }
