export type Char = string & { length: 1 };

export const isChar = (c: string): c is Char => c.length === 1;

export function assertChar(c: string): asserts c is Char {
  if (!isChar(c)) {
    throw new Error('expected string of length 1');
  }
};

export const char = (c: string): Char => {
  assertChar(c);
  return c;
}

export const charAt = (c: string, n: number): Char | null => {
  const ch = c.charAt(n);
  return ch ? char(ch) : null;
}
