/**
 * Utilities for testing the parser.
 */

import { tokenize } from '../../tokenize'
import { parse } from '../index'

import { document, section } from '../utils';

export * from '../utils';

export const testParse = (testName: string, text: string, ...expected: Parameters<typeof document>) => {
  it(testName, () => {
    expect(parse(tokenize(text))).toMatchObject(document(...expected));
  });
}

export const testParseSection = (testName: string, text: string, ...expected: Parameters<typeof section>) => {
  testParse(testName, text, [section(...expected)]);
}
