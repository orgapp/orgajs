import onCreateNode from './on-create-node'
import onCreateWebpackConfig from './on-create-webpack-config'
import preprocessSource from './preprocess-source'
import onCreatePage from './on-create-page'
import { GatsbyNode } from 'gatsby'

const extensions = ['.org']
export const resolvableExtensions = (): string[] => extensions
export const unstable_shouldOnCreateNode: GatsbyNode['unstable_shouldOnCreateNode'] =
  ({ node }): boolean => {
    return node.extension === 'org'
  }

export { preprocessSource, onCreateNode, onCreatePage, onCreateWebpackConfig }
