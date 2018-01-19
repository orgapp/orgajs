const Lexer = require('../lexer')

describe('Lexer', () => {
  it('recognize headlines', () => {
    let lexer = new Lexer()
    expect(lexer.tokenize('* TODO [#A] headline one     :swift:javascript:')).toMatchSnapshot()
  })

  it('recognize planning', () => {
    let lexer = new Lexer()
    // t = lexer.tokenize('DEADLINE: <2018-01-01 Mon>')
    // console.log(t)
    expect(lexer.tokenize('DEADLINE: <2018-01-01 Mon>')).toMatchSnapshot()
  })

})
