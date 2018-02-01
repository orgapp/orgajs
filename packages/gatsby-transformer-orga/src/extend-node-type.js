import org from 'org'
import Promise from 'bluebird'
import { Parser } from 'orga'
import toHAST from 'oast-to-hast'
import hastToHTML from 'hast-util-to-html'

const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLEnumType,
} = require(`graphql`)

let pluginsCacheStr = ``
const astCacheKey = node =>
      `transformer-remark-markdown-ast-${
    node.internal.contentDigest
  }-${pluginsCacheStr}`

module.exports = (
  { type, store, pathPrefix, getNode, cache },
  pluginOptions
) => {
  if (type.name !== `Orga`) {
    return {}
  }


  async function getAST(orgNode) {
    const cachedAST = await cache.get(astCacheKey(orgNode))
    if (cachedAST) {
      return cachedAST
    } else {
      return new Promise((resolve, reject) => {
        const parser = new Parser()
        const ast = parser.parse(orgNode.internal.content)
        cache.set(astCacheKey(orgNode), ast)
        resolve(ast)
      })
    }
  }

  async function getHTML(orgNode) {
    return getAST(orgNode).then(ast => {
      const html = hastToHTML(toHAST(ast), { allowDangerousHTML: true })
      return html
    })
  }

  async function getMeta(orgNode) {
    return getAST(orgNode).then(ast => {
      return {
        title: ast.settings.title,
        date: ast.settings.date,
        tags: ast.settings.tags,
      }
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
        type: new GraphQLObjectType({
          name: `meta`,
          fields: {
            title: { type: GraphQLString },
            date: { type: GraphQLString },
            tags: { type: new GraphQLList(GraphQLString) },
          }
        }),
        resolve(orgNode) {
          return getMeta(orgNode)
        }
      },

    })
  })
}
