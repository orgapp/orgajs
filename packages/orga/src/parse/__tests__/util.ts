/**
 * Utilities for testing the parser.
 */

import { tokenize } from '../../tokenize'
import { parse } from '../index'
import {
  Block,
  Document,
  Drawer,
  GreaterBlock,
  Headline,
  Footnote,
  FootnoteReference,
  HTML,
  Link,
  List,
  ListItem,
  Node,
  Paragraph,
  Parent,
  Planning,
  Section,
  SpecialBlock,
  StyledText,
  Table,
  TableCell,
  TableRow,
  Timestamp,
  Token,
  VerseBlock,
} from '../../types';
import { Position } from 'unist';

import * as ast from '../utils';

export { pos } from '../utils';

type Extra<ASTElem extends Node, Keys extends keyof ASTElem = 'type'> = Partial<Omit<ASTElem, Keys | 'type'>>;
type ExtraP<ASTElem extends Parent, Keys extends keyof ASTElem = 'type' | 'children'> = Extra<ASTElem, Keys | 'children'>;

const mkExtra = <T extends Token, N extends keyof T>(extra: Extra<T, N>): Extra<T, N> & { position: Position } => ({
  // because this is for testing, just pretend this is a position
  position: {} as Position,
  ...extra,
});

export const testParse = (testName: string, text: string, ...expected: Parameters<typeof document>) => {
  it(testName, () => {
    expect(parse(tokenize(text))).toMatchObject(document(...expected));
  });
}

export const testParseSection = (testName: string, text: string, ...expected: Parameters<typeof section>) => {
  testParse(testName, text, [section(...expected)]);
}

export const document = (children: Document['children'], extra: ExtraP<Document> = {}): Document =>
  ast.document(children, mkExtra(extra));

export const paragraph = (children: Paragraph['children'], extra: ExtraP<Paragraph> = {}): Paragraph =>
  ast.paragraph(children, mkExtra(extra));

export const block = (name: Block['name'], value: string, extra: Extra<Block, 'name' | 'value'> = {}): Block =>
  ast.block(name, value, mkExtra(extra));

export const verseBlock = (children: VerseBlock['children'], extra: ExtraP<VerseBlock> = {}): VerseBlock =>
  ast.verseBlock(children, mkExtra(extra));

export const greaterBlock = (name: GreaterBlock['name'], children: GreaterBlock['children'], extra: ExtraP<GreaterBlock, 'name'> = {}): GreaterBlock =>
  ast.greaterBlock(name, children, mkExtra(extra));

export const specialBlock = (name: SpecialBlock['name'], children: SpecialBlock['children'], extra: ExtraP<SpecialBlock, 'name'> = {}): SpecialBlock =>
  ast.specialBlock(name, children, mkExtra(extra));

export const styledText = <TextTy extends StyledText['type']>(type: TextTy) => (text: string, extra: Extra<StyledText, 'value'> = {}): StyledText & { type: TextTy } =>
  ast.styledText(type)(text, mkExtra(extra));

export const text = styledText('text.plain');

export const textBold = styledText('text.bold');

export const textCode = styledText('text.code');

export const textItalic = styledText('text.italic');

export const textStrikethrough = styledText('text.strikeThrough');

export const textUnderline = styledText('text.underline');

import { FootnoteRef, FootnoteInline, FootnoteAnon } from '../utils';

export const footnoteReference = (label: string, extra: ExtraP<FootnoteRef, 'label'> = {}): FootnoteRef =>
  ast.footnoteReference(label, mkExtra(extra));

export const inlineFootnote = (label: string, children: FootnoteInline['children'], extra: ExtraP<FootnoteInline, 'label'> = {}): FootnoteInline =>
  ast.inlineFootnote(label, children, mkExtra(extra));

export const anonFootnote = (children: FootnoteAnon['children'], extra: ExtraP<FootnoteAnon, 'label'> = {}): FootnoteAnon =>
  ast.anonFootnote(children, mkExtra(extra));

export const inlineFootnotePartial = (label: string, children: FootnoteReference['children'], extra: ExtraP<FootnoteReference, 'label'> = {}): FootnoteReference =>
  ast.inlineFootnotePartial(label, children, mkExtra(extra));

export const footnote = (label: string, children: Footnote['children'], extra: ExtraP<Footnote, 'label'> = {}): Footnote =>
  ast.footnote(label, children, mkExtra(extra));

export const headline = (level: number, content: string, children: Headline['children'], extra: ExtraP<Headline, 'level' | 'content'> = {}): Headline =>
  ast.headline(level, content, children, mkExtra(extra));

export const heading = (level: number, content: string, extra: ExtraP<Headline, 'level' | 'content'> = {}): Headline => headline(level, content, [], extra);

export const section = (children: Section['children'], extra: ExtraP<Section> = {}): Section =>
  ast.section(children, mkExtra(extra));

export const drawer = (name: string, value: string, extra: Extra<Drawer, 'name' | 'value'> = {}): Drawer =>
  ast.drawer(name, value, mkExtra(extra));

export const link = (value: string, extra: Extra<Link, 'value'> = {}): Link =>
  ast.link(value, mkExtra(extra));

export const list = (indent: number, ordered: boolean, children: List['children'], extra: ExtraP<List, 'indent' | 'ordered'> = {}): List =>
  ast.list(indent, ordered, children, mkExtra(extra));

export const listItem = (indent: number, children: ListItem['children'], extra: ExtraP<ListItem, 'indent'> = {}): ListItem =>
  ast.listItem(indent, children, mkExtra(extra));

export const planning = (keyword: string, timestamp: Timestamp, extra: Extra<Planning, 'keyword' | 'timestamp'> = {}): Planning =>
  ast.planning(keyword, timestamp, mkExtra(extra));

export const html = (value: string, extra: Extra<HTML, 'value'> = {}): HTML =>
  ast.html(value, mkExtra(extra));

export const table = (children: Table['children'], extra: ExtraP<Table> = {}): Table =>
  ast.table(children, mkExtra(extra));

export const tableRow = (children: TableRow['children'], extra: ExtraP<TableRow> = {}): TableRow =>
  ast.tableRow(children, mkExtra(extra));

export const tableCell = (children: TableCell['children'], extra: ExtraP<TableCell> = {}): TableCell =>
  ast.tableCell(children, mkExtra(extra));
