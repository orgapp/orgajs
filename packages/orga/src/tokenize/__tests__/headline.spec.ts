import {
  testLexer,
  testLexerMulti,
  tokNewline,
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
    testHeadline("* TODO [#A] a headline     :tag1:tag2:", 1, [tokTodo("TODO", true), tokPriority("A"), tokText("a headline"), tokTags(["tag1", "tag2"])]),
    testHeadline("* TODO [#A] a headline :tag1:123:#hash:@at:org-mode:under_score:98%:", 1, [tokTodo("TODO", true), tokPriority("A"), tokText("a headline"), tokTags(["tag1", "123", "#hash", "@at", "org-mode", "under_score", "98%"])]),
  ]);

  testLexer("DONE todo keyword", ...testHeadline("* DONE heading", 1, [tokTodo("DONE", false), tokText("heading")]));

  testLexerMulti("knows these are not headlines", [
    ["*not a headline", [tokText("*not a headline")]],
    [" * not a headline", [tokText("* not a headline")]],
    ["*_* not a headline", [tokTextBold("_"), tokText(" not a headline")]],
    ["not a headline", [tokText("not a headline")]],
  ]);

  describe("recognition of blank headings", () => {
    testLexerMulti("stars with no spaces are not considered to be headings",
      ["*", "**"].map(c => [c, [tokText(c)]]));
    describe("whitespace after stars are considered to be headings", () => {
      testLexer("star with a space is considered a blank heading", ...testHeadline("* ", 1, []));
      testLexer("star with multiple whitespace is considered a blank heading", ...testHeadline("*  \t", 1, []));
    });
    describe("todo keyword", () => {
      // v2021.07.03 spec is ambigious as to what this should be, but
      // implies that 'TODO' should be treated as a keyword ("TITLE
      // [...] will match after every other part have been
      // matched."). The Org parser treats this as text. (2021-07-06)
      testLexer("without space is keyword (TODO)", ...testHeadline("* TODO", 1, [tokTodo("TODO", true)]));
      testLexer("without space is keyword (DONE)", ...testHeadline("* DONE", 1, [tokTodo("DONE", false)]));
      testLexer("with space is keyword", ...testHeadline("* TODO ", 1, [tokTodo("TODO", true)]));
    });
    describe("priority cookie", () => {
      testLexer("without space is cookie", ...testHeadline("* [#A]", 1, [tokPriority("A")]));
      testLexer("with space is cookie", ...testHeadline("* [#A] ", 1, [tokPriority("A")]));
    });
    describe("tags", () => {
      // ambigious in v2021.07.03 spec, but Org parser does it like this (2021-07-06)
      testLexer("are treated as part of headline text if headline text is blank", ...testHeadline("*   :tag:", 1, [tokText(":tag:")]));
    });
  });

  testLexerMulti("examples from spec v2021.07.03", [
    testHeadline("* ", 1, []),
    // TODO: unclear in v2021.07.03 spec whether this should be
    // treated as an empty headline with keyword, or headline with
    // text 'DONE'. Org parser does the latter (2021-07-06)
    testHeadline("** DONE", 2, [tokTodo("DONE", false)]),
    testHeadline("*** Some e-mail", 3, [tokText("Some e-mail")]),
    // TODO: 'COMMENT' should be treated specially here according to the spec
    testHeadline("* TODO [#A] COMMENT Title :tag:a2%:", 1, [tokTodo("TODO", true), tokPriority("A"), tokText("COMMENT Title"), tokTags(["tag", "a2%"])]),
  ]);

  describe("priority cookies", () => {
    testLexer('empty priority cookie is text', ...testHeadline("* [#]", 1, [tokText("[#]")]));
    testLexer('uppercase letter is ok', ...testHeadline("* [#A]", 1, [tokPriority("A")]));
    testLexer('lowercase letter is ok', ...testHeadline("* [#a]", 1, [tokPriority("a")]));
    // v2021.07.03 of the spec says that the priority is "a single
    // letter" - it is ambiguous as to whether this means 'character',
    // or includes digits etc., but the Org parser currently accepts
    // any single (ASCII) character tried (including ']') except
    // newline (2021-07-06)
    testLexerMulti('nonletters okay', [
      '1', '-', '_', '?', '#', ' ', '\t', '', '\\', ']',
    ].map(c => testHeadline(`* [#${c}]`, 1, [tokPriority(c)])));

    testLexer('newline not okay', '* [#\n]', [tokStars(1), tokText('[#'), tokNewline(), tokText(']')]);

    testLexer('multi character not allowed', ...testHeadline('* [#AB]', 1, [tokText('[#AB]')]));
  });
});
