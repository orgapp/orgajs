import { Position } from 'unist'
import { tokenize } from '../../tokenize'
import {
  Document,
  Headline,
  PhrasingContent,
  Section,
  Stars,
} from '../../types'
import { parse } from '../index'

describe.skip('Parse Paragraph', () => {
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

  const testDocument = (
    testName: string,
    text: string,
    expected: Document['children']
  ) => {
    it(testName, () => {
      expect(parse(tokenize(text))).toMatchObject({
        type: 'document',
        children: expected,
      })
    })
  }

  const text = (text: string, pos?: Position): PhrasingContent => ({
    type: 'text',
    value: text,
    ...(pos === undefined ? {} : { position: pos }),
  })

  const anonFootnote = (children: PhrasingContent[]): PhrasingContent => ({
    type: 'footnote.reference',
    label: '',
    children: children,
  })

  const pos = (
    [startLine, startCol]: [number, number],
    [endLine, endCol]: [number, number]
  ): Position => ({
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  })

  const headline = (
    level: number,
    content: string,
    pos?: Position
  ): Headline => ({
    type: 'headline',
    level: level,
    actionable: false,
    content: content,
    children: [
      {
        type: 'stars',
        level: level,
      } as Stars,
      text(content),
      { type: 'newline' },
    ],
    ...(pos === undefined ? {} : { position: pos }),
  })

  const section = (
    level: number,
    headingContent: string,
    sectionBody: Section['children'],
    pos?: Position
  ): Section => ({
    type: 'section',
    level: level,
    properties: {},
    children: [headline(level, headingContent), ...sectionBody],
    ...(pos === undefined ? {} : { position: pos }),
  })

  describe('property drawers', () => {
    testDocument('closed property drawer', '* Heading\n:PROPERTIES:\n:END:', [
      section(1, 'Heading', [
        {
          type: 'drawer',
          name: 'PROPERTIES',
          value: '',
        },
      ]),
    ])

    testDocument(
      'closed property drawer with property',
      '* Heading\n:PROPERTIES:\n:PROP: 1\n:END:',
      [
        section(1, 'Heading', [
          {
            type: 'drawer',
            name: 'PROPERTIES',
            value: ':PROP: 1',
          },
        ]),
      ]
    )

    testDocument('unclosed property drawer', '* Heading\n:PROPERTIES:', [
      section(1, 'Heading', [
        {
          type: 'paragraph',
          attributes: {},
          children: [text(':PROPERTIES:', pos([2, 1], [2, 13]))],
          position: pos([2, 1], [2, 13]),
        },
      ]),
    ])

    testDocument(
      'unclosed property drawer with extra text',
      '* Heading\n:PROPERTIES:\nmore text',
      [
        section(1, 'Heading', [
          {
            type: 'paragraph',
            attributes: {},
            children: [
              text(':PROPERTIES:', pos([2, 1], [2, 13])),
              text(' ', pos([2, 13], [3, 1])),
              text('more text', pos([3, 1], [3, 10])),
            ],
            position: pos([2, 1], [3, 10]),
          },
        ]),
      ]
    )
  })
})
