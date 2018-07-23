describe('bug fixes', () => {
  it('fixes issue #5', () => {
    const { parse } = require('../')
    const content = `
#+TODO: (whatever keyword)
* something
* (whatever something with keyword
`
    expect(parse(content)).toMatchSnapshot()
  })
})
