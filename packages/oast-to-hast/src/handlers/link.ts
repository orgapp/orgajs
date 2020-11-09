import mime from 'mime'
import { Link, Paragraph } from 'orga'
import { Context, HNode } from '../'

export default (context: Context) => (node: Link): HNode => {
  const { h, u, properties } = context
  const { value, description } = node

  const type = mime.getType(value)
  if (type && type.startsWith('image')) {
    const p = node.parent as Paragraph
    return h('figure')(
      h('img', { src: node.value, ...properties })(),
      h('figcaption')(
        u('text', p.attributes['caption'] as string || description || '')
      )
    )
  }

  return h('a', { href: value })(
    u('text', description || value)
  )
}
