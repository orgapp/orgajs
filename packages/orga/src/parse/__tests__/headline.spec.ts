import {
  heading,
  testParse,
} from "./util";

import { Char } from '../../char';

describe("headings", () => {
  const maxCheckDepth = 5;

  describe(`supports headings of arbitrary depth (checked up to level ${maxCheckDepth})`, () => {
    for (let level = 1; level <= maxCheckDepth; level++) {
      testParse(`heading level ${level}`, `${"*".repeat(level)} Heading`, [heading(level, "Heading")]);
    };
  });

  describe("keywords", () => {
    testParse("with TODO keyword", "* TODO Heading", [heading(1, "Heading", { actionable: true, keyword: "TODO" })]);

    testParse("with DONE keyword", "* DONE Heading", [heading(1, "Heading", { actionable: false, keyword: "DONE" })]);
  });

  describe("priority", () => {
    for (const cookie of ["A", "a", "B"] as Char[]) {
      testParse(`cookie "${cookie}"`, `* [#${cookie}] Heading`, [heading(1, "Heading", { priority: cookie })]);
    }
  });

  describe("tags", () => {
    testParse("separates colon-separated tags into list", "* Heading :tag1:tag2:",
      [heading(1, "Heading", { tags: ["tag1", "tag2"] })]);

    testParse("distinguishes non-tags when preceding tags",
      "* Heading :nottags: :tags:",
      [heading(1, "Heading :nottags:", { tags: ["tags"] })]);
  });

  testParse("complex heading", "* TODO [#A] Heading :nottags: stuff :tag1:tag2:",
    [heading(1, "Heading :nottags: stuff", {
      actionable: true,
      keyword: "TODO",
      tags: ["tag1", "tag2"],
    })]);
});
