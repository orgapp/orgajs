import {
  testLexer,
  testLexerMulti,
  tokListBullet,
  tokListCheckbox,
  tokListItemTag,
  tokNewline,
  tokText,
} from './util';

import { Token } from '../../types';

describe("tokenize list item", () => {
  testLexerMulti("knows unordered list items",
    ["-", "+"].map(bullet => [`${bullet} buy milk`, [tokListBullet(0, false, { _text: bullet }), tokText("buy milk")]]));

  testLexerMulti("knows ordered list items",
    ["1.", "12.", "123)"].map(bullet => [`${bullet} buy milk`, [tokListBullet(0, true, { _text: bullet }), tokText("buy milk")]]));

  testLexerMulti("knows checkbox list items",
    ["x", "X", "-"].map<[string, Token[]]>(mark => [`- [${mark}] buy milk`, [tokListBullet(0, false), tokListCheckbox(true, { _text: `[${mark}]` }), tokText("buy milk")]]).concat(
      [["- [ ] buy milk", [tokListBullet(0, false), tokListCheckbox(false), tokText("buy milk")]]]));

  testLexer("knows indented list items", "  - buy milk", [tokListBullet(2, false), tokText("buy milk")]);

  describe("knows description list items", () => {
    testLexerMulti("recognises description lists with/without checkbox", [
      ["- item1 :: description here", [tokListBullet(0, false), tokListItemTag("item1"), tokText("description here")]],
      ["- [x] item3 :: description here", [tokListBullet(0, false), tokListCheckbox(true, { _text: '[x]' }), tokListItemTag("item3"), tokText("description here")]],
    ]);
    testLexer("newline after item prevents tag forming", "- item2\n :: description here", [tokListBullet(0, false), tokText("item2"), tokNewline(), tokText(":: description here")]);
  });

  testLexerMulti("knows these are not list items",
    ["-not item", "1.not item", "8)not item", "8a) not item"].map(c => [c, [tokText(c)]]));
});
