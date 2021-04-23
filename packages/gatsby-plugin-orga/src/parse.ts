import toJsx from '@orgajs/estree-jsx'
import toEstree from '@orgajs/rehype-estree'
import reorg from '@orgajs/reorg'
import toRehype from '@orgajs/reorg-rehype'

const renderer = `import React from 'react'
import {orga} from '@orgajs/react'
import { graphql } from 'gatsby'
`

async function parse (text) {
  const processor = reorg()
        .use(toRehype)
        .use(toEstree)
        .use(toJsx, { renderer })

  const code = await processor.process(text)
  return `${code}`
}

export default parse
