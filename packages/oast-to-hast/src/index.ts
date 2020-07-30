import { Element, Root, Properties } from 'hast'
import { Node, Parent } from 'unist'
import { one, _all } from './transform'
import u from 'unist-builder'

interface Options {
  excludeTags: string[];
  selectTags: string[];
}

export interface Context extends Options {
  build: (props: ElementInfo) => Element;
}

// const build: Build = ({ tagName, props, children }) => {
//   console.log('building:', tagName)

//   return {
//     type: 'element',
//     tagName,
//     properties: props,
//     children: children || [],
//   }
// }

const h = (() => {
  const _h: any = function(node, tagName, props, children) {
    if (
      (children === undefined || children === null) &&
        typeof props === 'object' &&
        'length' in props
    ) {
      children = props
      props = {}
    }

    return {
      type: 'element',
      tagName,
      properties: props || {},
      children: children || []
    }
  }

  return _h
})()


// export = function toHAST(tree, options: any = {}) {
//   const meta = tree.meta || {}
//   h.handlers = Object.assign(handlers, options.handlers || {})
//   h.footnoteSection = options.footnoteSection || `footnotes`
//   const eTags = meta.exclude_tags
//   if (eTags) {
//     h.excludeTags = eTags.split(/\s+/)
//   } else {
//     h.excludeTags = options.excludeTags || [`noexport`]
//   }
//   const sTags = meta.select_tags
//   if (sTags) {
//     h.selectTags = sTags.split(/\s+/)
//   } else {
//     h.selectTags = options.selectTags || []
//   }
//   h.highlight = options.highlight || false
//   return transform(h, tree)
// }

interface ElementInfo {
  tagName: string;
  properties?: Properties;
  children?: Element['children'];
}

const build = ({
  tagName,
  properties,
  children = [],
} : ElementInfo): Element => {
  return {
    type: 'element',
    tagName,
    properties,
    children,
  }
}

export default (oast: Parent, options: any = {}): Root => {
  // TODO: get metadata
  const context: Context = {
    excludeTags: [],
    selectTags: [],
    build,
  }
  return u('root', _all(context)(oast.children))
}
