import Lexer, { tokenize } from '../lexer'
import { map } from '../position'
import { inspect } from 'util'

const debug = (text: string) => {
  const { substring } = map(text)
  const { all } = tokenize(text)
  const data = all().map(token => ({
    ...token,
    content: substring(token.position)
  }))

  console.log(inspect(data, false, null, true))
}

describe('Lexer', () => {
  const lexer = new Lexer({ timezone: `Pacific/Auckland` })

  it('works', () => {
    const text = `
* TODO [#A] headline *one* :tag1:tag2:
* DONE headline two
a paragrph.
another line
** level 2 headline

`
    debug(text)

  })

  it('knows table row', () => {
    expect(lexer.tokenize('| batman | superman | wonder woman |')).toMatchSnapshot()
  })

  it.only('knows blank', () => {
    expect(tokenize('').all()).toMatchSnapshot()
    expect(tokenize(' ').all()).toMatchSnapshot()
    expect(tokenize('    ').all()).toMatchSnapshot()
    expect(tokenize('\t').all()).toMatchSnapshot()
    expect(tokenize(' \t').all()).toMatchSnapshot()
    expect(tokenize('\t ').all()).toMatchSnapshot()
    expect(tokenize(' \t  ').all()).toMatchSnapshot()
  })

  it('knows these are not blanks', () => {
    expect(tokenize(' a ').all()).toMatchSnapshot()
  })

  it('knows headlines', () => {
    expect(tokenize('** a headline').all()).toMatchSnapshot()
    expect(tokenize('** _headline_').all()).toMatchSnapshot()
    expect(tokenize('**   a headline').all()).toMatchSnapshot()
    expect(tokenize('***** a headline').all()).toMatchSnapshot()
    expect(tokenize('* a 😀line').all()).toMatchSnapshot()
    expect(tokenize('* TODO [#A] a headline     :tag1:tag2:').all()).toMatchSnapshot()
  })

  it.only('knows these are not headlines', () => {
    expect(tokenize('*not a headline').all()).toMatchSnapshot()
    expect(tokenize(' * not a headline').all()).toMatchSnapshot()
    expect(tokenize('*_* not a headline').all()).toMatchSnapshot()
    expect(tokenize('not a headline').all()).toMatchSnapshot()
  })

  it.only('knows keywords', () => {
    expect(tokenize('#+KEY: Value').all()).toMatchSnapshot()
    expect(tokenize('#+KEY: Another Value').all()).toMatchSnapshot()
    expect(tokenize('#+KEY: value : Value').all()).toMatchSnapshot()
  })

  it.only('knows these are not keywords', () => {
    expect(tokenize('#+KEY : Value').all()).toMatchSnapshot()
    expect(tokenize('#+KE Y: Value').all()).toMatchSnapshot()
  })

  it.only('knows plannings', () => {
    expect(tokenize('DEADLINE: <2018-01-01 Mon>').all()).toMatchSnapshot()
    expect(tokenize('  DEADLINE: <2018-01-01 Mon>').all()).toMatchSnapshot()
    expect(tokenize(' \tDEADLINE: <2018-01-01 Mon>').all()).toMatchSnapshot()
    expect(tokenize(' \t DEADLINE: <2018-01-01 Mon>').all()).toMatchSnapshot()
  })

  it.only('knows these are not plannings', () => {
    expect(tokenize('dEADLINE: <2018-01-01 Mon>').all()).toMatchSnapshot()
  })

  it.only('knows block begins', () => {
    expect(tokenize('#+BEGIN_SRC swift').all()).toMatchSnapshot()
    expect(tokenize('#+begin_src swift').all()).toMatchSnapshot()
    expect(tokenize('#+begin_example').all()).toMatchSnapshot()
    expect(tokenize('#+begin_ex😀mple').all()).toMatchSnapshot()
    expect(tokenize('#+begin_src swift :tangle code.swift').all()).toMatchSnapshot()
  })

  it('knows these are not block begins', () => {
    expect(tokenize('#+begi😀n_src swift').all()).toMatchSnapshot()
  })

  it.only('knows block ends', () => {
    expect(tokenize('#+END_SRC').all()).toMatchSnapshot()
    expect(tokenize('  #+END_SRC').all()).toMatchSnapshot()
    expect(tokenize('#+end_src').all()).toMatchSnapshot()
    expect(tokenize('#+end_SRC').all()).toMatchSnapshot()
    expect(tokenize('#+end_S😀RC').all()).toMatchSnapshot()
  })

  it.only('knows these are not block ends', () => {
    expect(tokenize('#+end_SRC ').all()).toMatchSnapshot()
    expect(tokenize('#+end_src param').all()).toMatchSnapshot()
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
    // unordered
    expect(lexer.tokenize('- buy milk')).toMatchSnapshot()
    expect(lexer.tokenize('+ buy milk')).toMatchSnapshot()
    // ordered
    expect(lexer.tokenize('1. buy milk')).toMatchSnapshot()
    expect(lexer.tokenize('12. buy milk')).toMatchSnapshot()
    expect(lexer.tokenize('123) buy milk')).toMatchSnapshot()
    // checkbox
    expect(lexer.tokenize('- [x] buy milk checked')).toMatchSnapshot()
    expect(lexer.tokenize('- [X] buy milk checked')).toMatchSnapshot()
    expect(lexer.tokenize('- [-] buy milk checked')).toMatchSnapshot()
    expect(lexer.tokenize('- [ ] buy milk unchecked')).toMatchSnapshot()
    // indent
    expect(lexer.tokenize('  - buy milk')).toMatchSnapshot()
    // tag
    expect(lexer.tokenize('- item1 :: description here')).toMatchSnapshot()
    expect(lexer.tokenize('- item2\n :: description here')).toMatchSnapshot()
    expect(lexer.tokenize('- [x] item3 :: description here')).toMatchSnapshot()
  })

  it('knows these are not list items', () => {
    expect(lexer.tokenize('-not item')).toMatchSnapshot()
    expect(lexer.tokenize('1.not item')).toMatchSnapshot()
    expect(lexer.tokenize('8)not item')).toMatchSnapshot()
    expect(lexer.tokenize('8a) not item')).toMatchSnapshot()
  })

  it('knows footnotes', () => {
    expect(lexer.tokenize('[fn:1] a footnote')).toMatchSnapshot()
    expect(lexer.tokenize('[fn:word] a footnote')).toMatchSnapshot()
    expect(lexer.tokenize('[fn:word_] a footnote')).toMatchSnapshot()
    expect(lexer.tokenize('[fn:wor1d_] a footnote')).toMatchSnapshot()
  })

  it('knows these are not footnotes', () => {
    expect(lexer.tokenize('[fn:1]: not a footnote')).toMatchSnapshot()
    expect(lexer.tokenize(' [fn:1] not a footnote')).toMatchSnapshot()
    expect(lexer.tokenize('[[fn:1] not a footnote')).toMatchSnapshot()
    expect(lexer.tokenize('\t[fn:1] not a footnote')).toMatchSnapshot()
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
    // with empty cell
    expect(lexer.tokenize('||  world   | |')).toMatchSnapshot()
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

  it('knows these are timestamps', () => {
    expect(lexer.tokenize('<2019-08-19 Mon>')).toMatchSnapshot()
    expect(lexer.tokenize('<2019-08-19 Mon 13:20>')).toMatchSnapshot()
    expect(lexer.tokenize('<2019-08-19 Mon 13:20-14:00>')).toMatchSnapshot()
    expect(lexer.tokenize('<2019-08-19 Mon>--<2019-08-20 Tue>')).toMatchSnapshot()
  })

})
