/* @jsx React.createElement */
/* @jsxFrag React.Fragment */
import { transformAsync as babelTransform } from '@babel/core'
import reorg from '@orgajs/reorg'
import removeExport from 'babel-plugin-remove-export-keywords'
import React from 'react'
import toJsx from '@orgajs/estree-jsx'
import toEstree from '@orgajs/rehype-estree'
import toRehype from '@orgajs/reorg-rehype'
import { renderToString } from 'react-dom/server'
import { orga } from '../src'
// import {MDXProvider, withMDXComponents, mdx} from '../src'

/* const removeExport = () => {
 *   return {
 *     visitor: {
 *       ExportDeclaration(path) {
 *         const declaration = path.node.declaration
 *
 *         // Ignore "export { Foo as default }" syntax
 *         if (declaration) {
 *           path.replaceWith(declaration)
 *         }
 *       }
 *     }
 *   }
 * } */

const run = async value => {
  // Turn the serialized MDX code into serialized JSX…

  const processor = reorg()
    .use(toHast)
    .use(toEstree)
    .use(toJsx)

  const doc = await processor.process(value)

  console.log({ doc })

  // …and that into serialized JS.
  const {code} = await babelTransform(doc.toString('utf-8'), {
    configFile: false,
    plugins: [
      '@babel/plugin-transform-react-jsx',
      removeExport,
    ]
  })

  console.dir(code)

  // …and finally run it, returning the component.
  // eslint-disable-next-line no-new-func
  return new Function('orga', `${code}; return MDXContent`)(orga)
}


describe.skip('@orgajs/react', () => {
  test('should work', async () => {
    const Content = await run('* hi')
    const string = renderToString(<Content />)
    console.dir(string)
  })
})
