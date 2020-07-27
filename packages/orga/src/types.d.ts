import { Literal as UnistLiteral, Node, Parent as UnistParent } from 'unist';

// ---- Basic Types ----
export interface Parent extends UnistParent {
  parent?: Parent;
}

export interface Timestamp {
  date: Date;
  end?: Date;
}

// ---- Syntax Tree Nodes ----
export interface Document extends Parent {
  type: 'document';
  children: TopLevelContent[];
}

export interface Section extends Parent {
  type: 'section';
  headline: Headline;
  children: Content[];
}

type TopLevelContent =
  | Content | keyword | Footnote

type Content =
  | Section
  | Paragraph
  | Block
  | Drawer
  | Planning
  | List
  | HorizontalRule
  | Headline

export interface Footnote extends Parent {
  type: 'footnote';
  label: string;
}

export interface Block extends Parent {
  type: 'block';
  params: string[];
}

export interface Drawer extends Parent {
  type: 'drawer';
  name: string;
}

export interface Planning extends Parent {
  type: 'planning';
}

export interface List extends Parent {
  type: 'list';
  indent: number;
  ordered: boolean;
}

export interface ListItem extends Parent {
  type: 'list.item';
  indent: number;
}

export interface Headline extends Parent {
  type: 'headline';
  level: number;
  todo?: {
    keyword: string;
    actionable: boolean;
  };
  priority?: string;
  tags?: string[];
}


export interface Paragraph extends Parent {
  type: 'paragraph';
  children: PhrasingContent[];
}

interface Literal extends UnistLiteral {
  value: string;
}

// ---- Tokens ----
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
  | PhrasingContent
  | FootnoteLabel
  | BlockBegin
  | DrawerBegin
  | BlockEnd
  | Comment

export type PhrasingContent =
  | StyledText | Link | FootnoteReference

interface HorizontalRule extends Node {
  type: 'hr'
}

interface Newline extends Node {
  type: 'newline'
}

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

interface Link extends Node {
  type: 'link';
  uri: string;
  description: string;
}

interface FootnoteReference extends Node {
  type: 'footnote.reference';
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

export interface Keyword extends Node {
  type: 'keyword';
  key: string;
  value: string;
}

interface FootnoteLabel extends Node {
  type: 'footnote.label';
  label: string;
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

export interface ListItemBullet extends Node {
  type: 'list.item.bullet';
  ordered: boolean;
  indent: number;
}
