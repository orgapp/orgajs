import { Literal as UnistLiteral, Node, Parent as UnistParent } from 'unist';

type Content =
  | Section

export interface Parent extends UnistParent {
  children: Parent[];
  parent?: Parent;
}

interface Timestamp {
  date: Date;
  end?: Date;
}

interface Document extends Parent {
  type: 'document';
}

interface Section extends Parent {
  type: 'section';
}

interface Headline extends Parent {
  type: 'headline';
  level: number;
}


interface Paragraph extends Parent {
  type: 'paragraph';
}

interface Literal extends UnistLiteral {
  value: string;
}

export type Token =
  | Keyword
  | Todo
  | SimpleToken
  | Stars
  | Priority
  | Tags
  | PlanningKeyword
  | PlanningTimestamp
  | ListItemTag
  | ListItemCheckbox
  | ListItemBullet
  | PhrasingContent
  | FootnoteLabel
  | BlockBegin
  | DrawerBegin
  | BlockEnd
  | Comment

export type PhrasingContent =
  | StyledText | Link | Footnote

export interface StyledText extends Node {
  type:
    | 'text.plain'
    | 'text.bold'
    | 'text.verbatim'
    | 'text.italic'
    | 'text.strikeThrough'
    | 'text.underline'
    | 'text.code'
}

interface SimpleToken extends Node {
  type:
    | 'newline'
    | 'hr'
}

interface Link extends Node {
  type: 'text.link';
  uri: string;
  description: string;
}

interface Footnote extends Node {
  type: 'text.footnote';
  label: string;
}

// headline tokens
interface Stars extends Node {
  type: 'stars';
  level: number;
}

interface Todo extends Node {
  type: 'todo';
  keyword: string;
  actionable: boolean;
}

interface Priority extends Literal {
  type: 'priority';
  value: string;
}

interface Tags extends Node {
  type: 'tags';
  tags: string[];
}

// block tokens
interface BlockBegin extends Node {
  type: 'block.begin';
  params: string[];
}

interface BlockEnd extends Node {
  type: 'block.end' | 'drawer.end';
}

// drawer tokens
interface DrawerBegin extends Node {
  type: 'drawer.begin';
  name: string;
}

interface Comment extends Literal {
  type: 'comment';
}

interface Keyword extends Node {
  type: 'keyword';
  key: string;
  value: string;
}

interface FootnoteLabel extends Node {
  type: 'footnote.label';
}

interface PlanningKeyword extends Node {
  type: 'planning.keyword';
  keyword: string;
}

interface PlanningTimestamp extends Node {
  type: 'planning.timestamp';
  timestamp: Timestamp;
}

interface ListItemTag extends Literal {
  type: 'list.item.tag';
}

interface ListItemCheckbox extends Node {
  type: 'list.item.checkbox';
  checked: boolean;
}

interface ListItemBullet extends Node {
  type: 'list.item.bullet';
  ordered: boolean;
  indent: number;
}
