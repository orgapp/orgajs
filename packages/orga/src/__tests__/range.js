const Range = require('../range')

describe('Range', () => {
  it('works', () => {

    let range = new Range(0, 1)
    expect(range.start).toBe(0)
    expect(range.end).toBe(1)
  })
})
