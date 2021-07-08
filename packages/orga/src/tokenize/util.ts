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
} from './types';

type Extra<Tok extends Token, Keys extends keyof Tok = 'type'> = Partial<Omit<Tok, Keys | 'type'>>;

export const tokBlockBegin = (name: string, extra: Extra<BlockBegin, 'name'> = {}): BlockBegin => ({
  type: 'block.begin',
  name,
  params: [],
  ...extra,
});

export const tokBlockEnd = (name: string, extra: Extra<BlockEnd, 'name'> = {}): BlockEnd => ({
  type: 'block.end',
  name,
  ...extra,
});

export const tokNewline = (extra: Extra<Newline, '_text'> = {}): Newline => ({
  type: 'newline',
  ...extra,
});

export const tokStyledText = <TextTy extends StyledText['type']>(type: TextTy) => (value: string, extra: Extra<StyledText, 'value'> = {}): StyledText & { type: TextTy } => ({
  type,
  value,
  ...extra,
});

export const tokText = tokStyledText('text.plain');

export const tokTextBold = tokStyledText('text.bold');

export const tokTextCode = tokStyledText('text.code');

export const tokTextItalic = tokStyledText('text.italic');

export const tokTextStrikeThrough = tokStyledText('text.strikeThrough');

export const tokTextUnderline = tokStyledText('text.underline');

export const tokTextVerbatim = tokStyledText('text.verbatim');

export const tokComment = (value: string, extra: Extra<Comment, 'value'> = {}): Comment => ({
  type: 'comment',
  value,
  ...extra,
});

export const tokDrawerBegin = (name: string, extra: Extra<DrawerBegin, 'name'> = {}): DrawerBegin => ({
  type: 'drawer.begin',
  name,
  ...extra,
});

export const tokDrawerEnd = (extra: Extra<DrawerEnd> = {}): DrawerEnd => ({
  type: 'drawer.end',
  ...extra,
});

export const tokFootnoteLabel = (label: string, extra: Extra<FootnoteLabel, "label"> = {}): FootnoteLabel => ({
  type: 'footnote.label',
  label,
  ...extra,
});

export const tokFootnoteReference = (label: string, extra: Extra<FootnoteReference, "label"> = {}): FootnoteReference => ({
  type: 'footnote.reference',
  label,
  ...extra,
});

export const tokFootnoteInlineBegin = (label: string, extra: Extra<FootnoteInlineBegin, "label"> = {}): FootnoteInlineBegin => ({
  type: 'footnote.inline.begin',
  label,
  ...extra,
});

export const tokFootnoteAnonymousBegin = (extra: Extra<FootnoteInlineBegin, "label"> = {}): FootnoteInlineBegin => tokFootnoteInlineBegin("", extra);

export const tokFootnoteReferenceEnd = (extra: Extra<FootnoteReferenceEnd> = {}): FootnoteReferenceEnd => ({
  type: 'footnote.reference.end',
  ...extra,
});

export const tokStars = (level: number, extra: Extra<Stars, 'level'> = {}): Stars => ({
  type: 'stars',
  level,
  ...extra,
});

export const tokTags = (tags: string[], extra: Extra<Tags, 'tags'> = {}): Tags => ({
  type: 'tags',
  tags,
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
  ...extra,
});

/** Priority cookie token. */
export const tokPriority = (value: string, extra: Extra<Priority, 'value'> = {}): Priority => ({
  type: 'priority',
  value: `[#${value}]`,
  ...extra,
});

export const tokHorizontalRule = (extra: Extra<HorizontalRule> = {}): HorizontalRule => ({
  type: 'hr',
  ...extra,
});

export const tokListBullet = (indent: number, ordered: boolean, extra: Extra<ListItemBullet, 'indent' | 'ordered'> = {}): ListItemBullet => ({
  type: 'list.item.bullet',
  indent,
  ordered,
  ...extra,
});

export const tokListCheckbox = (checked: boolean, extra: Extra<ListItemCheckbox, 'checked'> = {}): ListItemCheckbox => ({
  type: 'list.item.checkbox',
  checked,
  ...extra,
});

export const tokListItemTag = (value: string, extra: Extra<ListItemTag, 'value'> = {}): ListItemTag => ({
  type: 'list.item.tag',
  value,
  ...extra,
});

export const tokLink = (value: string, extra: Extra<Link, 'value'> = {}): Link => ({
  type: 'link',
  value,
  protocol: value.indexOf(':') !== -1 ? value.split(':')[0] : undefined,
  description: undefined,
  ...extra,
});

export const tokKeyword = (key: string, value: string, extra: Extra<Keyword, 'key' | 'value'> = {}): Keyword => ({
  type: 'keyword',
  key,
  value,
  ...extra,
});

export const tokPlanningKeyword = (value: string, extra: Extra<PlanningKeyword, 'value'> = {}): PlanningKeyword => ({
  type: 'planning.keyword',
  value,
  ...extra,
});

export const tokPlanningTimestamp = (value: Timestamp, extra: Extra<PlanningTimestamp, 'value'> = {}): PlanningTimestamp => ({
  type: 'planning.timestamp',
  value,
  ...extra,
});

export const tokTableColumnSeparator = (extra: Extra<TableColumnSeparator> = {}): TableColumnSeparator => ({
  type: 'table.columnSeparator',
  ...extra,
});

export const tokTableRule = (extra: Extra<TableRule> = {}): TableRule => ({
  type: 'table.hr',
  ...extra,
});
