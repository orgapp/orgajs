import { GatsbyNode } from 'gatsby'
import path from 'path'
import { inspect } from 'util'
import createWebpackConfig from './create-webpack-config'
import parse from './parse'

const extensions = ['.org']

export const onCreateWebpackConfig = createWebpackConfig
export const resolvableExtensions = () => extensions

export function unstable_shouldOnCreateNode({ node }) {
  return node.extension === 'org'
}

export const onCreateNode: GatsbyNode['onCreateNode'] = ({
  node, actions, store
}) => {

  if (!unstable_shouldOnCreateNode({ node })) {
    return {}
  }
  console.log(`-- node --`)
  console.log(inspect(node, false, null, true))
}

export const preprocessSource: GatsbyNode['preprocessSource'] = async ({
  filename, contents
}) => {
  const ext = path.extname(filename)
  if (extensions.includes(ext)) {
    const tree = await parse(contents)
    // console.log(inspect(tree, false, null, true))
    return tree
  }
}
