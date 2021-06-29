/**
 * Utilities for testing the parser.
 */


import {
  Position
} from 'unist';

import {
  Document,
  Headline,
  FootnoteReference,
  Node,
  Paragraph,
  Parent,
  Section,
  Stars,
  StyledText,
} from '../../types';


type Extra<ASTElem extends Node, Keys extends keyof ASTElem = 'type'> = Partial<Omit<ASTElem, Keys | 'type'>>;
type ExtraP<ASTElem extends Parent, Keys extends keyof ASTElem = 'type' | 'children'> = Extra<ASTElem, Keys | 'children'>;


/** Build an AST {@link Document} object. */
export const document = (children: Document['children'], extra: ExtraP<Document> = {}): Document => ({
  type: 'document',
  children: children,
  properties: {},
  ...extra
});

/** Build an AST {@link Paragraph} object. */
export const paragraph = (children: Paragraph['children'], extra: ExtraP<Paragraph> = {}): Paragraph => ({
  type: 'paragraph',
  children: children,
  attributes: {},
  ...extra
});

/** Build an AST plain text object. */
export const text = (text: string, extra: Extra<StyledText, 'value'> = {}): StyledText & { type: 'text.plain' } => ({
  type: 'text.plain',
  value: text,
  ...extra
});

/** Build an AST object for a footnote reference. */
export const footnoteReference = (label: string, extra: ExtraP<FootnoteReference, 'label'> = {}): FootnoteReference => ({
  type: 'footnote.reference',
  label: label,
  children: [],
  ...extra
});

/** Build an AST object for an inline footnote reference which defines a footnote. */
export const inlineFootnote = (label: string, children: FootnoteReference['children'], extra: ExtraP<FootnoteReference, 'label'> = {}): FootnoteReference => ({
  type: 'footnote.reference',
  label: label,
  children: children,
  ...extra
});

/** Build an AST object for an anonymous inline footnote reference. */
export const anonFootnote = (children: FootnoteReference['children'], extra: ExtraP<FootnoteReference, 'label'> = {}): FootnoteReference => ({
  type: 'footnote.reference',
  label: '',
  children: children,
  ...extra
});

/** Build an AST object for a {@link Headline}. */
export const headline = (level: number, content: string, extra: ExtraP<Headline, 'level' | 'content'> = {}): Headline => ({
  type: 'headline',
  level: level,
  actionable: false,
  content: content,
  children: [{
    type: 'stars',
    level: level
  } as Stars, text(content),
  { type: 'newline' }],
  ...extra
});

/** Build an AST object for a {@link Section}. */
export const section = (level: number, headingContent: string, sectionBody: Section['children'], extra: ExtraP<Section, 'level'> = {}): Section => ({
  type: 'section',
  level: level,
  properties: {},
  children: [headline(level, headingContent), ...sectionBody],
  ...extra
});

/** Build an object position. */
export const pos = ([startLine, startCol]: [number, number], [endLine, endCol]: [number, number], indent?: number[]): Position => ({
  start: { line: startLine, column: startCol }, end: { line: endLine, column: endCol }, ...(indent !== undefined ? { indent: indent } : {})
});
