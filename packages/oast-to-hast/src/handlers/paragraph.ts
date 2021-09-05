import { Paragraph, Primitive } from 'orga'
import { Context } from '../'

export default (node: Paragraph, context: Context) => {
  const { h, all } = context

  const properties = node.attributes.attr_html as { [key: string]: Primitive }

  return h(
    'p',
    properties
  )(
    ...all(node.children, {
      ...context,
      attributes: { ...node.attributes },
      properties,
    })
  )
}
