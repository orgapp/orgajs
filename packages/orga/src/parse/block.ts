import { Position } from 'unist'
import { Block, GreaterBlock, Section, SpecialBlock, VerseBlock } from '../types'
import { Lexer } from '../tokenize'
import parseParagraph from './paragraph';
import parseSection from './section';
import { push } from '../node';

export default function parseBlock(lexer: Lexer): Block | GreaterBlock | SpecialBlock | VerseBlock | undefined {

  const { peek, eat, substring } = lexer

  const begin = peek()

  if (!begin || begin.type !== 'block.begin') return undefined

  // const a = push(block)
  // a(n)
  eat(); // consume the block beginning
  let contentStart = begin.position.end
  const nl = eat('newline') // consume any whitespace before content
  if (nl) {
    contentStart = nl.position.end
  }
  eat('newline')

  const range: Position = {
    start: contentStart,
    end: begin.position.end,
  }

  /*
   * find the indentation of the block and apply it to
   * the rest of the block.
   *
   * The indentation of the first non-blank line is used as standard.
   * The following lines use the lesser one between its own
   * indentation and the standard. Leading and trailing blank lines
   * are omitted.
   */
  const align = (content: string) => {
    let indent = -1
    return content.trimRight().split('\n').map(line => {
      const _indent = line.search(/\S/)
      if (indent === -1) {
        indent = _indent
      }
      if (indent === -1) return ''
      return line.substring(Math.min(_indent, indent))
    }).join('\n')
  }

  const parseBlockContents = (block: Block): Block | undefined => {
    const n = peek()
    if (!n || n.type === 'stars') return undefined
    eat()
    if (n.type === 'block.end' && n.name.toLowerCase() === begin.name.toLowerCase()) {
      range.end = n.position.start
      eat('newline')
      block.value = align(substring(range))
      block.position.end = n.position.end
      return block
    }
    return parseBlockContents(block)
  }

  const parseVerseBlockContents = (block: VerseBlock): VerseBlock | undefined => {
    // paragraphs parse pretty much the expected content of a verse, so
    // we piggy back the paragraph parser for now (2021-07-03)
    const contents = parseParagraph(lexer, {
      maxEOL: Infinity,
      nonObjectTextRendered: true,
      breakOn: t => t.type === 'block.end' && t.name.toLowerCase() === begin.name.toLowerCase()
    })?.children ?? [];
    contents.forEach(push(block));

    const end = peek();
    if (!end) return undefined;
    if (end.type === 'block.end' && end.name.toLowerCase() === begin.name.toLowerCase()) {
      eat();
      eat('newline');
      range.end = end.position.start;
      block.position.end = end.position.end;
      return block;
    }
  }

  const parseGreaterOrSpecialBlockContents = <T extends GreaterBlock | SpecialBlock>(block: T): T | undefined => {
    const n = peek()
    if (!n || n.type === 'stars') return undefined
    const root: Section = { type: 'section', level: 1, children: [], properties: {} };

    // sections parse pretty much the expected content of a block, so
    // we piggy back the section parser for now (2021-07-03)
    const contents = parseSection(lexer)(root, { breakOn: t => t.type === 'block.end' && t.name.toLowerCase() === begin.name.toLowerCase() })?.children ?? [];
    contents.forEach(push(block));

    const end = peek();
    if (!end) return undefined;
    if (end.type === 'block.end' && end.name.toLowerCase() === begin.name.toLowerCase()) {
      eat();
      eat('newline');
      range.end = n.position.start;
      block.position.end = n.position.end;
      return block;
    }
  }
  const parseGreaterBlockContents: (block: GreaterBlock) => GreaterBlock = parseGreaterOrSpecialBlockContents;
  const parseSpecialBlockContents: (block: SpecialBlock) => SpecialBlock = parseGreaterOrSpecialBlockContents;

  const nameUpper = begin.name.toUpperCase();

  if (nameUpper === 'QUOTE' || nameUpper === 'CENTER') {
    const block: GreaterBlock = {
      type: 'greater_block',
      name: nameUpper,
      params: begin.params,
      position: begin.position,
      children: [],
      attributes: {},
    }
    return parseGreaterBlockContents(block);
  } else if (nameUpper === 'COMMENT' || nameUpper === 'EXAMPLE' || nameUpper === 'EXPORT' || nameUpper === 'SRC') {
    // block elements
    const block: Block = {
      type: 'block',
      name: nameUpper,
      params: begin.params,
      position: begin.position,
      value: '',
      attributes: {},
    }
    return parseBlockContents(block)
  } else if (nameUpper === 'VERSE') {
    // verse blocks
    const block: VerseBlock = {
      type: 'verse_block',
      params: begin.params,
      position: begin.position,
      children: [],
      attributes: {},
    }
    return parseVerseBlockContents(block)
  } else {
    // special blocks
    const block: SpecialBlock = {
      type: 'special_block',
      name: nameUpper,
      params: begin.params,
      position: begin.position,
      children: [],
      attributes: {},
    }
    return parseSpecialBlockContents(block)
  }

}
