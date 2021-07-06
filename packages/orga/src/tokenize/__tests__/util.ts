import {
  BlockBegin,
  BlockEnd,
  Comment,
  DrawerBegin,
  DrawerEnd,
  FootnoteInlineBegin,
  FootnoteLabel,
  FootnoteReference,
  FootnoteReferenceEnd,
  HorizontalRule,
  Keyword,
  Link,
  ListItemBullet,
  ListItemCheckbox,
  ListItemTag,
  Newline,
  Parent,
  PlanningKeyword,
  PlanningTimestamp,
  Priority,
  Stars,
  StyledText,
  Tags,
  Timestamp,
  Todo,
  Token,
} from '../../types';
import tok from './tok';

import { ParseOptions } from '../../options'

export function testLexer(testName: string, input: string, expected: Token[], options: Partial<ParseOptions> = {}) {
  it(testName, () => {
    expect(tok(input, options)).toMatchObject(expected);
  });
}

export function testLexerMulti(testName: string, tests: [input: string, expected: Token[]][], options: Partial<ParseOptions> = {}) {
  it(testName, () => {
    for (const [input, expected] of tests) {
      expect(tok(input, options)).toMatchObject(expected);
    }
  });
}

type Extra<Tok extends Token, Keys extends keyof (Tok & { _text: string }) = 'type'> = Partial<Omit<Tok | { _text: string }, Keys | 'type'>>;
type ExtraP<Tok extends Parent & Token, Keys extends keyof (Tok & { _text: string }) = 'type' | 'children'> = Extra<Tok, Keys | 'children'>;

export const tokBlockBegin = (name: string, extra: Extra<BlockBegin, 'name'> = {}): BlockBegin => ({
  type: 'block.begin',
  name,
  params: [],
  ...{ _text: `#+BEGIN_${name}` },
  ...extra,
});

export const tokBlockEnd = (name: string, extra: Extra<BlockEnd, 'name'> = {}): BlockEnd => ({
  type: 'block.end',
  name,
  ...{ _text: `#+END_${name}` },
  ...extra,
});

export const tokNewline = (extra: Extra<Newline, '_text'> = {}): Newline => ({
  type: 'newline',
  ...{ _text: '\n' },
  ...extra,
});

export const tokStyledText = <TextTy extends StyledText['type']>(type: TextTy, marker: string) => (value: string, extra: Extra<StyledText, 'value'> = {}): StyledText & { type: TextTy } => ({
  type,
  value,
  ...{ _text: `${marker}${value}${marker}` },
  ...extra,
});

export const tokText = tokStyledText('text.plain', '');

export const tokTextBold = tokStyledText('text.bold', '*');

export const tokTextCode = tokStyledText('text.code', '~');

export const tokTextItalic = tokStyledText('text.italic', '/');

export const tokTextStrikeThrough = tokStyledText('text.strikeThrough', '+');

export const tokTextUnderline = tokStyledText('text.underline', '_');

export const tokTextVerbatim = tokStyledText('text.verbatim', '=');

export const tokComment = (value: string, extra: Extra<Comment, 'value'> = {}): Comment => ({
  type: 'comment',
  value,
  ...{ _text: `# ${value}` },
  ...extra,
});

export const tokDrawerBegin = (name: string, extra: Extra<DrawerBegin, 'name'> = {}): DrawerBegin => ({
  type: 'drawer.begin',
  name,
  ...{ _text: `:${name}:` },
  ...extra,
});

export const tokDrawerEnd = (extra: Extra<DrawerEnd> = {}): DrawerEnd => ({
  type: 'drawer.end',
  ...{ _text: `:END:` },
  ...extra,
});

export const tokFootnoteLabel = (label: string, extra: Extra<FootnoteLabel> = {}): FootnoteLabel => ({
  type: 'footnote.label',
  label,
  ...{ _text: `[fn:${label}]` },
  ...extra,
});

// TODO: doesn't make sense as a token because it can have children - remove this when simplifying lexer (2021-07-05)
export const tokFootnoteReference = (label: string, children: FootnoteReference['children'], extra: ExtraP<FootnoteReference> = {}): FootnoteReference => ({
  type: 'footnote.reference',
  label,
  children,
  ...{ _text: `[fn:${label}]` },
  ...extra,
});

