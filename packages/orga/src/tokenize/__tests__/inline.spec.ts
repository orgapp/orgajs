import {
  testLexer,
  testLexerMulti,
  tokFootnoteAnonymousBegin,
  tokFootnoteInlineBegin,
  tokFootnoteReference,
  tokFootnoteReferenceEnd,
  tokLink,
  tokNewline,
  tokStars,
  tokText,
  tokTextBold,
  tokTextCode,
  tokTextItalic,
  tokTextStrikeThrough,
  tokTextUnderline,
  tokTextVerbatim,
} from './util';

describe("Inline Tokenization", () => {

  testLexer("recon single character", "a", [tokText("a")]);

  testLexer("recon two characters", "ab", [tokText("ab")]);

  testLexer("recon single emphasis", "hello *world*, welcome to *org-mode*.", [
    tokText("hello "), tokTextBold("world"), tokText(", welcome to "), tokTextBold("org-mode"), tokText(".")
  ]);

  testLexerMulti("recon emphasises at different locations", [
    ["one *two* three", [tokText("one "), tokTextBold("two"), tokText(" three")]],
    ["*one* two three", [tokTextBold("one"), tokText(" two three")]],
    ["one two *three*", [tokText("one two "), tokTextBold("three")]],
  ]);

  testLexerMulti("recon link", [
    ["hello [[./image/logo.png]]", [tokText("hello "), tokLink("./image/logo.png", { protocol: "file" })]],
    ["hello [[Internal Link][link]]", [tokText("hello "), tokLink("Internal Link", { protocol: "internal", description: "link" })]],
    ["hello [[../image/logo.png][logo]]", [tokText("hello "), tokLink("../image/logo.png", { protocol: "file", description: "logo" })]],
  ]);

  describe("footnote references", () => {
    testLexer("recon footnote reference", "hello[fn:1] world.", [
      tokText("hello"), tokFootnoteReference("1"), tokText(" world.")
    ]);

    testLexer("recon anonymous footnote reference", 'hello[fn::Anonymous] world.', [
      tokText("hello"), tokFootnoteAnonymousBegin(), tokText("Anonymous"), tokFootnoteReferenceEnd(), tokText(" world.")
    ]);

    testLexer("recon anonymous footnote reference with inner footnote reference", 'hello[fn::[fn::Anonymous]] world.', [
      tokText("hello"), tokFootnoteAnonymousBegin(), tokFootnoteAnonymousBegin(), tokText("Anonymous"), tokFootnoteReferenceEnd(), tokFootnoteReferenceEnd(), tokText(" world.")
    ]);

    // TODO: don't lex empty text in the body, it doesn't really make sense as a token (2021-07-06)
    testLexer("recon anonymous footnote reference with empty body", 'hello[fn::] world.', [
      tokText("hello"), tokFootnoteAnonymousBegin(), tokText(""), tokFootnoteReferenceEnd(), tokText(" world.")
    ]);

    testLexer("recon named inline footnote", 'hello[fn:named:Inline named footnote] world.', [
      tokText("hello"), tokFootnoteInlineBegin("named"), tokText("Inline named footnote"), tokFootnoteReferenceEnd(), tokText(" world.")
    ]);
  });

  describe("recon invalid inline markups", () => {
    testLexerMulti("simple incorrect wrapping", [
      "*,word*", "*word,*", "*'word*", "*word'*", '*"word*', '*word"*', "*word  *"
    ].map(c => [c, [tokText(c)]]));

    testLexerMulti("markup char or pair at start of line",
      ["*", "=", "/", "+", "_", "~"].flatMap(c => [[c, [tokText(c)]], [c.repeat(2), [tokText(c.repeat(2))]]]));

    testLexer("headline-like", "* word*", [tokStars(1), tokText("word*")]);
  });

  testLexerMulti("recon emphasises with 2 chars",
    ["12", "1"].map(c => [`*${c}*`, [tokTextBold(c)]])
  );

  testLexer("recon mixed emphasis",
    "[[https://github.com/xiaoxinghu/orgajs][Here's]] to the *crazy* ones, the /misfits/, the _rebels_, the ~troublemakers~, the round pegs in the +round+ square holes...", [
    tokLink("https://github.com/xiaoxinghu/orgajs", { description: "Here's" }),
    tokText(" to the "), tokTextBold("crazy"), tokText(" ones, the "), tokTextItalic("misfits"),
    tokText(", the "), tokTextUnderline("rebels"), tokText(", the "), tokTextCode("troublemakers"),
    tokText(", the round pegs in the "), tokTextStrikeThrough("round"), tokText(" square holes...")
  ]);

  testLexer("can handle something more complicated", `
Special characters =~= and =!=. Also =~/.this/path= and ~that~ thing.
`, [
    tokNewline(),
    tokText("Special characters "), tokTextVerbatim("~"), tokText(" and "), tokTextVerbatim("!"), tokText(". Also "), tokTextVerbatim("~/.this/path"), tokText(" and "), tokTextCode("that"), tokText(" thing."),
    tokNewline(),
  ]);
});
