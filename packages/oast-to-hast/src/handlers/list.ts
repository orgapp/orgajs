import { List, ListItem, ListItemCheckbox } from 'orga'
import { Context, HNode } from '../'
import { _all } from '../transform'

/* Transform a list. */
export default (context: Context) => (node: List): HNode => {
  const { h } = context

  let tagName = node.ordered ? 'ol' : 'ul'
  if (node.children.every(i => i.tag)) {
    tagName = 'dl'
  }
  return h(tagName)(..._all(context)(node.children))
}

export const item = (context: Context) => (node: ListItem): HNode => {
  const { h, u } = context
  if (node.tag) {
    return h('div')(
      h('dt')(u('text', node.tag)),
      h('dd')(..._all(context)(node.children)),
    )
  }
  return context.build({
    tagName: 'li',
    children: _all(context)(node.children) })
}

export const checkbox = (context: Context) => (node: ListItemCheckbox): HNode => {
  return context.build({
    tagName: 'input',
    properties: {
      type: 'checkbox',
      checked: node.checked,
      disabled: true,
    }})
}
