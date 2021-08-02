import { parse } from './utils'

it('can handle TODO keywords', () => {
  expect(
    parse(
      `
#+TODO: TODO NEXT | DONE

* NEXT Some Headline
`.trim()
    )
  ).toMatchSnapshot()
})

it('can handle multiple TODO keywords', () => {
  expect(
    parse(
      `
#+TODO: TODO NEXT | DONE
#+TODO: DRAFT PUBLISHED
#+TODO: BUG FEATURE | DONE

* DRAFT Some Headline
`.trim()
    )
  ).toMatchSnapshot()
})
