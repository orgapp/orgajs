import fsExtra from 'fs-extra'
import { GraphQLString } from 'gatsby/graphql'
import { Link } from 'orga'
import { statistics, toHtml } from 'orga-posts'
import { dirname, normalize, posix } from 'path'
import visit from 'unist-util-visit'
import { getAST } from './orga-util'

const DEPLOY_DIR = `public`

const pluginsCacheStr = ``
const pathPrefixCacheStr = ``

const newFileName = (linkNode) =>
  `${linkNode.name}-${linkNode.internal.contentDigest}.${linkNode.extension}`

const htmlCacheKey = (node) =>
  `transformer-orga-org-html-${node.internal.contentDigest}-${pluginsCacheStr}-${pathPrefixCacheStr}`

// ensure only one `/` in new url
const withPathPrefix = (url, pathPrefix) =>
  (pathPrefix + url).replace(/\/\//, `/`)

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
  ].filter(function (lpath) {
    if (lpath) return true
    return false
  })

  return posix.join(...linkPaths)
}

module.exports = async (
  { type, store, pathPrefix, getNode, getNodesByType, cache, reporter },
  pluginOptions
) => {
  if (type.name !== `OrgContent`) {
    return {}
  }

  const files = getNodesByType(`File`)

  const orgContent = getNodesByType(`OrgContent`)

  const t: any = {
    html: {
      type: GraphQLString,
      resolve: async (node) => {
        return await getHTML(node)
      },
    },
    excerpt: {
      type: 'String',
      resolve: getExcerpt,
    },
    timeToRead: {
      type: 'Int',
      resolve: async (node) => {
        const ast = await getAST({ node, cache })
        const { timeToRead } = await statistics(ast)
        return timeToRead
      },
    },
    wordCount: {
      type: 'Int',
      resolve: async (node) => {
        const ast = await getAST({ node, cache })
        const { wordCount } = await statistics(ast)
        return wordCount
      },
    },
  }

  return t

  async function getExcerpt(node) {
    return (
      node.metadata.excerpt ||
      node.metadata.summary ||
      node.metadata.description ||
      ''
    )
  }

  function getSlug(node) {
    return node && node.slug && withPathPrefix(node.slug, pathPrefix)
  }

  async function getHTML(orgContentNode) {
    const cachedHTML = await cache.get(htmlCacheKey(orgContentNode))
    if (cachedHTML) {
      return cachedHTML
    }

    const ast = await getAST({ node: orgContentNode, cache })

    const filesToCopy = new Map()
    const html = await toHtml(ast, {
      transform: (tree) => {
        const visitor = (node: Link) => {
          if (node.protocol === 'file') {
            let linkPath = posix.join(
              getNode(getNode(orgContentNode.parent).parent).dir,
              normalize(node.value)
            )

            if (
              typeof node.search === 'string' &&
              node.search.startsWith('*')
            ) {
              const headline = node.search.replace(/^\*+/, '')
              linkPath = `${linkPath}::*${decodeURIComponent(headline)}`
            }

            const linkToOrg = orgContent.find(
              (f) => f.absolutePath === linkPath
            )
            if (linkToOrg) {
              node.value = getSlug(linkToOrg) || node.value
            } else {
              const linkNode = files.find((f) => f.absolutePath === linkPath)
              if (linkNode && linkNode.absolutePath) {
                const newFilePath = newPath(linkNode)
                if (linkPath !== newFilePath) {
                  node.value = newLinkURL({ linkNode, pathPrefix })
                  filesToCopy.set(linkPath, newFilePath)
                }
              }
            }
          }

          if (node.protocol === 'id') {
            const linkToOrg = orgContent.find(
              (f) => f.metadata.id === node.value
            )
            node.value = getSlug(linkToOrg) || node.value
          }

          // TODO: transform internal link of file based content to anchor? i.e. can't find the linkToOrg
          if (node.protocol === `internal`) {
            if (node.value.startsWith('#')) {
              // internal link by CUSTOM_ID
              const linkToOrg = orgContent.find(
                (f) => f.metadata.custom_id === node.value.substring(1)
              )
              node.value = getSlug(linkToOrg) || node.value
            } else {
              const linkPath = `${
                getNode(orgContentNode.parent).fileAbsolutePath
              }::*${node.value}`
              const linkToOrg = orgContent.find(
                (f) => f.absolutePath === linkPath
              )
              node.value = getSlug(linkToOrg) || node.value
            }
          }
        }

        // @ts-ignore
        visit(tree, 'link', visitor)
      },
    })

    await Promise.all(
      Array.from(filesToCopy, async ([linkPath, newFilePath]) => {
        // Don't copy anything is the file already exists at the location.
        if (!fsExtra.existsSync(newFilePath)) {
          try {
            await fsExtra.ensureDir(dirname(newFilePath))
            await fsExtra.copy(linkPath, newFilePath)
          } catch (err) {
            console.error(`error copying file`, err)
          }
        }
      })
    )

    // Save new HTML to cache
    await cache.set(htmlCacheKey(orgContentNode), html)

    return html
  }
}
