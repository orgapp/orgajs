import read from '../read';

const testReader = (testName: string, text: string, op: (r: ReturnType<typeof read>) => void) => {
  return it(testName, () => {
    op(read(text));
  });
};

describe("numberOfLines", () => {
  const testNumberOfLines = (testName: string, text: string, expected: number) => {
    return testReader(testName, text, r => expect(r.numberOfLines).toEqual(expected));
  };

  testNumberOfLines("with empty string", "", 1);
  testNumberOfLines("with one newline", "test\n", 1);
  testNumberOfLines("with some newlines", "test1\ntest2\n", 2);
});
