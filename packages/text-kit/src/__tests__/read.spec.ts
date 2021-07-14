import { Point } from 'unist';
import read from '../read';

const point = (line: number, column: number): Point => ({ line, column });

const testReader = (testName: string, text: string, op: (r: ReturnType<typeof read>) => void) => {
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
