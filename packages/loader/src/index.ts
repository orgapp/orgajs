import reorg from '@orgajs/reorg'
import { getOptions } from 'loader-utils'
import { inspect } from 'util'
import Report from "vfile-reporter"

const renderer = `import React from 'react'
import {orga} from '@orgajs/react'
`

const pragma = `/* @jsxRuntime classic */
/* @jsx orga */
/* @jsxFrag orga.Fragment */
`

export default function (source) {

  const {
    plugins = [],
  } = getOptions(this)

  console.log(`>>> plugins: ${plugins.length}`)

  const processor = reorg()
  for (const item of plugins) {
      console.log(inspect(item, false, null, true))
    if (Array.isArray(item)) {
      const [plugin, pluginOptions] = item
      processor.use(plugin, pluginOptions)
    } else {
      processor.use(item)
    }
  }

  const callback = this.async()

  try {
    processor.process({
      contents: source ,
      path: this.resourcePath,
    }, (error, file) => {
      if (error) {
        callback(Report(error))
        return
      }

      const code = `${renderer}${file}`
      const _file = `
      import { Button } from 'theme-ui'

      const MDXLayout = 'wrapper'

      function MDXContent({
        components,
        ...props
      }) {
        return <MDXLayout {...props} components={components}>
        <h1>Hello</h1>
        </MDXLayout>
      }

      MDXContent.isMDXComponent = true

      export default MDXContent
      `
      const _code = `${renderer}${pragma}${_file}`
      console.log(`>>>>>>>>>>>>>`)
      console.dir(code)
      callback(null, code)
    })

  } catch (error) {
    return callback(error)
  }
}
