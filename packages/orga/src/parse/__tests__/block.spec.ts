import debug from './debug'
import { Block } from '../../types';

import {
  block,
  paragraph,
  testParse,
  text,
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
    for (const blockTy of ['QUOTE', 'CENTER']) {
      describe(`${blockTy} block`, () => {
        testBlock('open and close',
          `#+BEGIN_${blockTy}
#+END_${blockTy}`, blockTy, '');

        testBlock('with data',
          `#+BEGIN_${blockTy}
This is.
Some text.
#+END_${blockTy}`, blockTy, 'This is.\nSome text.');

        testBlock('with params',
          `#+BEGIN_${blockTy} param1 param2
This is.
Some text.
#+END_${blockTy}`, blockTy, 'This is.\nSome text.', { params: ['param1', 'param2'] });
      });
    }
  });

  describe('block elements', () => {
    testBlock('export block with DATA being one word', '#+BEGIN_EXPORT okay\n#+END_EXPORT', 'EXPORT', '', { params: ['okay'] });

    for (const blockTy of ['COMMENT', 'EXAMPLE', 'EXPORT', 'SRC']) {
      testBlock(`CONTENTS not parsed in "${blockTy}" block`, `#+BEGIN_${blockTy} p\n*some data*\n#+END_${blockTy}`, blockTy, '*some data*', { params: ['p'] });
    }
  });
});
