import { tokenize } from '../../tokenize'
import { parse } from '../index'
import { Document, PhrasingContent } from '../../types'
import debug from './debug'

import {
  anonFootnote,
  document,
  footnoteReference,
  inlineFootnote,
  paragraph,
  pos,
  section,
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
    const thing = parse(tokenize(content))
    const lexer = tokenize(content)

    const tree = parse(lexer)

    expect(tree).toMatchSnapshot()
    // debug(content)
  })

  const testDocument = (testName: string, text: string, expected: Document['children']) => {
    it(testName, () => {
      expect(parse(tokenize(text))).toMatchObject({
        type: 'document',
        children: expected
      })
    });
  }

  describe('property drawers', () => {
    testDocument('closed property drawer',
      "* Heading\n:PROPERTIES:\n:END:",
      [section(1, 'Heading', [{
        type: 'drawer',
        name: 'PROPERTIES',
        value: ''
      }])
      ]);

    testDocument('closed property drawer with property',
      "* Heading\n:PROPERTIES:\n:PROP: 1\n:END:",
      [section(1, 'Heading', [{
        type: 'drawer',
        name: 'PROPERTIES',
        value: ':PROP: 1'
      }])]);

    testDocument('unclosed property drawer',
      "* Heading\n:PROPERTIES:",
      [section(1, 'Heading', [{
        type: 'paragraph',
        attributes: {},
        children: [text(':PROPERTIES:', { position: pos([2, 1], [2, 13]) })],
        position: pos([2, 1], [2, 13]),
      }])]);

    testDocument('unclosed property drawer with extra text',
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

  function testParagraph(testName: string, inText: string, expected: PhrasingContent[]) {
    return it(testName, () => {
      expect(parse(tokenize(inText))).toMatchObject(
        document([paragraph(expected)]));
    });
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
