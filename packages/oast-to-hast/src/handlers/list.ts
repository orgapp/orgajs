import { Properties } from 'hast'
import { List, ListItem, ListItemCheckbox } from 'orga'
import { Context } from '../'
import { all } from '../transform'

/* Transform a list. */
export default (node: List, context: Context) => {
  const { h } = context

  let tagName = node.ordered ? 'ol' : 'ul'
  if (node.children.every((i) => i['tag'])) {
    tagName = 'dl'
  }
  return h(
    tagName,
    node.attributes.attr_html as Properties
  )(...all(context)(node.children))
}

export const item = (node: ListItem, context: Context) => {
  const { h, u } = context
  if (node.tag) {
    return h('div')(
      h('dt')(u('text', node.tag)),
      h('dd')(...all(context)(node.children))
    )
  }
  return h('li')(...all(context)(node.children))
}

export const checkbox = (node: ListItemCheckbox, { h }: Context) => {
  return h('input', {
    type: 'checkbox',
    checked: node.checked,
    disabled: true,
  })()
}
