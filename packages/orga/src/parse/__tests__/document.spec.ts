import {
  heading,
  headline,
  paragraph,
  section,
  testParse,
  text,
} from './util';

describe("document parsing", () => {
  testParse("empty text is just an empty document", "", []);

  describe("spec v2021.07.03: text before the first headline in the document belongs to a section", () => {
    testParse("text alone", "some text", [
      section([paragraph([text("some text")])]),
    ]);

    testParse("text followed by headline", "some text\n* Heading", [
      section([paragraph([text("some text")])]),
      heading(1, "Heading"),
    ]);

    testParse("example from spec v2021.07.03", `An introduction.

* A Headline

  Some text.

** Sub-Topic 1

** Sub-Topic 2

*** Additional entry`, [
      section([paragraph([text("An introduction.")])]),
      headline(1, "A Headline", [
        section([paragraph([text("Some text.")])]),
        heading(2, "Sub-Topic 1"),
        headline(2, "Sub-Topic 2", [
          heading(3, "Additional entry"),
        ]),
      ]),
    ]);
  });
  testParse("section followed by headings", `some text

* Heading 1

* Heading 2`, [
    section([paragraph([text("some text")])]),
    heading(1, "Heading 1"),
    heading(1, "Heading 2"),
  ]);

  testParse("first heading can be any depth", "*** Heading", [
    heading(3, "Heading"),
  ]);

  testParse("headings of same depth (without parent heading) belong to the document",
    "*** Heading 1\n*** Heading 2", [
    heading(3, "Heading 1"),
    heading(3, "Heading 2"),
  ]);

  testParse("if a heading follows a greater heading, it belongs to that heading rather than the document",
    "** Heading 1\n*** Heading 2", [
    headline(2, "Heading 1", [
      heading(3, "Heading 2"),
    ]),
  ]);
});
