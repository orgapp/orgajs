import {
  BlockBegin,
  BlockEnd,
  Comment,
  Newline,
  StyledText,
  Token,
} from '../../types';
import tok from './tok';

export function testLexer(testName: string, input: string, expected: Token[]) {
  it(testName, () => {
    expect(tok(input)).toMatchObject(expected);
  });
}

export function testLexerMulti(testName: string, tests: [input: string, expected: Token[]][]) {
  it(testName, () => {
    for (const [input, expected] of tests) {
      expect(tok(input)).toMatchObject(expected);
    }
  });
}

type Extra<Tok extends Token, Keys extends keyof (Tok & { _text: string }) = 'type'> = Partial<Omit<Tok | { _text: string }, Keys | 'type'>>;

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

export const tokComment = (value: string, extra: Extra<Comment, 'value'> = {}): Comment => ({
  type: 'comment',
  value,
  ...{ _text: `# ${value}` },
  ...extra,
});
