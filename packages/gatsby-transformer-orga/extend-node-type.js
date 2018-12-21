const u = require('unist-builder')
const isRelativeUrl = require(`is-relative-url`)
const path = require('path')
const Promise = require('bluebird')
const toHAST = require('oast-to-hast')
const hastToHTML = require('hast-util-to-html')
const mime = require('mime')
const fsExtra = require('fs-extra')
const util = require('util')

const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLEnumType,
} = require('gatsby/graphql')
const GraphQLJSON = require('graphql-type-json')

const DEPLOY_DIR = `public`

const newFileName = linkNode =>
      `${linkNode.name}-${linkNode.internal.contentDigest}.${linkNode.extension}`

const newPath = (linkNode, destinationDir) => {
  return path.posix.join(
    process.cwd(),
    DEPLOY_DIR,
    destinationDir || `static`,
    newFileName(linkNode)
  )
}

const newLinkURL = ({ linkNode, destinationDir, pathPrefix }) => {
  const linkPaths = [
    `/`,
    pathPrefix,
    destinationDir || `static`,
    newFileName(linkNode),
  ].filter(function(lpath) {
    if (lpath) return true
    return false
  })

  return path.posix.join(...linkPaths)
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
    let body = orgContentNode.ast
    if (body.type === `section`) {
      body = { ...body, children: body.children.slice(1) }
    }
    const filesToCopy = new Map()
    const highlight = pluginOptions.noHighlight !== true
    const handlers = { link: handleLink }
    const html = hastToHTML(toHAST(body, { highlight, handlers }), { allowDangerousHTML: true })
    await Promise.all(Array.from(filesToCopy, async ([linkPath, newFilePath]) => {
      // Don't copy anything is the file already exists at the location.
      if (!fsExtra.existsSync(newFilePath)) {
        try {
          await fsExtra.ensureDir(path.dirname(newFilePath))
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
        let linkPath = path.posix.join(
          getNode(getNode(orgContentNode.parent).parent).dir,
          path.normalize(uri.location)
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
