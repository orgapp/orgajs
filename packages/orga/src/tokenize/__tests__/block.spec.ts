import { tokenize } from '../index'

describe('tokenize block', () => {

  it('knows block begins', () => {
    expect(tokenize('#+BEGIN_SRC swift').all()).toMatchSnapshot()
    expect(tokenize('#+begin_src swift').all()).toMatchSnapshot()
    expect(tokenize('#+begin_example').all()).toMatchSnapshot()
    expect(tokenize('#+begin_ex😀mple').all()).toMatchSnapshot()
    expect(tokenize('#+begin_src swift :tangle code.swift').all()).toMatchSnapshot()
  })

  it('knows these are not block begins', () => {
    expect(tokenize('#+begi😀n_src swift').all()).toMatchSnapshot()
  })

  it('knows block ends', () => {
    expect(tokenize('#+END_SRC').all()).toMatchSnapshot()
    expect(tokenize('  #+END_SRC').all()).toMatchSnapshot()
    expect(tokenize('#+end_src').all()).toMatchSnapshot()
    expect(tokenize('#+end_SRC').all()).toMatchSnapshot()
    expect(tokenize('#+end_S😀RC').all()).toMatchSnapshot()
  })

  it('knows these are not block ends', () => {
    expect(tokenize('#+end_SRC ').all()).toMatchSnapshot()
    expect(tokenize('#+end_src param').all()).toMatchSnapshot()
  })

})
