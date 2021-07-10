import { Literal as UnistLiteral, Node as UnistNode, Parent as UnistParent, Position } from 'unist'
import { Char } from './char';

import {
  Timestamp
} from './tokenize/types';

export {
  Token
} from './tokenize/types';

export type { Timestamp };

export interface Node extends UnistNode {
  position: Position;
}

// ---- Basic Types ----
export interface Parent extends Node, Omit<UnistParent, 'position'> {
  children: Child[];
}

export interface Child<T extends Parent = Parent> extends Node {
  parent?: T | T & Child | undefined;
}

export type Primitive = string | number | boolean

export interface Attributes {
  [key: string]: Primitive | { [key: string]: Primitive },
}

export interface Attributed {
  attributes: Attributes
}

// ---- Syntax Tree Nodes ----
export interface Document extends Parent {
  type: 'document';
  properties: { [key: string]: string; };
  children: [Section, ...Headline[]] | Headline[];
}

export interface Section extends Child<Document | Headline>, Parent {
  type: 'section';
  properties: { [key: string]: string; };
  children: Content[];
  // v2021.07.03 - "Only a headline can contain a section. As an
  // exception, text before the first headline in the document also
  // belongs to a section."
  parent?: Document | Headline | undefined;
}

export type Content =
  | Footnote
  | Paragraph
  | Block
  | VerseBlock
  | Drawer
  | GreaterBlock
  | SpecialBlock
  | Planning
  | List
  | Table
  | HorizontalRule
  | HTML

export interface Footnote extends Child, Parent {
  type: 'footnote';
  label: string;
  // v2021.07.03 - "CONTENTS can contain any element excepted another
  // footnote definition. It ends at the next footnote definition, the
  // next headline, two consecutive empty lines or the end of buffer."
  children: Exclude<Content, Footnote>[];
}

export interface Block extends Literal, Child, Attributed {
  type: 'block';
  name: 'COMMENT' | 'EXAMPLE' | 'EXPORT' | 'SRC';
  params: string[];
}

export interface VerseBlock extends Parent, Child, Attributed {
  type: 'verse_block';
  params: string[];
  children: PhrasingContent[];
}

export interface GreaterBlock extends Parent, Child, Attributed {
  type: 'greater_block';
  name: 'CENTER' | 'QUOTE';
  params: string[];
}

export interface SpecialBlock extends Parent, Child, Attributed {
  type: 'special_block';
  name: string;
  params: string[];
}

export interface Drawer extends Child, Literal {
  type: 'drawer';
  name: string;
}

export interface Planning extends Child {
  type: 'planning';
  keyword: string;
  timestamp: Timestamp;
}

export interface List extends Parent, Child, Attributed {
  type: 'list';
  indent: number;
  ordered: boolean;
  // "A plain list is a set of consecutive items of the same indentation. It can only directly contain items."
  children: ListItem[];
}

type TableContent = TableRow | TableRule

export interface Table extends Parent, Child, Attributed {
  type: 'table';
  children: TableContent[];
}

export interface TableRow extends Parent, Child<Table> {
  type: 'table.row';
  children: TableCell[];
}

export interface TableCell extends Parent, Child<TableRow> {
  type: 'table.cell';
  children: PhrasingContent[];
}

export interface ListItem extends Parent, Child<List> {
  type: 'list.item';
  indent: number;
  tag?: string;
}

export interface Headline extends Parent, Child<Document | Headline> {
  type: 'headline';
  level: number;
  keyword?: string;
  actionable: boolean;
  priority?: Char;
  content: string;
  tags?: string[];
  // v2021.07.03 - "A headline contains directly one section
  // (optionally), followed by any number of deeper level headlines."
  children: [Section, ...Headline[]] | Headline[];
}

export interface Paragraph extends Parent, Child, Attributed {
  type: 'paragraph';
  children: PhrasingContent[];
}

export interface Literal extends Omit<UnistLiteral, 'position'>, Node {
  value: string;
}

export interface HTML extends Child, Literal {
  type: 'html';
}

export type PhrasingContent =
  | StyledText | Link | FootnoteReference | Newline

export interface HorizontalRule extends Child {
  type: 'hr'
}

export interface Newline extends Child {
  type: 'newline'
}

export interface StyledText extends Literal, Child<Paragraph> {
  type:
  | 'text.plain'
  | 'text.bold'
  | 'text.verbatim'
  | 'text.italic'
  | 'text.strikeThrough'
  | 'text.underline'
  | 'text.code'
}

export interface Link extends Literal, Child<Paragraph> {
  type: 'link';
  protocol: string | undefined;
  description: string | undefined;
  search?: string | number | undefined;
  parent?: Paragraph | undefined;
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
export interface FootnoteReference extends Parent, Child<Paragraph> {
  type: 'footnote.reference';
  label: string;
  children: PhrasingContent[];
}

export interface TableRule extends Child<Table> {
  type: 'table.hr';
}
