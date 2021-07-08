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
  PlanningKeyword,
  PlanningTimestamp,
  Priority,
  Stars,
  StyledText,
  TableRule,
  TableColumnSeparator,
  Tags,
  Timestamp,
  Todo,
  Token,
} from '../types';

import tok from './tok';
import { ParseOptions } from '../../options'
import * as tk from '../util';

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

type Extra<Tok extends Token, Keys extends keyof Tok = 'type'> = Partial<Omit<Tok, Keys | 'type'>>;

export const tokBlockBegin = (name: string, extra: Extra<BlockBegin, 'name'> = {}): BlockBegin =>
  tk.tokBlockBegin(name, { _text: `#+BEGIN_${name}`, ...extra });

export const tokBlockEnd = (name: string, extra: Extra<BlockEnd, 'name'> = {}): BlockEnd =>
  tk.tokBlockEnd(name, { _text: `#+END_${name}`, ...extra });

export const tokNewline = (extra: Extra<Newline, '_text'> = {}): Newline =>
  ({ _text: '\n', ...tk.tokNewline(extra) });

export const tokStyledText = <TextTy extends StyledText['type']>(type: TextTy, marker: string) =>
  (value: string, extra: Extra<StyledText, 'value'> = {}): StyledText & { type: TextTy } =>
    tk.tokStyledText(type)(value, { _text: `${marker}${value}${marker}`, ...extra });

export const tokText = tokStyledText('text.plain', '');

export const tokTextBold = tokStyledText('text.bold', '*');

export const tokTextCode = tokStyledText('text.code', '~');

export const tokTextItalic = tokStyledText('text.italic', '/');

export const tokTextStrikeThrough = tokStyledText('text.strikeThrough', '+');

export const tokTextUnderline = tokStyledText('text.underline', '_');

export const tokTextVerbatim = tokStyledText('text.verbatim', '=');

export const tokComment = (value: string, extra: Extra<Comment, 'value'> = {}): Comment =>
  tk.tokComment(value, { _text: `# ${value}`, ...extra });

export const tokDrawerBegin = (name: string, extra: Extra<DrawerBegin, 'name'> = {}): DrawerBegin =>
  tk.tokDrawerBegin(name, { _text: `:${name}:`, ...extra });

export const tokDrawerEnd = (extra: Extra<DrawerEnd> = {}): DrawerEnd =>
  tk.tokDrawerEnd({ _text: `:END:`, ...extra });

export const tokFootnoteLabel = (label: string, extra: Extra<FootnoteLabel> = {}): FootnoteLabel =>
  tk.tokFootnoteLabel(label, { _text: `[fn:${label}]`, ...extra });

export const tokFootnoteReference = (label: string, extra: Extra<FootnoteReference> = {}): FootnoteReference =>
  tk.tokFootnoteReference(label, { _text: `[fn:${label}]`, ...extra });

export const tokFootnoteInlineBegin = (label: string, extra: Extra<FootnoteInlineBegin, "label"> = {}): FootnoteInlineBegin =>
  tk.tokFootnoteInlineBegin(label, { _text: `[fn:${label}:`, ...extra });

export const tokFootnoteAnonymousBegin = (extra: Extra<FootnoteInlineBegin, "label"> = {}): FootnoteInlineBegin =>
  tokFootnoteInlineBegin("", extra);

export const tokFootnoteReferenceEnd = (extra: Extra<FootnoteReferenceEnd> = {}): FootnoteReferenceEnd =>
  tk.tokFootnoteReferenceEnd({ _text: `]`, ...extra });

export const tokStars = (level: number, extra: Extra<Stars, 'level'> = {}): Stars =>
  tk.tokStars(level, { _text: '*'.repeat(level), ...extra });

export const tokTags = (tags: string[], extra: Extra<Tags, 'tags'> = {}): Tags =>
  tk.tokTags(tags, { _text: `:${tags.join(':')}:`, ...extra });

export const tokTodo = (keyword: string, actionable: boolean, extra: Extra<Todo, 'keyword'> = {}): Todo =>
  tk.tokTodo(keyword, actionable, { _text: keyword, ...extra });

/** Priority cookie token. */
export const tokPriority = (value: string, extra: Extra<Priority, 'value'> = {}): Priority =>
  tk.tokPriority(value, { _text: `[#${value}]`, ...extra });

export const tokHorizontalRule = (extra: Extra<HorizontalRule> = {}): HorizontalRule =>
  tk.tokHorizontalRule({ _text: `-----`, ...extra });

export const tokListBullet = (indent: number, ordered: boolean, extra: Extra<ListItemBullet, 'indent' | 'ordered'> = {}): ListItemBullet =>
  tk.tokListBullet(indent, ordered, { _text: `-`, ...extra });

export const tokListCheckbox = (checked: boolean, extra: Extra<ListItemCheckbox, 'checked'> = {}): ListItemCheckbox =>
  tk.tokListCheckbox(checked, { _text: checked ? "[X]" : "[ ]", ...extra });

export const tokListItemTag = (value: string, extra: Extra<ListItemTag, 'value'> = {}): ListItemTag =>
  tk.tokListItemTag(value, { _text: value, ...extra });

export const tokLink = (value: string, extra: Extra<Link, 'value'> = {}): Link => tk.tokLink(value, {
  _text: 'description' in extra ? `[[${value}][${extra.description}]]` : `[[${value}]]`,
  ...extra,
});

export const tokKeyword = (key: string, value: string, extra: Extra<Keyword, 'key' | 'value'> = {}): Keyword =>
  tk.tokKeyword(key, value, { _text: `#+${key}: ${value}`, ...extra });

export const tokPlanningKeyword = (value: string, extra: Extra<PlanningKeyword, 'value'> = {}): PlanningKeyword =>
  tk.tokPlanningKeyword(value, { _text: `${value}:`, ...extra });

export const tokPlanningTimestamp = (value: Timestamp, extra: Extra<PlanningTimestamp, 'value'> = {}): PlanningTimestamp =>
  tk.tokPlanningTimestamp(value, extra);

export const tokTableColumnSeparator = (extra: Extra<TableColumnSeparator> = {}): TableColumnSeparator =>
  tk.tokTableColumnSeparator({ _text: "|", ...extra });

export const tokTableRule = (extra: Extra<TableRule> = {}): TableRule =>
  tk.tokTableRule(extra);
