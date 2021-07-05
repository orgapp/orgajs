import {
  testLexerMulti,
  tokComment,
  tokText,
} from './util';

describe("tokenize comment", () => {

  const testComment = (text: string, value: string, leading: string = ""): Parameters<typeof testLexerMulti>[1][number] => {
    return [`${leading}${text}`, [tokComment(value, { _text: text })]];
  };

  testLexerMulti("knows comments", [
    testComment("# a comment", "a comment"),
    testComment("# ", ""),
    testComment("# a comment😯", "a comment😯"),
    testComment("# a comment", "a comment", " "),
    testComment("# a comment", "a comment", "  \t  "),
    testComment("#   a comment", "a comment"),
    testComment("#    \t a comment", "a comment"),
  ]);

  testLexerMulti("knows these are not comments", [
    ["#not a comment", [tokText("#not a comment")]],
    ["  #not a comment", [tokText("#not a comment")]],
  ]);
});
