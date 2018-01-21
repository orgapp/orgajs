const Lexer = require('../lexer')

describe('Lexer', () => {
  var lexer = new Lexer()

  it('knows table row', () => {
    expect(lexer.tokenize('| batman | superman | wonder woman |')).toMatchSnapshot()
  })

  it('knows blank', () => {
    expect(lexer.tokenize('')).toMatchSnapshot()
    expect(lexer.tokenize(' ')).toMatchSnapshot()
    expect(lexer.tokenize('    ')).toMatchSnapshot()
    expect(lexer.tokenize('\t')).toMatchSnapshot()
    expect(lexer.tokenize(' \t')).toMatchSnapshot()
    expect(lexer.tokenize('\t ')).toMatchSnapshot()
    expect(lexer.tokenize(' \t  ')).toMatchSnapshot()
  })

  it('knows these are not blanks', () => {
    expect(lexer.tokenize(' a ')).toMatchSnapshot()
  })

  it('knows headlines', () => {
    expect(lexer.tokenize('** a headline')).toMatchSnapshot()
    expect(lexer.tokenize('**   a headline')).toMatchSnapshot()
    expect(lexer.tokenize('***** a headline')).toMatchSnapshot()
    expect(lexer.tokenize('* a 😀line')).toMatchSnapshot()
    expect(lexer.tokenize('* TODO [#A] a headline     :tag1:tag2:')).toMatchSnapshot()
  })

  it('knows these are not headlines', () => {
    expect(lexer.tokenize('*not a headline')).toMatchSnapshot()
    expect(lexer.tokenize(' * not a headline')).toMatchSnapshot()
    expect(lexer.tokenize('*_* not a headline')).toMatchSnapshot()
    expect(lexer.tokenize('not a headline')).toMatchSnapshot()
  })

  it('knows keywords', () => {
    expect(lexer.tokenize('#+KEY: Value')).toMatchSnapshot()
    expect(lexer.tokenize('#+KEY: Another Value')).toMatchSnapshot()
    expect(lexer.tokenize('#+KEY: value : Value')).toMatchSnapshot()
  })

  it('knows these are not keywords', () => {
    expect(lexer.tokenize('#+KEY : Value')).toMatchSnapshot()
    expect(lexer.tokenize('#+KE Y: Value')).toMatchSnapshot()
  })

  it('knows plannings', () => {
    expect(lexer.tokenize('DEADLINE: <2018-01-01 Mon>')).toMatchSnapshot()
    expect(lexer.tokenize('  DEADLINE: <2018-01-01 Mon>')).toMatchSnapshot()
    expect(lexer.tokenize(' \tDEADLINE: <2018-01-01 Mon>')).toMatchSnapshot()
    expect(lexer.tokenize(' \t DEADLINE: <2018-01-01 Mon>')).toMatchSnapshot()
  })

  it('knows these are not plannings', () => {
    expect(lexer.tokenize('dEADLINE: <2018-01-01 Mon>')).toMatchSnapshot()
  })

  it('knows block begins', () => {
    expect(lexer.tokenize('#+BEGIN_SRC swift')).toMatchSnapshot()
    expect(lexer.tokenize(' #+BEGIN_SRC swift')).toMatchSnapshot()
    expect(lexer.tokenize('#+begin_src swift')).toMatchSnapshot()
    expect(lexer.tokenize('#+begin_example')).toMatchSnapshot()
    expect(lexer.tokenize('#+begin_ex😀mple')).toMatchSnapshot()
    expect(lexer.tokenize('#+begin_src swift :tangle code.swift')).toMatchSnapshot()
  })

  it('knows these are not block begins', () => {
    expect(lexer.tokenize('#+begi😀n_src swift')).toMatchSnapshot()
  })

  it('knows block ends', () => {
    expect(lexer.tokenize('#+END_SRC')).toMatchSnapshot()
    expect(lexer.tokenize('  #+END_SRC')).toMatchSnapshot()
    expect(lexer.tokenize('#+end_src')).toMatchSnapshot()
    expect(lexer.tokenize('#+end_SRC')).toMatchSnapshot()
    expect(lexer.tokenize('#+end_S😀RC')).toMatchSnapshot()
  })

  it('knows these are not block ends', () => {
    expect(lexer.tokenize('#+end_SRC ')).toMatchSnapshot()
    expect(lexer.tokenize('#+end_src param')).toMatchSnapshot()
  })

  it('knows horizontal rules', () => {
    expect(lexer.tokenize('-----')).toMatchSnapshot()
    expect(lexer.tokenize('------')).toMatchSnapshot()
    expect(lexer.tokenize('--------')).toMatchSnapshot()
    expect(lexer.tokenize('  -----')).toMatchSnapshot()
    expect(lexer.tokenize('-----   ')).toMatchSnapshot()
    expect(lexer.tokenize('  -----   ')).toMatchSnapshot()
    expect(lexer.tokenize('  -----  \t ')).toMatchSnapshot()
  })

  it('knows these are not horizontal rules', () => {
    expect(lexer.tokenize('----')).toMatchSnapshot()
    expect(lexer.tokenize('- ----')).toMatchSnapshot()
    expect(lexer.tokenize('-----a')).toMatchSnapshot()
    expect(lexer.tokenize('_-----')).toMatchSnapshot()
    expect(lexer.tokenize('-----    a')).toMatchSnapshot()
  })

  it('knows comments', () => {
    expect(lexer.tokenize('# a comment')).toMatchSnapshot()
    expect(lexer.tokenize('# ')).toMatchSnapshot()
    expect(lexer.tokenize('# a comment😯')).toMatchSnapshot()
    expect(lexer.tokenize(' # a comment')).toMatchSnapshot()
    expect(lexer.tokenize('  \t  # a comment')).toMatchSnapshot()
    expect(lexer.tokenize('#   a comment')).toMatchSnapshot()
    expect(lexer.tokenize('#    \t a comment')).toMatchSnapshot()
  })

  it('knows these are not comments', () => {
    expect(lexer.tokenize('#not a comment')).toMatchSnapshot()
    expect(lexer.tokenize('  #not a comment')).toMatchSnapshot()
  })

  it('knows list items', () => {
    expect(lexer.tokenize('- buy milk')).toMatchSnapshot()
    expect(lexer.tokenize('+ buy milk')).toMatchSnapshot()
    expect(lexer.tokenize('1. buy milk')).toMatchSnapshot()
    expect(lexer.tokenize('12. buy milk')).toMatchSnapshot()
    expect(lexer.tokenize('123) buy milk')).toMatchSnapshot()
  })

  it('knows these are not list items', () => {
    expect(lexer.tokenize('-not item')).toMatchSnapshot()
    expect(lexer.tokenize('1.not item')).toMatchSnapshot()
    expect(lexer.tokenize('8)not item')).toMatchSnapshot()
    expect(lexer.tokenize('8a) not item')).toMatchSnapshot()
  })

  it('knows footnotes', () => {
    expect(lexer.tokenize('[fn:1]: a footnote')).toMatchSnapshot()
    expect(lexer.tokenize('[fn:word]: a footnote')).toMatchSnapshot()
    expect(lexer.tokenize('[fn:word_]: a footnote')).toMatchSnapshot()
    expect(lexer.tokenize('[fn:wor1d_]: a footnote')).toMatchSnapshot()
  })

  it('knows these are not footnotes', () => {
    expect(lexer.tokenize(' [fn:1]: not a footnote')).toMatchSnapshot()
    expect(lexer.tokenize('[[fn:1]: not a footnote')).toMatchSnapshot()
    expect(lexer.tokenize('\t[fn:1]: not a footnote')).toMatchSnapshot()
  })

  it('knows table separators', () => {
    expect(lexer.tokenize('|----+---+----|')).toMatchSnapshot()
    expect(lexer.tokenize('|--=-+---+----|')).toMatchSnapshot()
    expect(lexer.tokenize('  |----+---+----|')).toMatchSnapshot()
    expect(lexer.tokenize('|----+---+----')).toMatchSnapshot()
    expect(lexer.tokenize('|---')).toMatchSnapshot()
    expect(lexer.tokenize('|-')).toMatchSnapshot()
  })

  it('knows these are not table separators', () => {
    expect(lexer.tokenize('----+---+----|')).toMatchSnapshot()
  })

  it('knows table rows', () => {
    expect(lexer.tokenize('| hello | world | y\'all |')).toMatchSnapshot()
    expect(lexer.tokenize('   | hello | world | y\'all |')).toMatchSnapshot()
    expect(lexer.tokenize('|    hello |  world   |y\'all |')).toMatchSnapshot()
  })

  it('knows these are not table rows', () => {
    expect(lexer.tokenize(' hello | world | y\'all |')).toMatchSnapshot()
    expect(lexer.tokenize('|+')).toMatchSnapshot()
  })

  it('knows drawer begins', () => {
    expect(lexer.tokenize(':PROPERTIES:')).toMatchSnapshot()
    expect(lexer.tokenize('  :properties:')).toMatchSnapshot()
    expect(lexer.tokenize('  :properties:  ')).toMatchSnapshot()
    expect(lexer.tokenize('  :prop_erties:  ')).toMatchSnapshot()
  })

  it('knows these are not drawer begins', () => {
    expect(lexer.tokenize('PROPERTIES:')).toMatchSnapshot()
    expect(lexer.tokenize(':PROPERTIES')).toMatchSnapshot()
    expect(lexer.tokenize(':PR OPERTIES:')).toMatchSnapshot()
  })

  it('knows drawer ends', () => {
    expect(lexer.tokenize(':END:')).toMatchSnapshot()
    expect(lexer.tokenize('  :end:')).toMatchSnapshot()
    expect(lexer.tokenize('  :end:  ')).toMatchSnapshot()
    expect(lexer.tokenize('  :end:  ')).toMatchSnapshot()
  })

  it('knows these are not drawer ends', () => {
    expect(lexer.tokenize('END:')).toMatchSnapshot()
    expect(lexer.tokenize(':END')).toMatchSnapshot()
    expect(lexer.tokenize(':ENDed')).toMatchSnapshot()
  })

  it('POC', () => {
    const pattern = /(.*?)\*(.+?)\*(.*)/
    const str = 'hello *world*, have a nice *day*.'
    // const m = str.match(pattern)
    const m = pattern.exec(str)

    // console.log(m)

    lexer.updateTODOs(['TODO', 'NEXT', 'DONE'])
    // console.log(lexer.syntax)
  })
})
