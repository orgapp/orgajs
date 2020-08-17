import { parse } from "../../parse"
import { tokenize } from "../../tokenize"

var fs = require("fs")
var path = require("path")

let data = fs.readFileSync(path.join(__dirname, "tests.json"))
let tests = JSON.parse(data)

describe("Parser", () => {
  test.each(tests)("%s", (testname, fname) => {
    var content = fs.readFileSync(path.join(__dirname, fname))
    const document = parse(tokenize(String(content)))
    expect(document).toMatchSnapshot()
  });
});
