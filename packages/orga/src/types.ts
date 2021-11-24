import { Literal as UnistLiteral, Node, Parent } from 'unist'

export { Parent }

export type Primitive = string | number | boolean

export interface Attributes {
  [key: string]: Primitive | { [key: string]: Primitive }
}

export interface Attributed {
  attributes: Attributes
}

export interface Timestamp {
  date: Date
  end?: Date
}

type PropertyValue = string

// ---- Syntax Tree Nodes ----
export interface Document extends Parent {
  type: 'document'
  properties: Record<string, PropertyValue | PropertyValue[]>
  children: TopLevelContent[]
}

export interface Section extends Parent {
  type: 'section'
  level: number
  properties: { [key: string]: string }
  children: Content[]
}

type TopLevelContent = Content | Keyword | Footnote

type Content =
  | Section
  | Paragraph
  | Block
  | Drawer
  | Planning
  | List
  | Table
  | HorizontalRule
  | Headline
  | HTML

export interface Footnote extends Parent {
  type: 'footnote'
  label: string
}

export interface Block extends Literal, Attributed {
  type: 'block'
  name: string
  params: string[]
  value: string
}

export interface Latex extends Literal {
  type: 'latex'
  name: string
  value: string
}

export interface Drawer extends Literal {
  type: 'drawer'
  name: string
  value: string
}

export interface Planning extends Node {
  type: 'planning'
  keyword: string
  timestamp: Timestamp
}

export interface List extends Parent, Attributed {
  type: 'list'
  indent: number
  ordered: boolean
  children: (List | ListItem)[]
}

type TableContent = TableRow | TableRule

export interface Table extends Parent, Attributed {
  type: 'table'
  children: TableContent[]
}

export interface TableRow extends Parent {
  type: 'table.row'
  children: TableCell[]
}

export interface TableCell extends Parent {
  type: 'table.cell'
  children: PhrasingContent[]
}

export interface ListItem extends Parent {
  type: 'list.item'
  indent: number
  tag?: string
}

export interface Headline extends Parent {
  type: 'headline'
  level: number
  keyword?: string
  actionable: boolean
  priority?: string
  tags?: string[]
}

export interface Paragraph extends Parent, Attributed {
  type: 'paragraph'
  children: PhrasingContent[]
}

interface Literal extends UnistLiteral {
  value: string
}

export interface HTML extends Literal {
  type: 'html'
}

// ---- Tokens ----
export type Token =
  | Keyword
  | Todo
  | Newline
  | EmptyLine
  | HorizontalRule
  | Stars
  | Priority
  | Tags
  | PlanningKeyword
  | PlanningTimestamp
  | ListItemTag
  | ListItemCheckbox
  | ListItemBullet
  | TableRule
  | TableColumnSeparator
  | PhrasingContent
  | FootnoteLabel
  | BlockBegin
  | BlockEnd
  | LatexBegin
  | LatexEnd
  | DrawerBegin
  | DrawerEnd
  | Comment
  | Opening
  | Closing
  | LinkPath

export type PhrasingContent = Text | Link | FootnoteReference | Newline

export interface HorizontalRule extends Node {
  type: 'hr'
}

export interface Newline extends Node {
  type: 'newline'
}

export interface EmptyLine extends Node {
  type: 'emptyLine'
}

export type Style =
  | 'bold'
  | 'verbatim'
  | 'italic'
  | 'strikeThrough'
  | 'underline'
  | 'code'
  | 'math'

export interface Text extends Literal {
  type: 'text'
  style?: Style
}

export interface Link extends Parent, Attributed {
  type: 'link'
  path: LinkInfo
  children: PhrasingContent[]
}

interface LinkInfo {
  protocol: string
  value: string
  search?: string | number
}

export interface LinkPath extends Literal, LinkInfo {
  type: 'link.path'
}

export type Enclosed = Style | 'link' | 'footnote.reference'

export interface Opening extends Node {
  type: 'opening'
  element: Enclosed
}

export interface Closing extends Node {
  type: 'closing'
  element: Enclosed
}

/**
 * A footnote reference, which is either:
 *
 * `[fn:LABEL]` - a plain footnote reference.
 *
 * `[fn:LABEL:DEFINITION]` - an inline footnote definition.
 *
 * `[fn::DEFINITION]` - an anonymous (inline) footnote definition.
 *
 * See https://orgmode.org/worg/dev/org-syntax.html#Footnote_References.
 *
 * If `label` is the empty string, then this is treated as an
 * anonymous footnote.
 *
 * If `children` is empty, then this is considered to not define a new
 * footnote (and in which case, `label` should not be the empty
 * string), if `children` is non-empty, then this is an inline
 * footnote definition.
 */
export interface FootnoteReference extends Parent {
  type: 'footnote.reference'
  label: string
  children: PhrasingContent[]
}

// headline tokens
export interface Stars extends Node {
  type: 'stars'
  level: number
}

export interface Todo extends Node {
  type: 'todo'
  keyword: string
  actionable: boolean
}

export interface Priority extends Literal {
  type: 'priority'
  value: string
}

export interface Tags extends Node {
  type: 'tags'
  tags: string[]
}

// block tokens
export interface BlockBegin extends Node {
  type: 'block.begin'
  name: string
  params: string[]
}

export interface BlockEnd extends Node {
  type: 'block.end'
  name: string
}

// drawer tokens
export interface DrawerBegin extends Node {
  type: 'drawer.begin'
  name: string
}

interface DrawerEnd extends Node {
  type: 'drawer.end'
}

export interface LatexBegin extends Node {
  type: 'latex.begin'
  name: string
}

export interface LatexEnd extends Node {
  type: 'latex.end'
  name: string
}

interface Comment extends Literal {
  type: 'comment'
}

export interface Keyword extends Node {
  type: 'keyword'
  key: string
  value: string
}

export interface FootnoteLabel extends Node {
  type: 'footnote.label'
  label: string
}

export interface PlanningKeyword extends Literal {
  type: 'planning.keyword'
  value: string
}

export interface PlanningTimestamp extends UnistLiteral {
  type: 'planning.timestamp'
  value: Timestamp
}

export interface ListItemTag extends Literal {
  type: 'list.item.tag'
}

export interface ListItemCheckbox extends Node {
  type: 'list.item.checkbox'
  checked: boolean
}

export interface ListItemBullet extends Node {
  type: 'list.item.bullet'
  ordered: boolean
  indent: number
}

export interface TableRule extends Node {
  type: 'table.hr'
}

export interface TableColumnSeparator extends Node {
  type: 'table.columnSeparator'
}
