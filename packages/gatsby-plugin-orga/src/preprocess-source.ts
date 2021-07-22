import path from 'path'
import { GatsbyNode } from 'gatsby'
import { compile } from './orga'

const preprocessSource: GatsbyNode['preprocessSource'] = async (
  { filename, contents, cache },
  pluginOptions
) => {
  const ext = path.extname(filename)

  if (ext === '.org') {
    const { code, imports, properties } = await compile({
      content: contents,
      cache,
    })
    return code
  }

  return null
}

export default preprocessSource
