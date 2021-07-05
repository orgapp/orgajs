import {
  testLexer,
  testLexerMulti,
  tokBlockBegin,
  tokBlockEnd,
  tokNewline,
  tokText,
  tokTextBold,
} from './util';

import { Token } from '../../types';

describe("tokenize block", () => {
  const testBlockBegin = (text: string, name: string, params: string[]): Parameters<typeof testLexerMulti>[1][number] => {
    return [text, [tokBlockBegin(name, { _text: text, params })]];
  };

  testLexerMulti("knows block begins", [
    testBlockBegin("#+BEGIN_SRC swift", "SRC", ["swift"]),
    testBlockBegin("#+begin_src swift", "src", ["swift"]),
    testBlockBegin("#+begin_example", "example", []),
    testBlockBegin("#+begin_ex😀mple", "ex😀mple", []),
    testBlockBegin("#+begin_src swift :tangle code.swift", "src", ["swift", ":tangle", "code.swift"]),
  ]);

  testLexer("knows these are not block begins",
    "#+begi😀n_src swift",
    [tokText("#+begi😀n_src swift")]);

  const testBlockEnd = (text: string, name: string): Parameters<typeof testLexerMulti>[1][number] => {
    return [text, [tokBlockEnd(name, { _text: text })]];
  };

  testLexerMulti("knows block ends", [
    testBlockEnd("#+END_SRC", "SRC"),
    // not using testBlockEnd for this because the leading spaces get stripped (2021-07-05)
    ["  #+END_SRC", [tokBlockEnd("SRC", { _text: "#+END_SRC" })]],
    testBlockEnd("#+end_src", "src"),
    testBlockEnd("#+end_SRC", "SRC"),
    testBlockEnd("#+end_S😀RC", "S😀RC"),
    testBlockEnd("#+end_SRC ", "SRC"),
  ]);

  testLexer("knows these are not block ends",
    "#+end_src param",
    [tokText("#+end_src param")]);

  describe("verse blocks", () => {
    const testVerseBlock = (testName: string, innerText: string, innerBody: Token[]) => {
      testLexer(testName, `#+BEGIN_VERSE\n${innerText}\n#+END_VERSE`, [
        tokBlockBegin("VERSE"),
        tokNewline(),
        ...innerBody,
        tokNewline(),
        tokBlockEnd("VERSE"),
      ]);
    };

    testVerseBlock("inner block tokenized as text", `#+BEGIN_SRC ts
function () {}
#+END_SRC`, [
      tokText("#+BEGIN_SRC ts"),
      tokNewline(),
      tokText("function () {}"),
      tokNewline(),
      tokText("#+END_SRC"),
    ]);

    testVerseBlock("inner block with markup", `#+BEGIN_EXAMPLE *text*
more text
#+END_EXAMPLE`, [
      tokText("#+BEGIN_EXAMPLE "), tokTextBold("text"),
      tokNewline(),
      tokText("more text"),
      tokNewline(),
      tokText("#+END_EXAMPLE"),
    ]);

    testVerseBlock("heading with markup", "* Heading *with markup*", [
      tokText("* Heading "), tokTextBold("with markup"),
    ]);

    testVerseBlock("lists not tokenized", `- this is not lexed

1. nor is this`, [
      tokText("- this is not lexed"),
      tokNewline(),
      tokNewline(),
      tokText("1. nor is this"),
    ]);

    testVerseBlock("comments not tokenized", "# comment", [tokText("# comment")]);
  });
})
