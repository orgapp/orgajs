import {
  link,
  paragraph,
  pos,
  section,
  testParse,
  text,
  textBold,
  textCode,
  textItalic,
  textStrikethrough,
  textUnderline,
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
      position: pos([3, 1], [7, 19]),
    })
  ],
    {
      properties: {},
      position: pos([3, 1], [7, 19]),
    });
});
