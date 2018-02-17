import visit from 'unist-util-visit'
import org from 'org'
import path from 'path'
import Promise from 'bluebird'
import { Parser } from 'orga'
import toHAST from 'oast-to-hast'
import hastToHTML from 'hast-util-to-html'
import getPublicURL from './get-public-url'

const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLEnumType,
} = require(`graphql`)

import GraphQLJSON from 'graphql-type-json'

let pluginsCacheStr = ``
const astCacheKey = node =>
      `transformer-orga-ast-${
    node.internal.contentDigest
  }-${pluginsCacheStr}`

function handleLink(h, node) {
  const { uri, desc } = node
  var props = { href: uri.raw }

  if (node.title !== null && node.title !== undefined) {
    props.title = node.title
  }

  const type = mime.getType(uri.raw)
  if (type && type.startsWith(`image`)) {
    props = { src: uri.raw, alt: desc }
    return h(node, `img`, props)
  }
  return h(node, `a`, props, [
    u(`text`, `-- ${desc} --`)
  ])
}

module.exports = (
  { type, store, pathPrefix, getNode, cache },
  pluginOptions
) => {
  if (type.name !== `Orga`) {
    return {}
  }

  const files = Object.values(store.getState().nodes).filter(
    n => n.internal.type === `File`
  )

  function processLinks(ast, orgNode) {
    visit(ast, `link`, link => {
      const dir = getNode(orgNode.parent).dir
      // console.log(dir)
      // console.log(link.path, link.desc)
      console.log(link.uri)
      const linkPath = path.posix.join(
        getNode(orgNode.parent).dir,
        link.uri.location
      )
      const linkNode = files.find(
        f => f.absolutePath === linkPath
      )
      if (linkNode) {
        // console.log(linkNode)
        // link.path = getPublicURL({file: linkNode})
      }
    })
    return ast
  }

  async function getAST(orgNode) {
    return new Promise((resolve, reject) => {
      const parser = new Parser()
      const ast = parser.parse(orgNode.internal.content)
      // cache.set(astCacheKey(orgNode), ast)
      // resolve(processLinks(ast, orgNode))
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
