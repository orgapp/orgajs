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

export type TokenParser<T> = (lexer: Lexer) => T | undefined;
export type ParseAction<T> = (node: T) => void;

export default function lexActions(lexer: Lexer) {
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

  const tryToOne = <T>(parse: TokenParser<T>) => (...actions: ParseAction<T>[]): boolean => {
    const savePoint = save()
    const node = parse(lexer)
    if (!node) {
      restore(savePoint)
      return false
    }
    actions.forEach(action => action(node))
    return true
  }

  const returning = <T>(actionParser: (...actions: ParseAction<T>[]) => unknown) => (...actions: ParseAction<T>[]): T | undefined => {
    let res: T | undefined;
    actionParser(...actions, n => { res = n });
    return res;
  };

  const tryTo = <T>(parse: ((lexer: Lexer) => T | undefined) | ((lexer: Lexer) => T | undefined)[]) => (...actions: ((node: T) => void)[]): boolean => {
    if (typeof parse === 'function') {
      return tryToOne(parse)(...actions);
    } else {
      for (const p of parse) {
        if (tryToOne(p)(...actions)) {
          return true;
        }
      }
      return false;
    }
  }

  const tryMany = <T>(parse: ((lexer: Lexer) => T | undefined) | ((lexer: Lexer) => T | undefined)[]) => (...actions: ((node: T) => void)[]): T[] => {
    const res: T[] = [];
    while (tryTo(parse)(...actions, n => res.push(n))) { }
    return res;
  }

  const trySome = <T>(parse: ((lexer: Lexer) => T | undefined) | ((lexer: Lexer) => T | undefined)[]) => (...actions: ((node: T) => void)[]): [T, ...T[]] | undefined => {
    const r1 = returning(tryTo(parse))(...actions);
    if (r1) {
      return [r1, ...tryMany(parse)(...actions)];
    }
  }

  return {
    collect,
    returning,
    skip,
    tryTo,
    tryMany,
    trySome,
  }
}


///////////////////////
///// COMBINATORS /////
///////////////////////


/** See {@link Lexer.eat}. */
export function eat<K extends Token['type']>(): TokenParser<Token>;
export function eat<K extends Token['type']>(type: K): TokenParser<Token & { type: K }>;
export function eat<K extends Token['type']>(type?: K) {
  return (lexer: Lexer) => {
    const { eat } = lexer;
    return type !== undefined ? eat(type) : eat();
  };
}

/** Fail the current parse branch. */
export const fail = () => undefined;

/** Parse `p`, but fail if the parsed value doesn't satisfy predicate `pred`. */
export const matching = <T>(p: TokenParser<T>, pred: (x: T) => boolean): TokenParser<T> => {
  return bind(p, r => pred(r) ? pure(r) : fail);
}

/** Parse `p`, but fail if the parsed value doesn't satisfy type predicate `pred`. */
export const matchingTy = <T, Q extends T>(p: TokenParser<T>, pred: (x: T) => x is Q): TokenParser<Q> => {
  return bind(p, r => pred(r) ? pure(r) : fail);
}

export function hasValue(t: Token): t is Extract<Token, { value: unknown }> {
  return 'value' in t;
}

export function tokenValued<Ty extends Token['type']>(): TokenParser<Extract<Token, { value: unknown }>>;
export function tokenValued<Ty extends Token['type']>(type: Ty): TokenParser<Extract<Token, { type: Ty, value: unknown }>>;
export function tokenValued<Ty extends Token['type']>(type?: Ty) {
  return matchingTy(type !== undefined ? eat(type) : eat(), hasValue);
}

export const map = <S, T>(f: (x: S) => T, x: TokenParser<S>): TokenParser<T> => {
  return (lexer: Lexer) => {
    const { returning, tryTo } = lexActions(lexer);
    const r = returning(tryTo(x))();
    if (r) {
      return f(r);
    }
  };
}

export const bind = <S, T>(p: TokenParser<S>, f: (x: S) => TokenParser<T>): TokenParser<T> => {
  return (lexer: Lexer) => {
    const { returning, tryTo } = lexActions(lexer);
    const r1 = returning(tryTo(p))();
    if (r1) {
      const p2 = f(r1);
      return returning(tryTo(p2))();
    }
  };
}

export const pure = <T>(x: T): TokenParser<T> => {
  return (_lexer: Lexer) => {
    return x;
  };
}

