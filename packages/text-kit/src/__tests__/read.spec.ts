import { Point, Position } from 'unist';
import read from '../read';

const point = (line: number, column: number): Point => ({ line, column });

type Reader = ReturnType<typeof read>;

const pos = ([startLine, startColumn]: [number, number], [endLine, endColumn]: [number, number]): Position => ({
  start: point(startLine, startColumn),
  end: point(endLine, endColumn),
});

const testReader = (testName: string, text: string, op: (r: Reader) => void) => {
  return it(testName, () => {
    op(read(text));
  });
};

describe("numberOfLines", () => {
  const testNumberOfLines = (testName: string, text: string, expected: number) => {
    return testReader(testName, text, r => expect(r.numberOfLines).toEqual(expected));
  };

  testNumberOfLines("with empty string", "", 0);
  testNumberOfLines("just a newline", "\n", 1);
  testNumberOfLines("with one newline", "test\n", 1);
  testNumberOfLines("with some newlines", "test1\ntest2\n", 2);
  testNumberOfLines("starts with newline", "\ntest", 2);
  testNumberOfLines("ends with newline", "test\n", 1);
});

describe("substring", () => {
  const testSubstring = (testName: string, text: string, testArg: Parameters<Reader['substring']>[number], expected: ReturnType<Reader['substring']>) => {
    return testReader(testName, text, r => expect(r.substring(testArg)).toEqual(expected));
  };

  describe("out-of-bounds", () => {
    testSubstring("start line before beginning of document, end after", "test", pos([-1, 1], [2, 1]), "test");
    testSubstring("start line in document, end after", "test", pos([1, 1], [2, 1]), "test");
    testSubstring("start line before beginning of document, end within", "test", pos([-1, 1], [1, 2]), "te");
    testSubstring("end is before start", "test", pos([1, 4], [1, 1]), "");
  });

  testSubstring("within line", "tests", pos([1, 2], [1, 4]), "est");
  testSubstring("over multiple lines", "tests\ntests\ntests", pos([1, 3], [3, 3]), "sts\ntests\ntes");

  describe("end is EOL", () => {
    testSubstring("with one line", "test", { start: point(1, 1), end: 'EOL' }, "test");
    testSubstring("with multiple lines", "test1\ntest2\ntest3", { start: point(2, 1), end: 'EOL' }, "test2\n");
  });

  describe("end is EOF", () => {
    testSubstring("with one line", "test", { start: point(1, 1), end: 'EOF' }, "test");
    testSubstring("with multiple lines", "test1\ntest2\ntest3", { start: point(2, 1), end: 'EOF' }, "test2\ntest3");
    testSubstring("with multiple lines and ending newline", "test1\ntest2\ntest3\n", { start: point(2, 1), end: 'EOF' }, "test2\ntest3\n");
  });

  describe("with only start specified (default is EOL)", () => {
    testSubstring("single line", "test", { start: point(1, 1) }, "test");
    testSubstring("multiple lines", "test1\ntest2\ntest3", { start: point(2, 1) }, "test2\n");
  });
});

describe("linePosition", () => {
  const testLinePosition = (testName: string, text: string, line: number, expected: ReturnType<Reader['linePosition']>) => {
    return testReader(testName, text, r => expect(r.linePosition(line)).toEqual(expected));
  };

  describe("out-of-bounds lines", () => {
    testLinePosition("line < 1", "test", 0, undefined);
    testLinePosition("line > number of lines", "test", 2, undefined);
  });

  testLinePosition("only line", "test", 1, pos([1, 1], [1, 4]));
  testLinePosition("line with newline", "test\n", 1, pos([1, 1], [1, 5]));
  testLinePosition("middle line", "test\ntest\ntest", 2, pos([2, 1], [2, 5]));
});

describe("location", () => {
  const testLocation = (testName: string, text: string, loc: number, expectedPoint: Point) => {
    return testReader(testName, text, r => expect(r.location(loc)).toEqual(expectedPoint));
  };

  describe("location out of range", () => {
    testLocation("empty document", "", 0, point(1, 1));
    testLocation("index too high", "test", 4, point(1, 4));
    testLocation("negative index", "test", -1, point(1, 1));
  });

  describe("location in bounds", () => {
    testLocation("beginning of line", "test", 0, point(1, 1));
    testLocation("end of line", "test", 3, point(1, 4));
    testLocation("beginning of document", "test\ntest", 0, point(1, 1));
    testLocation("end of document", "test\ntest", 8, point(2, 4));
    testLocation("next line", "test\ntest", 5, point(2, 1));
    testLocation("middle of text", "tests\ntests\ntests", 8, point(2, 3));
  });
});

