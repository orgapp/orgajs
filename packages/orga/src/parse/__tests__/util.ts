/**
 * Utilities for testing the parser.
 */


import {
  Position
} from 'unist';

import {
  Block,
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

import { tokenize } from '../../tokenize'
import { parse } from '../index'


type Extra<ASTElem extends Node, Keys extends keyof ASTElem = 'type'> = Partial<Omit<ASTElem, Keys | 'type'>>;
type ExtraP<ASTElem extends Parent, Keys extends keyof ASTElem = 'type' | 'children'> = Extra<ASTElem, Keys | 'children'>;


export const testParse = (testName: string, text: string, ...expected: Parameters<typeof document>) => {
  it(testName, () => {
    expect(parse(tokenize(text))).toMatchObject(document(...expected));
  });
}

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

/** Build an AST {@link Block} object. */
export const block = (name: string, value: string, extra: Extra<Block, 'name' | 'value'> = {}): Block => ({
  type: 'block',
  name: name,
  value: value,
  params: [],
  attributes: {},
  ...extra
});

/** Build an AST plain text object. */
export const text = (text: string, extra: Extra<StyledText, 'value'> = {}): StyledText & { type: 'text.plain' } => ({
  type: 'text.plain',
  value: text,
  ...extra
});

/** Footnote reference has empty `children`. */
export type FootnoteRef = FootnoteReference & { children: [] };
/** Inline footnote has non-empty `children`. */
export type FootnoteInline = FootnoteReference & { children: [FootnoteReference['children'][0], ...FootnoteReference['children']] };
/** Anonymous footnote has non-empty `children` and empty `label`. */
export type FootnoteAnon = FootnoteReference & { children: [FootnoteReference['children'][0], ...FootnoteReference['children']], label: '' };

/** Build an AST object for a footnote reference. */
export const footnoteReference = (label: string, extra: ExtraP<FootnoteRef, 'label'> = {}): FootnoteRef => ({
  type: 'footnote.reference',
  label: label,
  children: [] as [],
  ...extra
});

/** Build an AST object for an inline footnote reference which defines a footnote. */
export const inlineFootnote = (label: string, children: FootnoteInline['children'], extra: ExtraP<FootnoteInline, 'label'> = {}): FootnoteInline => ({
  type: 'footnote.reference',
  label: label,
  children: children,
  ...extra
});

/** Build an AST object for an anonymous inline footnote reference. */
export const anonFootnote = (children: FootnoteAnon['children'], extra: ExtraP<FootnoteAnon, 'label'> = {}): FootnoteAnon => ({
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
