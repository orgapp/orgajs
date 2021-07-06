import {
  testLexerMulti,
  tokKeyword,
  tokText,
} from './util';

describe("tokenize keywords", () => {

  const testKeyword = (text: string, key: string, value: string, leading: string = ""): Parameters<typeof testLexerMulti>[1][number] => {
    return [`${leading}${text}`, [tokKeyword(key, value)]];
  };

  testLexerMulti("knows keywords", [
    testKeyword("#+KEY: Value", "KEY", "Value"),
    testKeyword("#+KEY: Another Value", "KEY", "Another Value"),
    testKeyword("#+KEY: value : Value", "KEY", "value : Value"),
  ]);

  testLexerMulti("knows these are not keywords", [
    "#+KEY : Value", "#+KE Y: Value"
  ].map(c => [c, [tokText(c)]]));
});
