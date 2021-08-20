import { Paragraph, Primitive } from 'orga'
import { Context } from '../'
import { all } from '../transform'

export default (node: Paragraph, context: Context) => {
  const { h } = context

  const properties = node.attributes.attr_html as { [key: string]: Primitive }

  return h(
    'p',
    properties
  )(
    ...all({
      ...context,
      attributes: { ...node.attributes },
      properties,
    })(node.children)
  )
}