describe("match", () => {
  const testMatch = (testName: string, text: string, testArgs: Parameters<Reader['match']>, expected: [Position, string[]] | undefined) => {
    return testReader(testName, text, r => expect(r.match(...testArgs)).toEqual(expected && { position: expected[0], captures: expected[1] }));
  };

  describe("multiline", () => {
    testMatch("star", "_Test\nTest_", [/[\s\S]*/m, pos([1, 1], [2, 5])], [pos([1, 1], [2, 5]), ["_Test\nTest_"]]);
    testMatch("star without multiline flag", "_Test\nTest_", [/[\s\S]*/, pos([1, 1], [2, 5])], [pos([1, 1], [2, 5]), ["_Test\nTest_"]]);
    testMatch("explicit", "_Test\nTest_", [/_Test\nTest_/m, pos([1, 1], [2, 5])], [pos([1, 1], [2, 5]), ["_Test\nTest_"]]);
    testMatch("explicit without multiline flag", "_Test\nTest_", [/_Test\nTest_/, pos([1, 1], [2, 5])], [pos([1, 1], [2, 5]), ["_Test\nTest_"]]);
  });

  testMatch("with capture groups", "Test", [/T(es(t))/, pos([1, 1], [1, 4])], [pos([1, 1], [1, 4]), ["Test", "est", "t"]]);
  testMatch("with non-match", "Test", [/nope/, pos([1, 1], [1, 4])], undefined);

  testMatch("un-anchored match in part of text", "Test", [/es/, pos([1, 1], [1, 4])], [pos([1, 2], [1, 3]), ["es"]]);

  describe("with position restriction", () => {
    testMatch("part of document, match anchored", "Test\nTest", [/^st\nTe$/, pos([1, 3], [2, 2])], [pos([1, 3], [2, 2]), ["st\nTe"]]);
    testMatch("part of document, match un-anchored", "Test\nTest", [/st\nTe/, pos([1, 3], [2, 2])], [pos([1, 3], [2, 2]), ["st\nTe"]]);
    testMatch("restriction prevents match", "Test\nTest", [/Test/, pos([1, 3], [2, 2])], undefined);
  });

  testMatch("match against empty string", "", [new RegExp(""), pos([1, 1], [1, 1])], undefined);
  testMatch("empty match", "Test", [new RegExp(""), pos([1, 1], [1, 4])], [pos([1, 1], [1, 1]), [""]]);
  testMatch("empty match with position restriction", "Test", [new RegExp(""), pos([1, 1], [1, 1])], [pos([1, 1], [1, 1]), [""]]);
  testMatch("if end is before start this is undefined", "Test\nTest", [/Test/, pos([2, 1], [1, 1])], undefined);
  testMatch("if end is before start this is undefined (even with empty RegExp)", "Test\nTest", [new RegExp(""), pos([2, 1], [1, 1])], undefined);
});

describe("toIndex", () => {
  const testToIndex = (testName: string, text: string, [line, column]: [number, number], expectedIndex: number) => {
    return testReader(testName, text, r => expect(r.toIndex({ line, column })).toEqual(expectedIndex));
  };

  describe("index out of bounds", () => {
    testToIndex("empty document", "", [1, 1], 0);
    testToIndex("negative line", "test", [-1, 1], 0);
    testToIndex("negative column", "test", [1, -1], 0);
    testToIndex("negative column next line", "test\ntest", [2, -1], 5);
    testToIndex("line too low", "test", [0, 1], 0);
    testToIndex("line too high", "test", [2, 1], 3);
    testToIndex("column too low", "test\ntest", [2, 0], 5);
    testToIndex("column too high", "test", [1, 7], 3);
    testToIndex("column too high ends with newline", "test\n", [1, 7], 4);
    testToIndex("column too high multiple lines", "test\ntest", [1, 7], 4);
  });

  describe("index in bounds", () => {
    testToIndex("beginning of line", "test", [1, 1], 0);
    testToIndex("end of line", "test", [1, 4], 3);
    testToIndex("beginning of next line", "test\ntest", [2, 1], 5);
    testToIndex("middle of line", "tests", [1, 3], 2);
    testToIndex("middle of document", "tests\ntests\ntests", [2, 3], 8);
  });
});

describe("shift", () => {
  const testShift = (testName: string, text: string, testArgs: Parameters<Reader['shift']>, expected: ReturnType<Reader['shift']>) => {
    return testReader(testName, text, r => expect(r.shift(...testArgs)).toEqual(expected));
  };

  describe("out-of-bounds shifts", () => {
    testShift("shifting beyond end of document", "test", [point(1, 1), 6], point(1, 4));
    testShift("shifting before start of document", "test", [point(1, 1), -1], point(1, 1));
  });

  describe("in-bounds shifts", () => {
    testShift("shift to start of next line", "test\ntest", [point(1, 4), 2], point(2, 1));
    testShift("shift to start of next line (on newline)", "test\ntest", [point(1, 5), 1], point(2, 1));
    testShift("shift to end of previous newline", "test\ntest", [point(2, 1), -1], point(1, 5));
    testShift("shift to end of previous line", "test\ntest", [point(2, 1), -2], point(1, 4));
  });
});
