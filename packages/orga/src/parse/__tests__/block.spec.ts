import debug from './debug'
import { Block, GreaterBlock } from '../../types';

import {
  block,
  greaterBlock,
  paragraph,
  specialBlock,
  testParse,
  text,
  textBold,
  textStrikethrough,
  verseBlock,
} from './util';

describe('Parse Block', () => {
  it('works', () => {
    const content = `
* headline one
#+BEGIN_SRC javascript
const string = 'hello world'
console.log(string)
#+END_SRC
`
    // debug(content)
  })

  function testBlock(testName: string, toParse: string, ...expected: Parameters<typeof block>) {
    return testParse(testName, toParse, [block(...expected)]);
  }

  function testGreaterBlock(testName: string, toParse: string, ...expected: Parameters<typeof greaterBlock>) {
    return testParse(testName, toParse, [greaterBlock(...expected)]);
  }

  function testSpecialBlock(testName: string, toParse: string, ...expected: Parameters<typeof specialBlock>) {
    return testParse(testName, toParse, [specialBlock(...expected)]);
  }

  function testVerseBlock(testName: string, toParse: string, ...expected: Parameters<typeof verseBlock>) {
    return testParse(testName, `#+BEGIN_VERSE\n${toParse}\n#+END_VERSE`, [verseBlock(...expected)]);
  }

  describe('unclosed block is treated as text', () => {
    testParse('basic',
      '#+BEGIN_FOO',
      [paragraph([text('#+BEGIN_FOO')])]);

    testParse('with PARAMETERS',
      '#+BEGIN_FOO P',
      [paragraph([text('#+BEGIN_FOO P')])]);

    testParse('case is respected',
      '#+BEGiN_FoO P pP',
      [paragraph([text('#+BEGiN_FoO P pP')])]);

    testParse('spacing is respected',
      '#+BEGIN_FOO  P   h',
      [paragraph([text('#+BEGIN_FOO  P   h')])]);
  });

  describe('end block without start is treated as text', () => {
    testParse('basic',
      '#+END_FOO',
      [paragraph([text('#+END_FOO')])]);

    testParse('case is preserved',
      '#+EnD_FoO',
      [paragraph([text('#+EnD_FoO')])]);
  });

  describe('greater blocks', () => {
    for (const blockTy of ['QUOTE', 'CENTER'] as GreaterBlock['name'][]) {
      describe(`${blockTy} block`, () => {
        const otherBlock = blockTy === 'QUOTE' ? 'CENTER' : 'QUOTE';
        testGreaterBlock('open and close',
          `#+BEGIN_${blockTy}
#+END_${blockTy}`, blockTy, []);

        testGreaterBlock('greater blocks can appear in greater block content',
          `#+BEGIN_${blockTy}
#+BEGIN_${otherBlock}
You can nest other greater blocks inside a greater block.
#+END_${otherBlock}

And more text.
#+END_${blockTy}`, blockTy, [greaterBlock(otherBlock, [paragraph([text('You can nest other greater blocks inside a greater block.')])]), paragraph([text('And more text.')])]);

        testGreaterBlock('you can nest greater blocks of the same type (one nesting)',
          `#+BEGIN_${blockTy}
#+BEGIN_${blockTy}
You can nest the same block.
#+END_${blockTy}

And more text.
#+END_${blockTy}`, blockTy, [greaterBlock(blockTy, [paragraph([text('You can nest the same block.')])]), paragraph([text('And more text.')])]);

        testGreaterBlock('name casing ignored',
          `#+BEGIN_${blockTy.toLowerCase()}
#+END_${blockTy.toLowerCase()}`, blockTy, []);

        testGreaterBlock('with params',
          `#+BEGIN_${blockTy} param1 param2
This is.
Some text.
#+END_${blockTy}`, blockTy, [paragraph([text('This is.'), text(' '), text('Some text.')])], { params: ['param1', 'param2'] });

        testGreaterBlock('correct parent for contents',
          `#+BEGIN_${blockTy}
Text.
#+END_${blockTy}`, blockTy, [paragraph([text('Text.')], { parent: { type: 'greater_block' } as any })]);
      });
    }
  });

  describe('special blocks', () => {
    for (const blockTy of ['FOO', 'BAR']) {
      describe(`${blockTy} block`, () => {
        const otherBlock = blockTy === 'FOO' ? 'BAR' : 'FOO';
        testSpecialBlock('open and close',
          `#+BEGIN_${blockTy}
#+END_${blockTy}`, blockTy, []);

        testSpecialBlock('special blocks can appear in special block content',
          `#+BEGIN_${blockTy}
#+BEGIN_${otherBlock}
You can nest other special blocks inside a special block.
#+END_${otherBlock}

And more text.
#+END_${blockTy}`, blockTy, [specialBlock(otherBlock, [paragraph([text('You can nest other special blocks inside a special block.')])]), paragraph([text('And more text.')])]);

        testSpecialBlock('you can nest special blocks of the same type (one nesting)',
          `#+BEGIN_${blockTy}
#+BEGIN_${blockTy}
You can nest the same block.
#+END_${blockTy}

And more text.
#+END_${blockTy}`, blockTy, [specialBlock(blockTy, [paragraph([text('You can nest the same block.')])]), paragraph([text('And more text.')])]);

        testSpecialBlock('name casing ignored',
          `#+BEGIN_${blockTy.toLowerCase()}
#+END_${blockTy.toLowerCase()}`, blockTy, []);

        testSpecialBlock('with params',
          `#+BEGIN_${blockTy} param1 param2
This is.
Some text.
#+END_${blockTy}`, blockTy, [paragraph([text('This is.'), text(' '), text('Some text.')])], { params: ['param1', 'param2'] });

        testSpecialBlock('correct parent for contents',
          `#+BEGIN_${blockTy}
Text.
#+END_${blockTy}`, blockTy, [paragraph([text('Text.')], { parent: { type: 'special_block' } as any })]);
      });
    }
  });

  describe('block elements', () => {
    testBlock('export block with DATA being one word', '#+BEGIN_EXPORT okay\n#+END_EXPORT', 'EXPORT', '', { params: ['okay'] });

    for (const blockTy of ['COMMENT', 'EXAMPLE', 'EXPORT', 'SRC'] as Block['name'][]) {
      testBlock(`CONTENTS not parsed in "${blockTy}" block`, `#+BEGIN_${blockTy} p\n*some data*\n#+END_${blockTy}`, blockTy, '*some data*', { params: ['p'] });
    }

    describe('verse block', () => {
      // the verse block is special (out of block elements) in that it
      // can contain Org objects.

      testVerseBlock('empty verse block', '', []);

      testVerseBlock('can contain text markup', '*Hi* +there+', [textBold('Hi'), text(' '), textStrikethrough('there')]);

      testVerseBlock('paragraphs read as text', `With

Paragraph.`, [text('With'), text(' '), text(' '), text('Paragraph.')]);

      testVerseBlock('nested verse block read as text', `#+BEGIN_VERSE
text`, [text('#+BEGIN_VERSE'), text(' '), text('text')]);

      testVerseBlock('blocks read as text', `#+BEGIN_SRC foo
some text
#+END_SRC`, [text('#+BEGIN_SRC foo'), text(' '), text('some text'), text(' '), text('#+END_SRC')]);

      testVerseBlock('lists read as text', `- item 1
- item 2`, [text('-'), text('item 1'), text(' '), text('-'), text('item 2')]);

      testVerseBlock('heading read as text', '* Heading', [text('*'), text('Heading')]);

      testVerseBlock('heading with markup', '* *Heading*', [text('*'), textBold('Heading')]);
    });
  });
});
