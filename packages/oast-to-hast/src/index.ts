import { Comment, Element, Properties, Root, Text, Literal } from 'hast'
import { Node } from 'unist'
import { Attributes, Document, Section } from 'orga'
import u from 'unist-builder'
import handlers, { Handler } from './handlers'
import { all as _all } from './transform'

// the raw type is used to pass literal html directly
// it's useful for things like code block with syntax highlight
// or html exports. but it's not offically part of hast
// it's more of a convention for plugins to pass html through
// see details here: https://github.com/syntax-tree/hast/issues/20
interface Raw extends Literal {
  type: 'raw'
}

interface JSX extends Literal {
  type: 'jsx'
}
export type HNode = Element | Comment | Text | Raw | JSX

const defaultOptions = {
  excludeTags: ['noexport'],
  selectTags: [] as string[],
  highlight: true,
  attributes: {} as Attributes,
  properties: {} as Properties,
  handlers: {} as Record<string, Handler>,
  defaultHandler: (element: string) => handlers[element],
  headingOffset: 0,
}

export type Options = typeof defaultOptions

const build = ({
  tagName,
  properties,
  children = [],
}: {
  tagName: string
  properties?: Properties
  children?: Array<HNode>
}): Element => {
  return {
    type: 'element',
    tagName,
    properties,
    children: children as Element['children'],
  }
}

const h =
  (tagName: string, properties: Properties | undefined = undefined) =>
  (...children: HNode[]): HNode => {
    return build({
      tagName,
      properties,
      children,
    })
  }

export interface Context extends Options {
  data: any
  all: <C extends Context>(nodes: Node[], context: C) => HNode[]
  h: typeof h
  u: typeof u
}

export { Handler }

export default (
  oast: Document | Section,
  options: Partial<Options> = {}
): Root => {
  // TODO: get metadata

  const context: Context = {
    ...defaultOptions,
    data: {},
    h,
    u,
    ...options,
    handlers: { ...handlers, ...options.handlers },
    all: function (nodes, context) {
      return _all(context)(nodes)
    },
  }

  const extractTags = (value: string | string[] | undefined) => {
    if (!value) return []
    if (Array.isArray(value)) {
      return value.reduce((all, v) => all.concat(extractTags(v)), [])
    }
    return value
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean)
  }

  context.excludeTags = extractTags(oast.properties['exclude_tags'])
  context.selectTags = extractTags(oast.properties['select_tags'])
  const children = _all(context)(oast.children) as Root['children']

  return u('root', { data: oast.properties }, children)
}
