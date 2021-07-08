import {
  drawer,
  headline,
  paragraph,
  pos,
  section,
  testParse,
  text,
} from './util';

describe('property drawers', () => {
  testParse('closed property drawer',
    "* Heading\n:PROPERTIES:\n:END:",
    [headline(1, 'Heading', [section([drawer('PROPERTIES', '')])])]);

  testParse('closed property drawer with property',
    "* Heading\n:PROPERTIES:\n:PROP: 1\n:END:",
    [headline(1, 'Heading', [section([drawer('PROPERTIES', ':PROP: 1')])])]);

  for (const [testDesc, textCase] of [
    ['unclosed property drawer', 'PRopErTIES'],
    ['unclosed drawer', 'DRaWeR'],
    ['unopened drawer end', 'eNd']
  ]) {
    const upcase = textCase.toUpperCase();
    const endPos = textCase.length + 3;
    describe(`${testDesc} is treated as text`, () => {
      testParse('basic',
        `* Heading\n:${upcase}:`,
        [headline(1, 'Heading', [section([paragraph(
          [text(`:${upcase}:`, { position: pos([2, 1], [2, endPos]) })],
          { position: pos([2, 1], [2, endPos]) })])])]);

      testParse('casing is preserved',
        `* Heading\n:${textCase}:`,
        [headline(1, 'Heading', [section([paragraph(
          [text(`:${textCase}:`, { position: pos([2, 1], [2, endPos]) })],
          { position: pos([2, 1], [2, endPos]) })])])]);

      testParse('with extra text',
        `* Heading\n:${upcase}:\nmore text`,
        [headline(1, 'Heading', [section([paragraph(
          [
            text(`:${upcase}:`, { position: pos([2, 1], [2, endPos]) }),
            text(' ', { position: pos([2, endPos], [3, 1]) }),
            text('more text', { position: pos([3, 1], [3, 10]) })],
          { position: pos([2, 1], [3, 10]) })])])]);
    });
  }
});
