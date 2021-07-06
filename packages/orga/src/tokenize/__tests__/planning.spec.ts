import {
  testLexer,
  testLexerMulti,
  tokPlanningKeyword,
  tokPlanningTimestamp,
  tokText,
} from './util';

const options = {
  timezone: "Pacific/Auckland",
}

// TODO: lexer shouldn't be doing anything like parsing timestamps (2021-07-06)
describe("tokenize planning", () => {

  // TODO: make sure we don't get the space in the text for the deadline _text, perhaps (2021-07-06)
  testLexerMulti("knows plannings",
    ["", "  ", "\t", " \t "].map(ws => [`${ws}DEADLINE: <2018-01-01 Mon>`, [tokPlanningKeyword("DEADLINE"), tokPlanningTimestamp({ date: new Date("2017-12-31T11:00:00.000Z") }, { _text: " <2018-01-01 Mon>" })]]), options);

  testLexer("know multiple plannings",
    "DEADLINE: <2020-07-03 Fri> SCHEDULED: <2020-07-03 Fri>", [
    tokPlanningKeyword("DEADLINE"), tokPlanningTimestamp({ date: new Date("2020-07-02T12:00:00.000Z") }),
    tokPlanningKeyword("SCHEDULED"), tokPlanningTimestamp({ date: new Date("2020-07-02T12:00:00.000Z") }),
  ], options);

  testLexer("knows these are not plannings", "dEADLINE: <2018-01-01 Mon>", [tokText("dEADLINE: <2018-01-01 Mon>")]);
});
