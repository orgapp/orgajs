import { tokenize } from '../../tokenize'
import { parse } from '../index'
import { PhrasingContent } from '../../types'
import debug from './debug'

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
    { type: 'footnote.reference', label: 'named' },
    text(' world.')
  ]);

  testParagraph('with inline footnote',
    'hello[fn:named:Inline named footnote] world.', [
    text('hello'),
    {
      type: 'footnote.inline', label: 'named',
      children: [text('Inline named footnote')]
    },
    text(' world.')
  ]);

  testParagraph('with anonymous footnote',
    'hello[fn::Inline named footnote] world.', [
    text('hello'),
    {
      type: 'footnote.anonymous',
      children: [text('Inline named footnote')]
    },
    text(' world.')
  ]);
})
