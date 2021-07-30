import todoKeywordSet from './todo-keyword-set'

const debug = (text: string) => {
  const tks = todoKeywordSet(text)
  console.log(`${text}:`, tks)
}

describe('TodoKeywordSet', () => {
  it('works', () => {
    expect(todoKeywordSet('TODO | DONE')).toMatchInlineSnapshot(`
Object {
  "actionables": Array [
    "TODO",
  ],
  "done": Array [
    "DONE",
  ],
  "keywords": Array [
    "TODO",
    "DONE",
  ],
}
`)
    expect(todoKeywordSet('TODO DONE')).toMatchInlineSnapshot(`
Object {
  "actionables": Array [
    "TODO",
  ],
  "done": Array [
    "DONE",
  ],
  "keywords": Array [
    "TODO",
    "DONE",
  ],
}
`)
    expect(todoKeywordSet(' TODO NEXT  |  DONE ')).toMatchInlineSnapshot(`
Object {
  "actionables": Array [
    "TODO",
    "NEXT",
  ],
  "done": Array [
    "DONE",
  ],
  "keywords": Array [
    "TODO",
    "NEXT",
    "DONE",
  ],
}
`)
    expect(todoKeywordSet('TODO NEXT DONE')).toMatchInlineSnapshot(`
Object {
  "actionables": Array [
    "TODO",
    "NEXT",
  ],
  "done": Array [
    "DONE",
  ],
  "keywords": Array [
    "TODO",
    "NEXT",
    "DONE",
  ],
}
`)
    expect(todoKeywordSet('TODO | DONE CANCELLED')).toMatchInlineSnapshot(`
Object {
  "actionables": Array [
    "TODO",
  ],
  "done": Array [
    "DONE",
    "CANCELLED",
  ],
  "keywords": Array [
    "TODO",
    "DONE",
    "CANCELLED",
  ],
}
`)
  })
})
