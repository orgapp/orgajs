import debug from './debug'

describe('Parse Table', () => {
  it('works', () => {
    const content = `
| Name         | Species    | Gender | Role         |
|--------------+------------+--------+--------------|
| Bruce Wayne  | Human      | M      | Batman       |
| Clark Kent   | [[https://en.wikipedia.org/wiki/Kryptonian][Kryptonian]] | M      | *Superman*   |
| Diana Prince | Amazonian  | F      | Wonder Woman |
`
    debug(content)
  })
})
