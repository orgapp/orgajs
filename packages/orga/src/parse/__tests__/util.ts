/**
 * Utilities for testing the parser.
 */


import {
  Position
} from 'unist';

import {
  Block,
  Document,
  GreaterBlock,
  Headline,
  Footnote,
  FootnoteReference,
  Node,
  Paragraph,
  Parent,
  Section,
  SpecialBlock,
  StyledText,
  VerseBlock,
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

export const testParseSection = (testName: string, text: string, ...expected: Parameters<typeof section>) => {
  testParse(testName, text, [section(...expected)]);
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
export const block = (name: Block['name'], value: string, extra: Extra<Block, 'name' | 'value'> = {}): Block => ({
  type: 'block',
  name: name,
  value: value,
  params: [],
  attributes: {},
  ...extra
});

/** Build an AST {@link VerseBlock} object. */
export const verseBlock = (children: VerseBlock['children'], extra: ExtraP<VerseBlock> = {}): VerseBlock => ({
  type: 'verse_block',
  params: [],
  attributes: {},
  children,
  ...extra
});

/** Build an AST {@link GreaterBlock} object. */
export const greaterBlock = (name: GreaterBlock['name'], children: GreaterBlock['children'], extra: ExtraP<GreaterBlock, 'name'> = {}): GreaterBlock => ({
  type: 'greater_block',
  name,
  params: [],
  attributes: {},
  children,
  ...extra
});

/** Build an AST {@link SpecialBlock} object. */
export const specialBlock = (name: SpecialBlock['name'], children: SpecialBlock['children'], extra: ExtraP<SpecialBlock, 'name'> = {}): SpecialBlock => ({
  type: 'special_block',
  name,
  params: [],
  attributes: {},
  children,
  ...extra
});

/** Build an AST {@link StyledText} object. */
export const styledText = <TextTy extends StyledText['type']>(type: TextTy) => (text: string, extra: Extra<StyledText, 'value'> = {}): StyledText & { type: TextTy } => ({
  type: type,
  value: text,
  ...extra
});

/** Build an AST plain text object. */
export const text = styledText('text.plain');

/** Build an AST text bold object. */
export const textBold = styledText('text.bold');

/** Build an AST text strikethrough object. */
export const textStrikethrough = styledText('text.strikeThrough');

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

/** Build an AST {@link Footnote} object. */
export const footnote = (label: string, children: Footnote['children'], extra: ExtraP<Footnote, 'label'> = {}): Footnote => ({
  type: 'footnote',
  label: label,
  children,
  ...extra
});

/** Build an AST object for a {@link Headline}. */
export const headline = (level: number, content: string, children: Headline['children'], extra: ExtraP<Headline, 'level' | 'content'> = {}): Headline => ({
  type: 'headline',
  level: level,
  actionable: false,
  content: content,
  children,
  ...extra
});

/** Build an AST object for a {@link Headline} with no body. */
export const heading = (level: number, content: string, extra: ExtraP<Headline, 'level' | 'content'> = {}): Headline => headline(level, content, [], extra);

/** Build an AST object for a {@link Section}. */
export const section = (children: Section['children'], extra: ExtraP<Section> = {}): Section => ({
  type: 'section',
  properties: {},
  children,
  ...extra
});

/** Build an object position. */
export const pos = ([startLine, startCol]: [number, number], [endLine, endCol]: [number, number], indent?: number[]): Position => ({
  start: { line: startLine, column: startCol }, end: { line: endLine, column: endCol }, ...(indent !== undefined ? { indent: indent } : {})
});
