import {
  paragraph,
  pos,
  section,
  testParse,
  text,
} from './util';

describe('property drawers', () => {
  testParse('closed property drawer',
    "* Heading\n:PROPERTIES:\n:END:",
    [section(1, 'Heading', [{
      type: 'drawer',
      name: 'PROPERTIES',
      value: ''
    }])
    ]);

  testParse('closed property drawer with property',
    "* Heading\n:PROPERTIES:\n:PROP: 1\n:END:",
    [section(1, 'Heading', [{
      type: 'drawer',
      name: 'PROPERTIES',
      value: ':PROP: 1'
    }])]);

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
        [section(1, 'Heading', [paragraph(
          [text(`:${upcase}:`, { position: pos([2, 1], [2, endPos]) })],
          { position: pos([2, 1], [2, endPos]) })])]);

      testParse('casing is preserved',
        `* Heading\n:${textCase}:`,
        [section(1, 'Heading', [paragraph(
          [text(`:${textCase}:`, { position: pos([2, 1], [2, endPos]) })],
          { position: pos([2, 1], [2, endPos]) })])]);

      testParse('with extra text',
        `* Heading\n:${upcase}:\nmore text`,
        [section(1, 'Heading', [paragraph(
          [
            text(`:${upcase}:`, { position: pos([2, 1], [2, endPos]) }),
            text(' ', { position: pos([2, endPos], [3, 1]) }),
            text('more text', { position: pos([3, 1], [3, 10]) })],
          { position: pos([2, 1], [3, 10]) })])]);
    });
  }
});
