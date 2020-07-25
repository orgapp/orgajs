import { Literal as UnistLiteral, Node, Parent as UnistParent } from 'unist';

interface Token extends Node {
}

type Content =
  | Section

interface Parent extends UnistParent {
  children: Parent[];
  parent?: Parent;
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

interface Text extends Literal {
  type: 'text.plain';
}

interface Bold extends Literal {
  type: 'text.bold';
}
