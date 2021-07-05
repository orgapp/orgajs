import {
  testLexerMulti,
  tokDrawerBegin,
  tokDrawerEnd,
  tokText,
} from './util';

describe("tokenize drawer", () => {

  const testDrawerBegin = (text: string, name: string, leading: string = "", trailing: string = ""): Parameters<typeof testLexerMulti>[1][number] => {
    return [`${leading}${text}${trailing}`, [tokDrawerBegin(name, { _text: text })]];
  };

  testLexerMulti("knows drawer begins", [
    testDrawerBegin(":PROPERTIES:", "PROPERTIES"),
    testDrawerBegin(":properties:", "properties", "  "),
    testDrawerBegin(":properties:", "properties", "  ", "  "),
    testDrawerBegin(":prop_erties:", "prop_erties", "  ", "  "),
  ]);

  testLexerMulti("knows these are not drawer begins",
    ["PROPERTIES:", ":PROPERTIES", ":PR OPERTIES:"].map(c => [c, [tokText(c)]])
  );

  const testDrawerEnd = (text: string, leading: string = "", trailing: string = ""): Parameters<typeof testLexerMulti>[1][number] => {
    return [`${leading}${text}${trailing}`, [tokDrawerEnd({ _text: text })]];
  };

  testLexerMulti("knows drawer ends", [
    testDrawerEnd(":END:"),
    testDrawerEnd(":end:", "  "),
    testDrawerEnd(":end:", "  ", "  "),
  ]);

  testLexerMulti("knows these are not drawer ends",
    ["END:", ":END", ":ENDed"].map(c => [c, [tokText(c)]])
  );
});
