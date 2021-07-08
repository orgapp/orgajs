import { Position } from 'unist';
import { push } from '../node'
import { Lexer } from '../tokenize'
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
} from '../types';


export default (lexer: Lexer) => {
  const { peek, eat, save, restore } = lexer
  const collect = (stop: (n: Token) => boolean) => (container: Parent): Parent => {
    const token = peek()
    if (!token || stop(token)) return container
    eat()
    push(container)(token)
    return collect(stop)(container)
  }

  const skip = (predicate: (token: Token) => boolean): void => {
    const token = peek()
    if (token && predicate(token)) {
      eat()
      skip(predicate)
      return
    }
    return
  }

  const tryTo = <T>(parse: (lexer: Lexer) => T | undefined) => (...actions: ((node: T) => void)[]): boolean => {
    const savePoint = save()
    const node = parse(lexer)
    if (!node) {
      restore(savePoint)
      return false
    }
    actions.forEach(action => action(node))
    return true
  }

  return {
    collect,
    skip,
    tryTo,
  }
}

export function tokenToText(lexer: Lexer, t: Token): StyledText & { type: 'text.plain' } {
  const { substring } = lexer;
  return {
    type: 'text.plain',
    value: substring(t.position),
    position: t.position,
  };
}


/**
 * Helpers for building AST components.
 */


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

/** Build an AST text code object. */
export const textCode = styledText('text.code');

/** Build an AST text italic object. */
export const textItalic = styledText('text.italic');

/** Build an AST text strikethrough object. */
export const textStrikethrough = styledText('text.strikeThrough');

/** Build an AST text underline object. */
export const textUnderline = styledText('text.underline');

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

/** Build an AST object for an anonymous inline footnote reference. */
export const inlineFootnotePartial = (label: string, children: FootnoteReference['children'], extra: ExtraP<FootnoteReference, 'label'> = {}): FootnoteReference => ({
  type: 'footnote.reference',
  label,
  children,
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

/** Build an AST {@link Drawer} object. */
export const drawer = (name: string, value: string, extra: Extra<Drawer, 'name' | 'value'> = {}): Drawer => ({
  type: 'drawer',
  name,
  value,
  ...extra
});

/** Build an AST {@link Link} object. */
export const link = (value: string, extra: Extra<Link, 'value'> = {}): Link => ({
  type: 'link',
  value,
  protocol: value.indexOf(':') !== -1 ? value.split(':')[0] : undefined,
  description: undefined,
  ...extra
});

/** Build an AST {@link List} object. */
export const list = (indent: number, ordered: boolean, children: List['children'], extra: ExtraP<List, 'indent' | 'ordered'> = {}): List => ({
  type: 'list',
  indent,
  ordered,
  children,
  attributes: {},
  ...extra
});

/** Build an AST {@link ListItem} object. */
export const listItem = (indent: number, children: ListItem['children'], extra: ExtraP<ListItem, 'indent'> = {}): ListItem => ({
  type: 'list.item',
  indent,
  children,
  ...extra
});

/** Build an AST {@link Planning} object. */
export const planning = (keyword: string, timestamp: Timestamp, extra: Extra<Planning, 'keyword' | 'timestamp'> = {}): Planning => ({
  type: 'planning',
  keyword,
  timestamp,
  ...extra
});

/** Build an AST {@link HTML} object. */
export const html = (value: string, extra: Extra<HTML, 'value'> = {}): HTML => ({
  type: 'html',
  value,
  ...extra
});

/** Build an AST {@link Table} object. */
export const table = (children: Table['children'], extra: ExtraP<Table> = {}): Table => ({
  type: 'table',
  children,
  attributes: {},
  ...extra
});

/** Build an AST {@link TableRow} object. */
export const tableRow = (children: TableRow['children'], extra: ExtraP<TableRow> = {}): TableRow => ({
  type: 'table.row',
  children,
  ...extra
});

/** Build an AST {@link TableCell} object. */
export const tableCell = (children: TableCell['children'], extra: ExtraP<TableCell> = {}): TableCell => ({
  type: 'table.cell',
  children,
  ...extra
});

/** Build an object position. */
export const pos = ([startLine, startCol]: [number, number], [endLine, endCol]: [number, number], indent?: number[]): Position => ({
  start: { line: startLine, column: startCol }, end: { line: endLine, column: endCol }, ...(indent !== undefined ? { indent: indent } : {})
});
