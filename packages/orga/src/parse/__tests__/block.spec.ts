import debug from './debug'

describe('Parse Block', () => {
  it('works', () => {
    const content = `
* headline one
#+BEGIN_SRC javascript
const string = 'hello world'
console.log(string)
#+END_SRC
`
    // debug(content)
  })
})
