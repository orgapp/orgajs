import {
  testLexerMulti,
  tokStars,
  tokTags,
  tokText,
  tokTextBold,
  tokTextUnderline,
  tokTodo,
  tokPriority,
} from './util';

import { Token } from '../../types';

describe("tokenize headline", () => {

  const testHeadline = (text: string, level: number, headlineTokens: Token[]): Parameters<typeof testLexerMulti>[1][number] => {
    return [text, [tokStars(level), ...headlineTokens]];
  };

  testLexerMulti("knows headlines", [
    testHeadline("** a headline", 2, [tokText("a headline")]),
    testHeadline("** _headline_", 2, [tokTextUnderline("headline")]),
    testHeadline("**   a headline", 2, [tokText("a headline")]),
    testHeadline("***** a headline", 5, [tokText("a headline")]),
    testHeadline("* a 😀line", 1, [tokText("a 😀line")]),
    testHeadline("* TODO [#A] a headline     :tag1:tag2:", 1, [tokTodo("TODO"), tokPriority("A"), tokText("a headline"), tokTags(["tag1", "tag2"])]),
    testHeadline("* TODO [#A] a headline :tag1:123:#hash:@at:org-mode:under_score:98%:", 1, [tokTodo("TODO"), tokPriority("A"), tokText("a headline"), tokTags(["tag1", "123", "#hash", "@at", "org-mode", "under_score", "98%"])]),
  ]);

  testLexerMulti("knows these are not headlines", [
    ["*not a headline", [tokText("*not a headline")]],
    [" * not a headline", [tokText("* not a headline")]],
    ["*_* not a headline", [tokTextBold("_"), tokText(" not a headline")]],
    ["not a headline", [tokText("not a headline")]],
  ]);
});
