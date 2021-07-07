import {
  testLexerMulti,
  tokFootnoteLabel,
  tokFootnoteReference,
  tokText,
} from './util';

import { Token } from '../../types';

describe("tokenize footnote", () => {
  const testFootnoteLabel = (fullText: string, fnText: string, label: string, extra: Token[] = []): Parameters<typeof testLexerMulti>[1][number] => {
    return [fullText, [tokFootnoteLabel(label, { _text: fnText }), ...extra]];
  };
  testLexerMulti("knows footnote labels", [
    testFootnoteLabel("[fn:1] a footnote", "[fn:1]", "1", [tokText("a footnote")]),
    testFootnoteLabel("[fn:word] a footnote", "[fn:word]", "word", [tokText("a footnote")]),
    testFootnoteLabel("[fn:word_] a footnote", "[fn:word_]", "word_", [tokText("a footnote")]),
    testFootnoteLabel("[fn:wor1d_] a footnote", "[fn:wor1d_]", "wor1d_", [tokText("a footnote")]),
    // DISCREPANCY: v2021.07.03 of the spec shows "[fn:LABEL]
    // CONTENTS", but the parser allows for no space between the ] and
    // CONTENTS. We follow the parser in this case (which also allows
    // empty CONTENTS). (2021-07-07)
    testFootnoteLabel("[fn:1]:", "[fn:1]", "1", [tokText(":")]),
    testFootnoteLabel("[fn:1]", "[fn:1]", "1", []),
  ]);

  testLexerMulti("knows these are not footnotes", [
    [" [fn:1] not a footnote", [tokFootnoteReference("1", []), tokText(" not a footnote")]],
    ["[[fn:1] not a footnote", [tokText("["), tokFootnoteReference("1", []), tokText(" not a footnote")]],
    ["\t[fn:1] not a footnote", [tokFootnoteReference("1", []), tokText(" not a footnote")]],
  ]);
});