/** Try each parse alternative in order until one succeeds. */
export const oneOf = <T>(alternatives: TokenParser<T>[]): TokenParser<T> => {
  return (lexer: Lexer) => {
    const { returning, tryTo } = lexActions(lexer);
    return returning(tryTo(alternatives))();
  };
};

/** Parse zero or more occurences of the given parser. */
export const manyOf = <T>(parse: TokenParser<T>): TokenParser<T[]> => {
  return (lexer: Lexer) => {
    const { tryMany } = lexActions(lexer);
    return tryMany(parse)();
  };
}

/** Parse zero or more occurences of `p` ended by `end`. */
export const manyTill = <T, End>(p: TokenParser<T>, end: TokenParser<End>): TokenParser<[...T[], End]> => {
  return (lexer: Lexer) => {
    const { returning, tryTo } = lexActions(lexer);
    const res: T[] = [];
    while (true) {
      const last = returning(tryTo(end))();
      if (last) {
        return [...res, last];
      }
      const next = returning(tryTo(p))();
      if (next) {
        res.push(next);
      } else {
        return;
      }
    }
  };
}

/** All of the given `ps` in sequence. */
export const seq = <T, N extends number>(ps: TokenParser<T>[] & { length: N }): TokenParser<T[] & { length: N }> => {
  return (lexer: Lexer) => {
    const { tryTo } = lexActions(lexer);
    const results: T[] = [];
    for (const p of ps) {
      if (!tryTo(p)(results.push)) {
        return;
      }
    }
    return results as T[] & { length: N };
  };
}

/** Parse in sequence, where latter parsers can depend on the results of earlier parsers. */
export const seq2d = <T1, T2>(p1: TokenParser<T1>, p2: (x: T1) => TokenParser<T2>): TokenParser<[T1, T2]> => {
  return bind(p1, r1 => {
    return map(r2 => [r1, r2], p2(r1));
  });
}

/** Like {@link seq2d}, but only provides the second result. */
export const andThen2d = <T1, T2>(p1: TokenParser<T1>, p2: (x: T1) => TokenParser<T2>): TokenParser<T2> => {
  return map((x: [T1, T2]) => x[1], seq2d(p1, p2));
}

export const last = <T>(p: TokenParser<[...unknown[], T]>): TokenParser<T> => {
  return map(x => x[x.length - 1] as T, p);
}

/////////////////
///// OTHER /////
/////////////////


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


type Extra<ASTElem extends Node, Keys extends keyof ASTElem = 'type'> = Partial<Omit<ASTElem, Keys | 'type'>> & { position: Position };
type ExtraP<ASTElem extends Parent, Keys extends keyof ASTElem = 'type' | 'children'> = Extra<ASTElem, Keys | 'children'>;

/** Build an AST {@link Document} object. */
export const document = (children: Document['children'], extra: ExtraP<Document>): Document => ({
  type: 'document',
  children: children,
  properties: {},
  ...extra
});

/** Build an AST {@link Paragraph} object. */
export const paragraph = (children: Paragraph['children'], extra: ExtraP<Paragraph>): Paragraph => ({
  type: 'paragraph',
  children: children,
  attributes: {},
  ...extra
});

/** Build an AST {@link Block} object. */
export const block = (name: Block['name'], value: string, extra: Extra<Block, 'name' | 'value'>): Block => ({
  type: 'block',
  name: name,
  value: value,
  params: [],
  attributes: {},
  ...extra
});

/** Build an AST {@link VerseBlock} object. */
export const verseBlock = (children: VerseBlock['children'], extra: ExtraP<VerseBlock>): VerseBlock => ({
  type: 'verse_block',
  params: [],
  attributes: {},
  children,
  ...extra
});

/** Build an AST {@link GreaterBlock} object. */
export const greaterBlock = (name: GreaterBlock['name'], children: GreaterBlock['children'], extra: ExtraP<GreaterBlock, 'name'>): GreaterBlock => ({
  type: 'greater_block',
  name,
  params: [],
  attributes: {},
  children,
  ...extra
});

/** Build an AST {@link SpecialBlock} object. */
export const specialBlock = (name: SpecialBlock['name'], children: SpecialBlock['children'], extra: ExtraP<SpecialBlock, 'name'>): SpecialBlock => ({
  type: 'special_block',
  name,
  params: [],
  attributes: {},
  children,
  ...extra
});

