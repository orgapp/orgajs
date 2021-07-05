import {
  testLexer,
  testLexerMulti,
  tokText,
} from './util';

describe("Tokenize Blanks", () => {
  testLexerMulti("knows blank",
    ["", " ", "    ", "\t", " \t", "\t ", " \t  "].map(c => [c, []])
  );

  testLexer("knows these are not blanks", " a ", [tokText("a ")]);
});
