import { Position } from 'unist'
import { Block, GreaterBlock, Section } from '../types'
import { Lexer } from '../tokenize'
import parseSection from './section';

export default function parseBlock(lexer: Lexer): Block | GreaterBlock | undefined {

  const { peek, eat, substring } = lexer

  const begin = peek()

  if (!begin || begin.type !== 'block.begin') return undefined

  // const a = push(block)
  // a(n)
  eat()
  let contentStart = begin.position.end
  const nl = eat('newline')
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

  const parseGreaterBlockContents = (block: GreaterBlock): GreaterBlock | undefined => {
    const n = peek()
    if (!n || n.type === 'stars') return undefined
    const root: Section = { type: 'section', level: 1, children: [], properties: {} };
    // sections parse pretty much the expected content of a block, so
    // we piggy back the section parser for now (2021-07-03)
    const contents = parseSection(lexer)(root, { breakOn: t => t.type === 'block.end' && t.name.toLowerCase() === begin.name.toLowerCase() });
    const end = peek();
    block.children.push(...contents.children);
    if (!end) return undefined;
    if (end.type === 'block.end' && end.name.toLowerCase() === begin.name.toLowerCase()) {
      eat();
      eat('newline');
      range.end = n.position.start;
      block.position.end = n.position.end;
      return block;
    }
  }

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
  } else {
    const block: Block = {
      type: 'block',
      name: begin.name,
      params: begin.params,
      position: begin.position,
      value: '',
      attributes: {},
    }
    return parseBlockContents(block)
  }

}
