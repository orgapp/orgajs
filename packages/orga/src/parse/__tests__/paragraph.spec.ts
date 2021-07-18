import {
  inlineFootnote,
  link,
  paragraph,
  pos,
  section,
  testParse,
  testParseSection,
  text,
  textBold,
  textBoldC,
  textCode,
  textItalic,
  textItalicC,
  textStrikethrough,
  textStrikethroughC,
  textUnderline,
  textUnderlineC,
  textVerbatim,
} from './util';

describe('Parse Paragraph', () => {
  testParse('complex example', `
#+ATTR_HTML: :style background: black;
[[https://github.com/xiaoxinghu/orgajs][Here's]] to the *crazy* ones, the /misfits/, the _rebels_, the ~troublemakers~,
the round pegs in the +round+ square holes...

#+ATTR_HTML: :width 300
[[file:logo.png]]
`, [
    section([
      paragraph([
        link("https://github.com/xiaoxinghu/orgajs", {
          parent: { type: 'paragraph' } as any,
          description: "Here's",
          position: pos([3, 1], [3, 49]),
        }),
        text(" to the ", {
          parent: { type: 'paragraph' } as any,
          position: pos([3, 49], [3, 57]),
        }),
        textBold("crazy", {
          parent: { type: 'paragraph' } as any,
          position: pos([3, 57], [3, 64]),
        }),
        text(" ones, the ", {
          parent: { type: 'paragraph' } as any,
          position: pos([3, 64], [3, 75]),
        }),
        textItalic("misfits", {
          parent: { type: 'paragraph' } as any,
          position: pos([3, 75], [3, 84]),
        }),
        text(", the ", {
          parent: { type: 'paragraph' } as any,
          position: pos([3, 84], [3, 90]),
        }),
        textUnderline("rebels", {
          parent: { type: 'paragraph' } as any,
          position: pos([3, 90], [3, 98]),
        }),
        text(", the ", {
          parent: { type: 'paragraph' } as any,
          position: pos([3, 98], [3, 104]),
        }),
        textCode("troublemakers", {
          parent: { type: 'paragraph' } as any,
          position: pos([3, 104], [3, 119]),
        }),
        text(",", {
          parent: { type: 'paragraph' } as any,
          position: pos([3, 119], [3, 120]),
        }),
        text(" ", {
          parent: { type: 'paragraph' } as any,
          position: pos([3, 120], [4, 1]),
        }),
        text("the round pegs in the ", {
          parent: { type: 'paragraph' } as any,
          position: pos([4, 1], [4, 23]),
        }),
        textStrikethrough("round", {
          parent: { type: 'paragraph' } as any,
          position: pos([4, 23], [4, 30]),
        }),
        text(" square holes...", {
          parent: { type: 'paragraph' } as any,
          position: pos([4, 30], [4, 46]),
        }),
      ], {
        parent: { type: 'section' } as any,
        attributes: {
          attr_html: {
            style: "background: black;",
          },
        },
        position: pos([3, 1], [6, 1]),
      }),
      paragraph([
        link("logo.png", {
          parent: { type: 'paragraph' } as any,
          protocol: "file",
          position: pos([7, 1], [7, 18]),
        }),
      ], {
        parent: { type: 'section' } as any,
        attributes: {
          attr_html: {
            width: 300,
          },
        },
        position: pos([7, 1], [7, 19]),
      }),
    ], {
      parent: { type: 'document' } as any,
      position: pos([2, 1], [7, 19]),
    })
  ],
    {
      properties: {},
      position: pos([2, 1], [7, 19]),
    });

  const testParseParagraph = (testName: string, text: string, ...rest: Parameters<typeof paragraph>) => {
    testParseSection(testName, text, [paragraph(...rest)]);
  };

  describe("code and verbatim only contain text", () => {
    for (const [mup, mf] of [["~", textCode], ["=", textVerbatim]] as const) {
      describe(`markup: ${mup}`, () => {
        testParseParagraph("does not allow links", `${mup}[[link]]${mup}`, [mf("[[link]]")]);
        testParseParagraph("does not allow bold markup", `${mup}*bold*${mup}`, [mf("*bold*")]);
      });
    }
  });

  describe("bold italic strike-through and underline support object contents", () => {
    for (const [mup, mf] of [["*", textBoldC], ["/", textItalicC], ["+", textStrikethroughC], ["_", textUnderlineC]] as const) {
      describe(`markup: ${mup}`, () => {
        testParseParagraph("allows links", `${mup}[[https://duckduckgo.com]]${mup}`, [mf([link("https://duckduckgo.com")])]);
        testParseParagraph("allows bold markup", `${mup}*bold*${mup}`, [mf([textBold("bold")])]);
        testParseParagraph("allows footnote references", `${mup}[fn:name:Test]${mup}`, [mf([inlineFootnote("name", [text("Test")])])]);
      });
    }
    testParseParagraph("nested markup example",
      "*Test1 _test2_ /test3/ te*st =test4=*",
      [textBoldC([text("Test1 "), textUnderline("test2"), text(" "), textItalic("test3"), text(" te*st "), textVerbatim("test4")])]);
  });

  const markupCharsWithFns = [
    ["*", textBold],
    ["=", textVerbatim],
    ["/", textItalic],
    ["+", textStrikethrough],
    ["_", textUnderline],
    ["~", textCode]
  ] as const;
  const markupChars = markupCharsWithFns.map(x => x[0]);

  describe("markup with non-whitespace", () => {
    for (const [mup, mf] of markupCharsWithFns) {
      describe(`markup: ${mup}`, () => {
        // NOTE: Org parser 2.4.4 treats __Test_ as a subscript rather than underline (2021-07-18)
        testParseParagraph(`preceded by self (Org parser 2.4.4)`, `${mup}${mup}Test${mup}`, [mf(`${mup}Test`)]);
        testParseParagraph(`followed by self (Org parser 2.4.4)`, `${mup}Test${mup}${mup}`, [mf(`Test${mup}`)]);
        const excluded = markupChars.filter(x => x !== mup);
        for (const excl of excluded) {
          testParseParagraph(`followed by ${excl} (Org parser 2.4.4)`, `${mup}Test${mup}${excl}`, [text(`${mup}Test${mup}${excl}`)]);
        }
      });
    }
  });
  testParseParagraph("underline mixed markup example (Org parser 2.4.4)", "_Test1 _test2_ /test3/ =test4=_", [textUnderline("Test1 _test2"), text(" "), textItalic("test3"), text(" =test4=_")]);

  testParseParagraph("bold empty (Org parser 2.4.4)", "**", [text("**")]);
  testParseParagraph("bold bold (Org parser 2.4.4)", "****", [textBold("**")]);
  testParseParagraph("bold in bold (Org parser 2.4.4)", "**Test**", [textBoldC([textBold("Test")])]);

  testParseParagraph("pure markup", "_Test1_", [textUnderline("Test1")]);
  testParseParagraph("markup followed by newline", "_Test1_\n", [textUnderline("Test1")]);
  testParseParagraph("markup preceded by newline", "\n_Test1_", [textUnderline("Test1")]);

  describe("multi-line markup", () => {
    describe('"BORDER can be any non-whitespace character" (spec v2021.07.03)', () => {
      testParseParagraph("marker cannot be first in line (start)", "_\nTest1_", [text("_"), text(" "), text("Test1_")]);
      testParseParagraph("marker cannot be first in line (end)", "_Test1\n_", [text("_Test1"), text(" "), text("_")]);
    });

    testParseParagraph("marker with next line ending", "_Test1\nTest2_", [textUnderlineC([text("Test1"), text(" "), text("Test2")])]);

    testParseParagraph("marker with next line ending and spaces", "_Test1\n  Test2_", [textUnderlineC([text("Test1"), text(" "), text("  Test2")])]);

    testParseParagraph("cannot span more than 3 lines (spec v2021.07.03)", "_Test1\nTest2\nTest3\nTest4_", [text("_Test1"), text(" "), text("Test2"), text(" "), text("Test3"), text(" "), text("Test4_")]);

    // NOTE: spec v2021.07.03 states that "BODY can contain any
    // character but may not span over more than 3 lines.", but Org
    // parser 2.4.4 only allows at most 2 lines. (2021-07-13)
    testParseParagraph("cannot span more than 2 lines (Org parser v2.4.4)", "_Test1\nTest2\nTest3_", [text("_Test1"), text(" "), text("Test2"), text(" "), text("Test3_")]);

    testParseSection("marker with full line gap breaks markup", "_Test1\n\nTest2_", [
      paragraph([text("_Test1")]),
      paragraph([text("Test2_")]),
    ]);
  });
});
