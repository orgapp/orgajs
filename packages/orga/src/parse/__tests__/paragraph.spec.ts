import { tokenize } from '../../tokenize'
import { parse } from '../index'

import {
  anonFootnote,
  footnoteReference,
  inlineFootnote,
  paragraph,
  pos,
  section,
  testParse,
  text
} from './util';

describe('Parse Paragraph', () => {
  it('works', () => {
    const content = `
#+ATTR_HTML: :style background: black;
[[https://github.com/xiaoxinghu/orgajs][Here's]] to the *crazy* ones, the /misfits/, the _rebels_, the ~troublemakers~,
the round pegs in the +round+ square holes...

#+ATTR_HTML: :width 300
[[file:logo.png]]
`

    //     const content = `
    // [[https://github.com/xiaoxinghu/orgajs][Here's]] some /content/ hello world.
    // `
    expect(parse(tokenize(content))).toMatchSnapshot()
    // debug(content)
  })

  describe('property drawers', () => {
    testParse('closed property drawer',
      "* Heading\n:PROPERTIES:\n:END:",
      [section(1, 'Heading', [{
        type: 'drawer',
        name: 'PROPERTIES',
        value: ''
      }])
      ]);

    testParse('closed property drawer with property',
      "* Heading\n:PROPERTIES:\n:PROP: 1\n:END:",
      [section(1, 'Heading', [{
        type: 'drawer',
        name: 'PROPERTIES',
        value: ':PROP: 1'
      }])]);

    describe('unclosed property drawer is treated as text', () => {
      testParse('basic',
        "* Heading\n:PROPERTIES:",
        [section(1, 'Heading', [{
          type: 'paragraph',
          attributes: {},
          children: [text(':PROPERTIES:', { position: pos([2, 1], [2, 13]) })],
          position: pos([2, 1], [2, 13]),
        }])]);

      testParse('casing is preserved',
        "* Heading\n:PRopErTIES:",
        [section(1, 'Heading', [{
          type: 'paragraph',
          attributes: {},
          children: [text(':PRopErTIES:', { position: pos([2, 1], [2, 13]) })],
          position: pos([2, 1], [2, 13]),
        }])]);

      testParse('with extra text',
        "* Heading\n:PROPERTIES:\nmore text",
        [section(1, 'Heading', [{
          type: 'paragraph',
          attributes: {},
          children: [
            text(':PROPERTIES:', { position: pos([2, 1], [2, 13]) }),
            text(' ', { position: pos([2, 13], [3, 1]) }),
            text('more text', { position: pos([3, 1], [3, 10]) })],
          position: pos([2, 1], [3, 10]),
        }])]);
    });
  });

  function testParagraph(testName: string, inText: string, ...expected: Parameters<typeof paragraph>) {
    return testParse(testName, inText, [paragraph(...expected)]);
  }

  testParagraph('with standard footnote',
    'hello[fn:named] world.', [
    text('hello'),
    footnoteReference('named'),
    text(' world.')
  ]);

  testParagraph('with inline footnote',
    'hello[fn:named:Inline named footnote] world.', [
    text('hello'),
    inlineFootnote('named', [text('Inline named footnote')]),
    text(' world.')
  ]);

  testParagraph('with anonymous footnote',
    'hello[fn::Anonymous footnote] world.', [
    text('hello'),
    anonFootnote([text('Anonymous footnote')]),
    text(' world.')
  ]);

  testParagraph('with anonymous with no body',
    'hello[fn::] world.', [
    text('hello'),
    anonFootnote([text('', { position: pos([1, 11], [1, 11]) })]),
    text(' world.')
  ]);

  testParagraph('with anonymous nested footnote',
    'hello[fn::An [fn::Anonymous footnote]!] world.', [
    text('hello'),
    anonFootnote([text('An '), anonFootnote([text('Anonymous footnote')]), text('!')]),
    text(' world.')
  ]);
})
