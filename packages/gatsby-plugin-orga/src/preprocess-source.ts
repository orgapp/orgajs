import { compile } from '@orgajs/orgx'
import { GatsbyNode } from 'gatsby'
import path from 'path'

// @ts-ignore
const preprocessSource: GatsbyNode['preprocessSource'] = async ({
  filename,
  contents,
}) => {
  // TODO: put in cache?
  const ext = path.extname(filename)

  if (ext === '.org') {
    const code = await compile(contents)
    return `
import {graphql} from 'gatsby'
${code}`.trim()
  }
}

export default preprocessSource
