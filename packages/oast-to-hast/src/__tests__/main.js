import u from 'unist-builder'
import toHAST from '..'

describe('Main', () => {
  it('POC', () => {
    const org = u('root', [
      u('section', { level: 1}, [
        u('heading', { level: 1, keyword: 'TODO', tags: ['shopping'] }, [
          u('text', 'remember the '),
          u('bold', [ u('text', 'milk') ])
        ]),
      ]),
      u('block', { name: 'SRC', params: ['javascript'] }, 'console.log("hello world")')
    ])
    expect(toHAST(org)).toMatchSnapshot()
  })

})
