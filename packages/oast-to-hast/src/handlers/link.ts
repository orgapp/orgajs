import mime from 'mime'
import { Link } from 'orga'
import { Context, HNode } from '../'

export default (context: Context) => (node: Link): HNode => {
  const { h, u } = context
  const { value, description } = node

  const type = mime.getType(value)
  if (type && type.startsWith(`image`)) {
    return h('img', { src: value, alt: description })()
  }

  return h('a', { href: value })(
    u('text', description)
  )
}
