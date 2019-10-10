import u from 'unist-builder'
import isRelativeUrl from 'is-relative-url'
import { posix, dirname, normalize } from 'path'
import toHAST from 'oast-to-hast'
import hastToHTML from 'hast-util-to-html'
import mime from 'mime'
import fsExtra from 'fs-extra'
import util from 'util'
import map from 'unist-util-map'
import { select } from 'unist-util-select'

const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLEnumType,
} = require('gatsby/graphql')
const GraphQLJSON = require('graphql-type-json')

const {
  getAST,
} = require('./orga-util')

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

module.exports = (
  { type, store, pathPrefix, getNode, getNodesByType, cache },
  pluginOptions
) => {
  if (type.name !== `OrgContent`) {
    return {}
  }

  const files = getNodesByType(`File`)

  const orgContent = getNodesByType(`OrgContent`)

  return new Promise((resolve, reject) => {

    return resolve({
      html: {
        type: GraphQLString,
        async resolve(node) { return await getHTML(node) },
      },
    })
  })

  async function getHTML(orgContentNode) {
    let body = await getAST({ node: orgContentNode, cache })
    if (body.type === `section`) {
      body = { ...body, children: body.children.slice(1) }
    }
    const filesToCopy = new Map()
    const highlight = pluginOptions.noHighlight !== true
    const handlers = { link: handleLink }

    // offset the levels
    const firstHeadline = select('headline', body)
    const offset = firstHeadline ? firstHeadline.level - 1 : 0
    if (offset > 0) {
      body = map(body, node => {
        if (node.type !== `headline`) return node
        return { ...node, level: node.level - offset }
      })
    }

    const hast = toHAST(body, { highlight, handlers })
    const html = hastToHTML(hast, { allowDangerousHTML: true })
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

    function handleLink(h, node) {
      const { uri, desc } = node

      var src = uri.raw
      // console.log(`URI: ${util.inspect(uri, false, null, true)}`)
      if (uri.protocol === `file`) {
        let linkPath = posix.join(
          getNode(getNode(orgContentNode.parent).parent).dir,
          normalize(uri.location)
        )
        const { headline } = uri.query || {}
        if (headline) linkPath = `${linkPath}::*${decodeURIComponent(headline)}`
        const linkToOrg = orgContent.find(f => f.absolutePath === linkPath)
        if (linkToOrg) {
          src = linkToOrg.fields.slug
        } else {
          const linkNode = files.find(f => f.absolutePath === linkPath)
          if (linkNode && linkNode.absolutePath) {
            const newFilePath = newPath(linkNode)
            if (linkPath !== newFilePath) {
              src = newLinkURL({ linkNode, pathPrefix })
              filesToCopy.set(linkPath, newFilePath)
            }
          }
        }
      }

      // TODO: transform internal link of file based content to anchor? i.e. can't find the linkToOrg
      if (uri.protocol === `internal`) {
        let linkPath = `${getNode(orgContentNode.parent).fileAbsolutePath}::*${uri.location}`
        const linkToOrg = orgContent.find(f => f.absolutePath === linkPath)
        if (linkToOrg) src = linkToOrg.fields.slug
      }

      const type = mime.getType(src)
      if (type && type.startsWith(`image`)) {
        var elements = [
          h(node, `img`, { src, alt: desc })
        ]
        if (desc) {
          elements.push(h(node, `figcaption`, [u(`text`, desc)]))
        }
        return h(node, `figure`, elements)
      } else {
        return h(node, `a`, { href: src }, [
          u(`text`, desc)
        ])
      }
    }
  }
}
