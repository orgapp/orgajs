import { Comment, Element, Properties, Root, Text, Literal } from 'hast'
import { Attributes, Document, Section } from 'orga'
import u from 'unist-builder'
import handlers, { Handler } from './handlers'
import { all } from './transform'

// the raw type is used to pass literal html directly
// it's useful for things like code block with syntax highlight
// or html exports. but it's not offically part of hast
// it's more of a convention for plugins to pass html through
// see details here: https://github.com/syntax-tree/hast/issues/20
interface Raw extends Literal {
  type: 'raw'
}
export type HNode = Element | Comment | Text | Raw

const defaultOptions = {
  excludeTags: ['noexport'],
  selectTags: [] as string[],
  highlight: true,
  attributes: {} as Attributes,
  properties: {} as Properties,
  handlers: {} as Record<string, Handler>,
  defaultHandler: (element: string) => handlers[element],
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
  }

  const eTags = oast.properties['exclude_tags']
  if (eTags) {
    context.excludeTags = eTags
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean)
  }

  const sTags = oast.properties['select_tags']
  if (sTags) {
    context.selectTags = sTags
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean)
  }
  const children = all(context)(oast.children) as Root['children']

  return u('root', { data: oast.properties }, children)
}
