import onCreateNode from './on-create-node'
import onCreateWebpackConfig from './on-create-webpack-config'
import sourceNodes from './source-nodes'
import onCreatePage from './on-create-page'

const extensions = ['.org']

export const resolvableExtensions = () => extensions

export function unstable_shouldOnCreateNode({ node }) {
  return node.extension === 'org'
}

export {
  sourceNodes,
  onCreateNode,
  onCreatePage,
  onCreateWebpackConfig,
}

// export const preprocessSource: GatsbyNode['preprocessSource'] = async ({
//   filename, contents
// }) => {
//   const ext = path.extname(filename)
//   if (extensions.includes(ext)) {
//     const tree = await parse(contents)
//     // console.log(inspect(tree, false, null, true))
//     return tree
//   }
// }
