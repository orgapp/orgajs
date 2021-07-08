import { Node, Literal as UnistLiteral } from 'unist';
import { Char } from '../char';

export interface TokenI extends Node {
  _text?: string | undefined;
}

export interface TokenLiteral extends TokenI, UnistLiteral {
  value: string;
}

export interface Stars extends TokenI {
  type: 'stars';
  level: number;
}

export interface Todo extends TokenI {
  type: 'todo';
  keyword: string;
  actionable: boolean;
}

export interface Keyword extends TokenLiteral {
  type: 'keyword';
  key: string;
}

export interface Newline extends TokenI {
  type: 'newline'
}

export interface HorizontalRule extends TokenI {
  type: 'hr'
}

export interface Priority extends TokenLiteral {
  type: 'priority';
  value: Char;
}

export interface Tags extends TokenI {
  type: 'tags';
  tags: string[];
}

export interface PlanningKeyword extends TokenLiteral {
  type: 'planning.keyword';
}

export interface PlanningTimestamp extends TokenI {
  type: 'planning.timestamp';
  value: Timestamp;
}

export interface Timestamp {
  date: Date;
  end?: Date;
}

export interface ListItemTag extends TokenLiteral {
  type: 'list.item.tag';
}

export interface ListItemCheckbox extends TokenI {
  type: 'list.item.checkbox';
  checked: boolean;
}

export interface ListItemBullet extends TokenI {
  type: 'list.item.bullet';
  ordered: boolean;
  indent: number;
}

export interface TableRule extends TokenI {
  type: 'table.hr';
}

export interface TableColumnSeparator extends TokenI {
  type: 'table.columnSeparator';
}

export interface FootnoteLabel extends TokenI {
  type: 'footnote.label';
  label: string;
}

export interface FootnoteInlineBegin extends TokenI {
  type: 'footnote.inline.begin';
  label: string;
}

export interface FootnoteReferenceEnd extends TokenI {
  type: 'footnote.reference.end';
}

export interface BlockBegin extends TokenI {
  type: 'block.begin';
  name: string;
  params: string[];
}

export interface BlockEnd extends TokenI {
  type: 'block.end';
  name: string;
}

export interface DrawerBegin extends TokenI {
  type: 'drawer.begin';
  name: string;
}

export interface DrawerEnd extends TokenI {
  type: 'drawer.end';
}

export interface Comment extends TokenLiteral {
  type: 'comment';
}

export interface StyledText extends TokenLiteral {
  type:
  | 'text.plain'
  | 'text.bold'
  | 'text.verbatim'
  | 'text.italic'
  | 'text.strikeThrough'
  | 'text.underline'
  | 'text.code'
}

export interface Link extends TokenLiteral {
  type: 'link';
  protocol: string;
  description: string;
  search?: string | number;
}

export interface FootnoteReference extends TokenI {
  type: 'footnote.reference';
  label: string;
}

export type Token =
  | Keyword
  | Todo
  | Newline
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
  | StyledText
  | Link
  | FootnoteReference
  | FootnoteLabel
  | FootnoteInlineBegin
  | FootnoteReferenceEnd
  | BlockBegin
  | BlockEnd
  | DrawerBegin
  | DrawerEnd
  | Comment
