import { parse } from './utils'

it('can handle table', () => {
  expect(
    parse(
      `
| Name         | Species    | Gender | Role         |
|--------------+------------+--------+--------------|
| Bruce Wayne  | Human      | M      | Batman       |
| Clark Kent   | Kryptonian | M      | Superman     |
| Diana Prince | Amazonian  | F      | Wonder Woman |
`.trim()
    )
  ).toMatchSnapshot()
})

it('can handle table with inline style', () => {
  expect(
    parse(
      `
| Name           | Species      | Gender | Role         |
|----------------+--------------+--------+--------------|
| *Bruce Wayne*  | +Bat+ Human  | M      | [[https://en.wikipedia.org/wiki/Batman][Batman]]       |
| _Clark Kent_   | =Kryptonian= | M      | [[https://en.wikipedia.org/wiki/Superman][Superman]]     |
| /Diana Prince/ | ~Amazonian~  | F      | [[https://en.wikipedia.org/wiki/Wonder_Woman][Wonder Woman]] |
`.trim()
    )
  ).toMatchSnapshot()
})
