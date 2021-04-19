// import toHast, { Options as ToHastOptions } from 'oast-to-hast'
import toHAST from 'oast-to-hast'
import { Plugin } from 'unified'
import { inspect } from 'util'
import toJs from './estree-to-js'
// import toEstree from 'hast-util-to-estree'
import toEstree from './hast-to-estree'
// import serialize from './serialize-estree'
import processEstree from './process-estree'

interface Options {

}

const renderer = `import React from 'react'
import {orga} from '@orgajs/react'
`

const pragma = `/* @jsxRuntime classic */
/* @jsx orga */
/* @jsxFrag orga.Fragment */
`

const plugin: Plugin = function(options: Options = {}) {
  const compiler = (node, file) => {

    const hast = toHAST(node, options)
    // console.log('----- hast -----')
    // console.log(inspect(hast, false, null, true))

    // const rawProcessed = raw(hast, file)
    // console.log('----- rawProcessed -----')
    // console.log(inspect(rawProcessed, false, null, true))

    const estree = toEstree(hast, {})
    console.log('----- estree -----')
    console.log(inspect(estree, false, null, true))

    const processed = processEstree(estree, options)
    // console.log('----- processed -----')
    // console.log(inspect(processed, false, null, true))

    const js = toJs(processed)
    // console.log('----- js -----')
    // console.log(inspect(js, false, null, true))

    return `${pragma}${js}`
  }

  this.Compiler = compiler
}

export default plugin
