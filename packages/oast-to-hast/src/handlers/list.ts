import { List, ListItem, ListItemCheckbox } from 'orga'
import { Context, HNode } from '../'
import { all } from '../transform'
import { Properties } from 'hast'

/* Transform a list. */
export default (context: Context) => (node: List): HNode => {
  const { h } = context

  let tagName = node.ordered ? 'ol' : 'ul'
  if (node.children.every(i => i.tag)) {
    tagName = 'dl'
  }
  return h(tagName, node.attributes.attr_html as Properties)(
    ...all(context)(node.children))
}

export const item = (context: Context) => (node: ListItem): HNode => {
  const { h, u } = context
  if (node.tag) {
    return h('div')(
      h('dt')(u('text', node.tag)),
      h('dd')(...all(context)(node.children)),
    )
  }
  return h('li')(
    ...all(context)(node.children)
  )
}

export const checkbox = ({ h }: Context) => (node: ListItemCheckbox): HNode => {
  return h('input', {
    type: 'checkbox',
    checked: node.checked,
    disabled: true,
  })()
}