/** Build an AST {@link StyledText} object. */
export const styledText = <TextTy extends StyledText['type']>(type: TextTy) => (text: string, extra: Extra<StyledText, 'value'>): StyledText & { type: TextTy } => ({
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
export const footnoteReference = (label: string, extra: ExtraP<FootnoteRef, 'label'>): FootnoteRef => ({
  type: 'footnote.reference',
  label: label,
  children: [] as [],
  ...extra
});

/** Build an AST object for an inline footnote reference which defines a footnote. */
export const inlineFootnote = (label: string, children: FootnoteInline['children'], extra: ExtraP<FootnoteInline, 'label'>): FootnoteInline => ({
  type: 'footnote.reference',
  label: label,
  children: children,
  ...extra
});

/** Build an AST object for an anonymous inline footnote reference. */
export const anonFootnote = (children: FootnoteAnon['children'], extra: ExtraP<FootnoteAnon, 'label'>): FootnoteAnon => ({
  type: 'footnote.reference',
  label: '',
  children: children,
  ...extra
});

/** Build an AST object for an anonymous inline footnote reference. */
export const inlineFootnotePartial = (label: string, children: FootnoteReference['children'], extra: ExtraP<FootnoteReference, 'label'>): FootnoteReference => ({
  type: 'footnote.reference',
  label,
  children,
  ...extra
});

/** Build an AST {@link Footnote} object. */
export const footnote = (label: string, children: Footnote['children'], extra: ExtraP<Footnote, 'label'>): Footnote => ({
  type: 'footnote',
  label: label,
  children,
  ...extra
});

/** Build an AST object for a {@link Headline}. */
export const headline = (level: number, content: string, children: Headline['children'], extra: ExtraP<Headline, 'level' | 'content'>): Headline => ({
  type: 'headline',
  level: level,
  actionable: false,
  content: content,
  children,
  ...extra
});

/** Build an AST object for a {@link Headline} with no body. */
export const heading = (level: number, content: string, extra: ExtraP<Headline, 'level' | 'content'>): Headline => headline(level, content, [], extra);

/** Build an AST object for a {@link Section}. */
export const section = (children: Section['children'], extra: ExtraP<Section>): Section => ({
  type: 'section',
  properties: {},
  children,
  ...extra
});

/** Build an AST {@link Drawer} object. */
export const drawer = (name: string, value: string, extra: Extra<Drawer, 'name' | 'value'>): Drawer => ({
  type: 'drawer',
  name,
  value,
  ...extra
});

/** Build an AST {@link Link} object. */
export const link = (value: string, extra: Extra<Link, 'value'>): Link => ({
  type: 'link',
  value,
  protocol: value.indexOf(':') !== -1 ? value.split(':')[0] : undefined,
  description: undefined,
  ...extra
});

/** Build an AST {@link List} object. */
export const list = (indent: number, ordered: boolean, children: List['children'], extra: ExtraP<List, 'indent' | 'ordered'>): List => ({
  type: 'list',
  indent,
  ordered,
  children,
  attributes: {},
  ...extra
});

/** Build an AST {@link ListItem} object. */
export const listItem = (indent: number, children: ListItem['children'], extra: ExtraP<ListItem, 'indent'>): ListItem => ({
  type: 'list.item',
  indent,
  children,
  ...extra
});

/** Build an AST {@link Planning} object. */
export const planning = (keyword: string, timestamp: Timestamp, extra: Extra<Planning, 'keyword' | 'timestamp'>): Planning => ({
  type: 'planning',
  keyword,
  timestamp,
  ...extra
});

/** Build an AST {@link HTML} object. */
export const html = (value: string, extra: Extra<HTML, 'value'>): HTML => ({
  type: 'html',
  value,
  ...extra
});

/** Build an AST {@link Table} object. */
export const table = (children: Table['children'], extra: ExtraP<Table>): Table => ({
  type: 'table',
  children,
  attributes: {},
  ...extra
});

/** Build an AST {@link TableRow} object. */
export const tableRow = (children: TableRow['children'], extra: ExtraP<TableRow>): TableRow => ({
  type: 'table.row',
  children,
  ...extra
});

/** Build an AST {@link TableCell} object. */
export const tableCell = (children: TableCell['children'], extra: ExtraP<TableCell>): TableCell => ({
  type: 'table.cell',
  children,
  ...extra
});

/** Build an object position. */
export const pos = ([startLine, startCol]: [number, number], [endLine, endCol]: [number, number], indent?: number[]): Position => ({
  start: { line: startLine, column: startCol }, end: { line: endLine, column: endCol }, ...(indent !== undefined ? { indent: indent } : {})
});
