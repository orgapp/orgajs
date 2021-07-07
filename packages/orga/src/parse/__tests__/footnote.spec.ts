import {
  anonFootnote,
  footnote,
  footnoteReference,
  heading,
  headline,
  inlineFootnote,
  paragraph,
  pos,
  section,
  testParse,
  testParseSection,
  text
} from './util';


describe('footnote reference', () => {
  function testParagraph(testName: string, inText: string, ...expected: Parameters<typeof paragraph>) {
    return testParseSection(testName, inText, [paragraph(...expected)]);
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
});

describe('footnote definition', () => {
  testParse('footnote belongs to a section, and is broken by a heading', `* Heading

[fn:1] This is a footnote definition.

** Heading breaks footnote.`, [
    headline(1, 'Heading', [
      section([footnote('1', [paragraph([text('This is a footnote definition.')])])]),
      heading(2, 'Heading breaks footnote.'),
    ])
  ]);

  testParseSection('footnote inside a footnote starts another footnote instead', '[fn:1] Foot1\n[fn:2] Foot2', [
    footnote('1', [paragraph([text('Foot1')])]),
    footnote('2', [paragraph([text('Foot2')])]),
  ]);
});
