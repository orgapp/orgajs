import todoKeywordSet from '../todo-keyword-set'

const debug = (text: string) => {
  const tks = todoKeywordSet(text)
  console.log(`${text}:`, tks)
}

describe('TodoKeywordSet', () => {
  it('works', () => {
    expect(todoKeywordSet('TODO | DONE')).toMatchSnapshot()
    expect(todoKeywordSet('TODO DONE')).toMatchSnapshot()
    expect(todoKeywordSet(' TODO NEXT  |  DONE ')).toMatchSnapshot()
    expect(todoKeywordSet('TODO NEXT DONE')).toMatchSnapshot()
    expect(todoKeywordSet('TODO | DONE CANCELLED')).toMatchSnapshot()
  })
})
