import { tokenize } from '../../tokenize'
import { parse } from '../index'
import { PhrasingContent } from '../../types'
import debug from './debug'
import { Position } from 'unist';

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

  const text = (text: string): PhrasingContent => ({
    type: 'text.plain',
    value: text
  });

  const inlineFootnote = (label: string, children: PhrasingContent[]): PhrasingContent => ({
    type: 'footnote.reference',
    label: label,
    children: children
  });

  const anonFootnote = (children: PhrasingContent[]): PhrasingContent => ({
    type: 'footnote.reference',
    label: '',
    children: children
  });

  const footnoteReference = (label: string): PhrasingContent => ({
    type: 'footnote.reference',
    label: label,
    children: []
  });

  const pos = ([startLine, startCol]: [number, number], [endLine, endCol]: [number, number]): Position => ({
    start: { line: startLine, column: startCol }, end: { line: endLine, column: endCol }
  });

  function testParagraph(testName: string, inText: string, expected: PhrasingContent[]) {
    return it(testName, () => {
      expect(parse(tokenize(inText))).toMatchObject({
        type: 'document',
        children: [{
          type: 'paragraph',
          children: expected
        }],
      });
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
    anonFootnote([{ ...text(''), position: pos([1, 11], [1, 11]) }]),
    text(' world.')
  ]);

  testParagraph('with anonymous nested footnote',
    'hello[fn::An [fn::Anonymous footnote]!] world.', [
    text('hello'),
    anonFootnote([text('An '), anonFootnote([text('Anonymous footnote')]), text('!')]),
    text(' world.')
  ]);
})