export const tokFootnoteInlineBegin = (label: string, extra: Extra<FootnoteInlineBegin, "label"> = {}): FootnoteInlineBegin => ({
  type: 'footnote.inline.begin',
  label,
  ...{ _text: `[fn:${label}:` },
  ...extra,
});

export const tokFootnoteAnonymousBegin = (extra: Extra<FootnoteInlineBegin, "label"> = {}): FootnoteInlineBegin => tokFootnoteInlineBegin("", extra);

export const tokFootnoteReferenceEnd = (extra: Extra<FootnoteReferenceEnd> = {}): FootnoteReferenceEnd => ({
  type: 'footnote.reference.end',
  ...{ _text: `]` },
  ...extra,
});

export const tokStars = (level: number, extra: Extra<Stars, 'level'> = {}): Stars => ({
  type: 'stars',
  level,
  ...{ _text: '*'.repeat(level) },
  ...extra,
});

export const tokTags = (tags: string[], extra: Extra<Tags, 'tags'> = {}): Tags => ({
  type: 'tags',
  tags,
  ...{ _text: `:${tags.join(':')}:` },
  ...extra,
});

export const tokTodo = (keyword: string, actionable: boolean, extra: Extra<Todo, 'keyword'> = {}): Todo => ({
  type: 'todo',
  keyword,
  // TODO: I don't think we can really know the actionable state at
  // the point of lexing (because todo keywords can be specified in
  // the Org file), but we can probably figure this out later in the
  // parser or via parser options (2021-07-06)
  actionable,
  ...{ _text: keyword },
  ...extra,
});

/** Priority cookie token. */
export const tokPriority = (value: string, extra: Extra<Priority, 'value'> = {}): Priority => ({
  type: 'priority',
  value: `[#${value}]`,
  ...{ _text: `[#${value}]` },
  ...extra,
});

export const tokHorizontalRule = (extra: Extra<HorizontalRule> = {}): HorizontalRule => ({
  type: 'hr',
  ...{ _text: `-----` },
  ...extra,
});

export const tokListBullet = (indent: number, ordered: boolean, extra: Extra<ListItemBullet, 'indent' | 'ordered'> = {}): ListItemBullet => ({
  type: 'list.item.bullet',
  indent,
  ordered,
  ...{ _text: `-` },
  ...extra,
});

export const tokListCheckbox = (checked: boolean, extra: Extra<ListItemCheckbox, 'checked'> = {}): ListItemCheckbox => ({
  type: 'list.item.checkbox',
  checked,
  ...{ _text: checked ? "[X]" : "[ ]" },
  ...extra,
});

export const tokListItemTag = (value: string, extra: Extra<ListItemTag, 'value'> = {}): ListItemTag => ({
  type: 'list.item.tag',
  value,
  ...{ _text: value },
  ...extra,
});

export const tokLink = (value: string, extra: Extra<Link, 'value'> = {}): Link => ({
  type: 'link',
  value,
  protocol: value.indexOf(':') !== -1 ? value.split(':')[0] : undefined,
  description: undefined,
  ...{ _text: 'description' in extra ? `[[${value}][${extra['description']}]]` : `[[${value}]]` },
  ...extra,
});

export const tokKeyword = (key: string, value: string, extra: Extra<Keyword, 'key' | 'value'> = {}): Keyword => ({
  type: 'keyword',
  key,
  value,
  ...{ _text: `#+${key}: ${value}` },
  ...extra,
});

export const tokPlanningKeyword = (value: string, extra: Extra<PlanningKeyword, 'value'> = {}): PlanningKeyword => ({
  type: 'planning.keyword',
  value,
  ...{ _text: `${value}:` },
  ...extra,
});

export const tokPlanningTimestamp = (value: Timestamp, extra: Extra<PlanningTimestamp, 'value'> = {}): PlanningTimestamp => ({
  type: 'planning.timestamp',
  value,
  ...extra,
});
