import u from 'unist-builder'
import visit from 'unist-util-visit'
import path from 'path'
import Promise from 'bluebird'
import { Parser } from 'orga'
import toHAST from 'oast-to-hast'
import hastToHTML from 'hast-util-to-html'
import getPublicURL from './get-public-url'
import mime from 'mime'
import fsExtra from 'fs-extra'

import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLEnumType,
} from 'graphql'
import GraphQLJSON from 'graphql-type-json'

const DEPLOY_DIR = `public`

let pluginsCacheStr = ``
const astCacheKey = node =>
      `transformer-orga-ast-${
    node.internal.contentDigest
  }-${pluginsCacheStr}`

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
  { type, store, pathPrefix, getNode, cache },
  pluginOptions
) => {
  if (type.name !== `Orga`) {
    return {}
  }

  const newLinkURL = (linkNode, destinationDir) => {
    return path.posix.join(
      `/`,
      pathPrefix,
      destinationDir || `static`,
      newFileName(linkNode))
  }


  const files = Object.values(store.getState().nodes).filter(
    n => n.internal.type === `File`
  )

  const orgFiles = Object.values(store.getState().nodes).filter(
    n => n.internal.type === `Orga`
  )

  async function getAST(orgNode) {
    return new Promise((resolve, reject) => {
      const parser = new Parser()
      const ast = parser.parse(orgNode.internal.content)
      // cache.set(astCacheKey(orgNode), ast)
      resolve(ast)
    })


    // const cachedAST = await cache.get(astCacheKey(orgNode))
    // if (cachedAST) {
    //   return cachedAST
    // } else {
    //   return new Promise((resolve, reject) => {
    //     const parser = new Parser()
    //     const ast = parser.parse(orgNode.internal.content)
    //     cache.set(astCacheKey(orgNode), ast)
    //     resolve(ast)
    //   })
    // }
  }

  async function getHTML(orgNode) {
    const highlight = pluginOptions.noHighlight !== true
    return getAST(orgNode).then(ast => {
      const handlers = { link: handleLink }
      const html = hastToHTML(toHAST(ast, { highlight, handlers }), { allowDangerousHTML: true })
      return html
    })

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
          getNode(orgNode.parent).dir,
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

  async function getMeta(orgNode) {
    return getAST(orgNode).then(ast => {
      return ast.meta
    })
  }

  return new Promise((resolve, reject) => {
    return resolve({
      html: {
        type: GraphQLString,
        resolve(orgNode) {
          return getHTML(orgNode)
        }
      },

      meta: {
        type: GraphQLJSON,
        resolve(orgNode) {
          return getMeta(orgNode)
        }
      },

    })
  })
}
