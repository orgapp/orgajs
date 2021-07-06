import {
  testLexerMulti,
  tokHorizontalRule,
  tokListBullet,
  tokText,
} from './util';

describe("tokenize hr", () => {

  const testHR = (text: string, leading: string = ""): Parameters<typeof testLexerMulti>[1][number] => {
    return [`${leading}${text}`, [tokHorizontalRule({ _text: text })]];
  };

  testLexerMulti("knows horizontal rules", [
    testHR("-----"),
    testHR("------"),
    testHR("--------"),
    testHR("-----", "  "),
    testHR("-----   "),
    testHR("-----   ", "  "),
    testHR("-----  \t ", "  "),
  ]);

  testLexerMulti("knows these are not horizontal rules", [
    ["----", [tokText("----")]],
    ["- ----", [tokListBullet(0, false, { _text: "-" }), tokText("----")]],
    ["-----a", [tokText("-----a")]],
    ["_-----", [tokText("_-----")]],
    ["-----    a", [tokText("-----    a")]],
  ]);
});
