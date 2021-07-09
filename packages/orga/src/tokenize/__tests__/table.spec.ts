import {
  pos,
  testLexer,
  testLexerMulti,
  tokTableColumnSeparator,
  tokTableRule,
  tokText,
} from './util';

describe("tokenize table", () => {
  const testTableRule = (text: string, leading: string = ""): Parameters<typeof testLexerMulti>[1][number] => {
    return [`${leading}${text}`, [tokTableRule({ _text: text })]];
  };

  testLexerMulti("knows table hr", [
    testTableRule("|----+---+----|"),
    testTableRule("|--=-+---+----|"),
    testTableRule("|----+---+----|", "  "),
    testTableRule("|----+---+----"),
    testTableRule("|---"),
    testTableRule("|-"),
  ]);

  testLexer("knows these are not table separators", "----+---+----|", [tokText("----+---+----|")]);

  testLexerMulti("knows table rows", [
    ["| batman | superman | wonder woman |", [tokTableColumnSeparator(), tokText(" batman "), tokTableColumnSeparator(), tokText(" superman "), tokTableColumnSeparator(), tokText(" wonder woman "), tokTableColumnSeparator()]],
    ["| hello | world | y'all |", [tokTableColumnSeparator(), tokText(" hello "), tokTableColumnSeparator(), tokText(" world "), tokTableColumnSeparator(), tokText(" y'all "), tokTableColumnSeparator()]],
    ["   | hello | world | y'all |", [tokTableColumnSeparator(), tokText(" hello "), tokTableColumnSeparator(), tokText(" world "), tokTableColumnSeparator(), tokText(" y'all "), tokTableColumnSeparator()]],
    ["|    hello |  world   |y'all |", [tokTableColumnSeparator(), tokText("    hello "), tokTableColumnSeparator(), tokText("  world   "), tokTableColumnSeparator(), tokText("y'all "), tokTableColumnSeparator()]],
  ]);

  testLexer("with empty cell", "||  world   | |", [tokTableColumnSeparator(), tokTableColumnSeparator(), tokText("  world   "), tokTableColumnSeparator(), tokText(" "), tokTableColumnSeparator()]);

  // TODO: the concept of table rows doesn't exist in the lexer,
  // perhaps move the latter tests? (2021-07-06)
  testLexerMulti("knows these are not table rows", [
    [" hello | world | y'all |", [tokText("hello | world | y'all |")]],
    ["|+", [tokTableColumnSeparator(), tokText("+")]],
  ]);

  testLexer('pipe in markup starts new cell', "| *mark|up* |", [
    tokTableColumnSeparator(), tokText(" *mark"), tokTableColumnSeparator(), tokText("up* "), tokTableColumnSeparator()
  ]);

  testLexer('correct positions for table tokens', "| Test |", [
    tokTableColumnSeparator({ position: pos([1, 1], [1, 2]) }),
    tokText(" Test ", { position: pos([1, 2], [1, 8]) }),
    tokTableColumnSeparator({ position: pos([1, 8], [1, 9]) }),
  ]);
});
