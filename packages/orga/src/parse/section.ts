import { push, pushMany } from '../node'
import { Lexer } from '../tokenize'
import {
  Attributed,
  Attributes,
  Footnote,
  Primitive,
  Section,
  Token,
} from '../types'
import parseBlock from './block'
import parseDrawer from './drawer'
import parseList from './list'
import parseParagraph from './paragraph'
import parsePlanning from './planning'
import parseTable from './table'
import utils, * as ast from './utils'
import { tokenToText } from './utils';
import parseSymbols from './_parseSymbols'
import _primitive from './_primitive'

const AFFILIATED_KEYWORDS = ['caption', 'header', 'name', 'plot', 'results']

const attach = (attributes: Attributes) => (node: Attributed) => {
  if (Object.keys(attributes).length === 0) return
  node.attributes = { ...node.attributes, ...attributes }
}

export default function parseSection(opts?: { breakOn: (t: Token) => boolean }) {
  return (lexer: Lexer): Section | undefined => {

    const { peek, eat, eatAll, modify } = lexer
    const { tryTo } = utils(lexer)
    const breakOn = opts?.breakOn ?? ((_t: Token) => false);

    const newSection = (props: { [key: string]: string } = {}): Section | undefined => {
      const sectionContents: Section['children'] = [];
      const plannings = parsePlanning(lexer)
      sectionContents.push(...plannings);
      let sectionProps: typeof props = { ...props };

      while (tryTo(parseDrawer)(drawer => {
        if (drawer.name.toLowerCase() === 'properties') {
          sectionProps = drawer.value.split('\n').reduce((accu, current) => {
            const m = current.match(/\s*:(.+?):\s*(.+)\s*$/)
            if (m) {
              return { ...accu, [m[1].toLowerCase()]: m[2] }
            }
            return accu
          }, sectionProps)
        }
        sectionContents.push(drawer);
      })) continue

      const token = peek();
      if (token && (token.type === 'drawer.begin' || token.type === 'drawer.end')) {
        // we encountered an unclosed drawer (or a drawer with no beginning), so this should just be treated as text
        modify(t => tokenToText(lexer, t));
      }
      const pos = sectionContents[0]?.position ?? token?.position;
      if (pos) {
        const section = ast.section([], { properties: sectionProps, position: pos });
        pushMany(section)(sectionContents);
        return section;
      }
    }

    const parseFootnote = (): Footnote | undefined => {
      const token = eat('footnote.label');
      if (token) {
        const footnote = ast.footnote(token.label, [], { position: token.position });
        // v2021.07.03 footnote definitions cannot contain other footnote definitions
        const contents = parseSection({ breakOn: t => t.type === 'footnote.label' })(lexer)?.children ?? [];
        pushMany(footnote)(contents as Exclude<Section['children'][number], Footnote>[]);
        return footnote;
      }
    }

    const parse = (par?: Section, attributes: Attributes = {}): Section | undefined => {
      if (eatAll('newline') > 1) {
        attributes = {} // reset affliated keywords
      }

      const section = par ?? newSection();

      const token = peek()
      if (!token) return section;

      // TODO: maybe just use tryTo(parseHeadline) here (2021-07-07)
      // stars begins a new headline, so we exit the current section
      if (token.type === 'stars') {
        return section;
      }

      if (breakOn(token)) {
        return section;
      }

      if (!section) return;

      // keyword
      if (token.type === 'keyword') {
        const key = token.key.toLowerCase()
        const { value } = token

        if (AFFILIATED_KEYWORDS.includes(key)) {
          attributes[key] = _primitive(value)
        } else if (key.startsWith('attr_')) {
          attributes[key] = {
            ...attributes[key] as { [key: string]: Primitive },
            ...parseSymbols(value),
          }

        } else if (key === 'todo') {
          lexer.addInBufferTodoKeywords(value)
        } else if (key === 'html') {
          push(section)(ast.html(value, { position: token.position }))
        }

        eat()
        return parse(section, attributes)
      }

      // list
      if (tryTo(parseList)(attach(attributes), push(section))) {
        return parse(section)
      }

      // table
      if (tryTo(parseTable)(attach(attributes), push(section))) {
        return parse(section)
      }

      // block
      if (tryTo(parseBlock)(attach(attributes), push(section))) {
        return parse(section)
      }

      // unclosed block or a block end without a beginning - treated as text
      if (token.type === 'block.begin' || token.type === 'block.end') {
        modify(t => tokenToText(lexer, t));
      }

      if (token.type === 'hr') {
        push(section)(token)
      }

      // paragraph
      if (tryTo(parseParagraph)(attach(attributes), push(section))) {
        return parse(section)
      }

      // footnote
      if (tryTo(parseFootnote)(push(section))) {
        return parse(section)
      }

      // skip(t => t.type === 'newline')
      // push(section)(token)
      // console.log(`skip: ${token.type}`)
      eat()

      return parse(section)
    }

    const res = parse();
    if (res?.children.length === 0) {
      // empty section, just ignored
      return;
    }
    return res;
  };
}
