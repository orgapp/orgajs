import toJsx from '@orgajs/estree-jsx'
import toEstree from '@orgajs/rehype-estree'
import reorg from '@orgajs/reorg'
import toRehype from '@orgajs/reorg-rehype'
import { walk } from 'estree-walker'

const renderer = `import React from 'react'
import {orga} from '@orgajs/react'
import { graphql } from 'gatsby'
`

function processImportsExports() {
  function compiler(tree, file) {

    walk(tree, {
      enter: function (node) {
        if (node.type === 'ImportDeclaration') {
          console.log(`-- found import:`)
          // console.log({ node })
        }
        console.log({ node })
      }
    })

    return tree

  }

  this.Compiler = compiler
}

async function parse (text) {
  const processor = reorg()
    .use(toRehype)
    .use(toEstree)
    .use(processImportsExports)
    .use(toJsx, { renderer })

  const code = await processor.process(text)
  return `${code}`
}

export default parse
