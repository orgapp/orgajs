import fsExtra from 'fs-extra'
import { GraphQLString } from 'gatsby/graphql'
import { Link } from 'orga'
import { toHtml } from 'orga-posts'
import { dirname, normalize, posix } from 'path'
import visit from 'unist-util-visit'
import { getAST } from './orga-util'

const DEPLOY_DIR = `public`

const newFileName = linkNode =>
  `${linkNode.name}-${linkNode.internal.contentDigest}.${linkNode.extension}`

const newPath = (linkNode, destinationDir = `static`) => {
  return posix.join(
    process.cwd(),
    DEPLOY_DIR,
    destinationDir,
    newFileName(linkNode)
  )
}

const newLinkURL = ({ linkNode, destinationDir = `static`, pathPrefix }) => {
  const linkPaths = [
    `/`,
    pathPrefix,
    destinationDir,
    newFileName(linkNode),
  ].filter(function(lpath) {
    if (lpath) return true
    return false
  })

  return posix.join(...linkPaths)
}

module.exports = async (
  { type, store, pathPrefix, getNode, getNodesByType, cache },
  pluginOptions
) => {
  if (type.name !== `OrgContent`) {
    return {}
  }

  const { strongTypedMetadata = true } = pluginOptions

  const files = getNodesByType(`File`)

  const orgContent = getNodesByType(`OrgContent`)

  const t: any = {
    html: {
      type: GraphQLString,
      resolve: async (node) => { return await _getHTML(node) },
    },
    excerpt: {
      type: 'String',
      resolve: getExcerpt,
    },
  }

  return t

  async function getExcerpt(node) {
    return node.excerpt || node.summary || node.description || ''
  }

  async function _getHTML(orgContentNode) {
    const ast = await getAST({ node: orgContentNode, cache })

    const filesToCopy = new Map()
    const html = await toHtml(ast, { transform: tree => {
      const visitor = (node: Link) => {
        if (node.protocol === 'file') {
          let linkPath = posix.join(
            getNode(getNode(orgContentNode.parent).parent).dir,
            normalize(node.value)
          )

          if (typeof node.search === 'string' && node.search.startsWith('*')) {
            const headline = node.search.replace(/^\*+/, '')
            linkPath = `${linkPath}::*${decodeURIComponent(headline)}`
          }

          const linkToOrg = orgContent.find(f => f.absolutePath === linkPath)
          if (linkToOrg) {
            node.value = linkToOrg.fields.slug
          } else {
            const linkNode = files.find(f => f.absolutePath === linkPath)
            if (linkNode && linkNode.absolutePath) {
              const newFilePath = newPath(linkNode)
              if (linkPath !== newFilePath) {
                node.value = newLinkURL({ linkNode, pathPrefix })
                filesToCopy.set(linkPath, newFilePath)
              }
            }
          }
        }

        // TODO: transform internal link of file based content to anchor? i.e. can't find the linkToOrg
        if (node.protocol === `internal`) {
          const linkPath = `${getNode(orgContentNode.parent).fileAbsolutePath}::*${node.value}`
          const linkToOrg = orgContent.find(f => f.absolutePath === linkPath)
          if (linkToOrg) node.value = linkToOrg.fields.slug
        }
      }

      visit(tree, 'link', visitor)
     
    } })

    await Promise.all(Array.from(filesToCopy, async ([linkPath, newFilePath]) => {
      // Don't copy anything is the file already exists at the location.
      if (!fsExtra.existsSync(newFilePath)) {
        try {
          await fsExtra.ensureDir(dirname(newFilePath))
          await fsExtra.copy(linkPath, newFilePath)
        } catch (err) {
          console.error(`error copying file`, err)
        }
      }
    }))
    return html
  }
}
