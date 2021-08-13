import fs from 'fs'
import { tokenize } from '../../tokenize'
import { parse } from './utils'
import path from 'path'

it.skip('works', () => {
  expect(
    parse(
      `
#+TITLE: hello world
#+TODO: TODO NEXT | DONE
#+DATE: 2018-01-01

* NEXT headline one
DEADLINE: <2018-01-01 Mon>
:PROPERTIES:
key: value
key: value
:END:

[[https://github.com/xiaoxinghu/orgajs][Here's]] to the *crazy* ones, the /misfits/, the _rebels_, the ~troublemakers~,
the round pegs in the +round+ square holes...
`.trim()
    )
  ).toMatchSnapshot()
})

// describe.skip('parse', () => {
//   const inputs = fs.readdirSync(__dirname)
//     .filter(f => f.endsWith('.org'))

//   test.each(inputs)('could handle %s', async (input) => {

//     const text = await fs.promises.readFile(path.resolve(__dirname, input), 'utf8')

//     const tree = parse(text)
//     // const serilizedTree = JSON.stringify(tree)
//     console.log(`testing ${input}`)
//     console.log({ tree, text })

//   })

// })
