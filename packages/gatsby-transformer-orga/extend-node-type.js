const u = require('unist-builder')
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

function isRelative(path) {
  return !path.startsWith(`/`)
}

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

module.exports = (
  { type, store, pathPrefix, getNode, getNodesByType, cache },
  pluginOptions
) => {
  if (type.name !== `OrgContent`) {
    return {}
  }


  return new Promise((resolve, reject) => {

    return resolve({
      html: {
        type: GraphQLString,
        resolve(node) { return getHTML(node.ast) },
      },
    })
  })

  const newLinkURL = (linkNode, destinationDir) => {
    return path.posix.join(
      `/`,
      pathPrefix,
      destinationDir || `static`,
      newFileName(linkNode))
  }

  const files = getNodesByType(`File`)

  const orgFiles = getNodesByType(`Orga`)

  function getHTML(ast) {
    let body = ast
    if (ast.type === `section`) {
      body = { ...ast, children: ast.children.slice(1) }
    }
    const highlight = pluginOptions.noHighlight !== true
    // const handlers = { link: handleLink }
    const handlers = {}
    const html = hastToHTML(toHAST(body, { highlight, handlers }), { allowDangerousHTML: true })
    return html

    function copyOnDemand(file) {
      const publicPath = newPath(file)
      if (!fsExtra.existsSync(publicPath)) {
        fsExtra.copy(file.absolutePath, publicPath, err => {
          if (err) {
            console.error(
              `error copying file from ${
                  file.absolutePath
                } to ${publicPath}`,
              err
            )
          }
        })
      }

      return newLinkURL(file)
    }

    function handleLink(h, node) {
      const { uri, desc } = node

      var src = uri.raw
      if (isRelative(uri.location)) {
        const linkPath = path.posix.join(
          getNode(node.parent).dir,
          path.normalize(uri.location)
        )

        const linkToOrg = orgFiles.find(f => f.fileAbsolutePath === linkPath)
        if (linkToOrg) {
          src = linkToOrg.fields.slug
        } else {
          const linkNode = files.find(f => f.absolutePath === linkPath)
          if (linkNode) src = copyOnDemand(linkNode)
        }
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
