const org = require(`org`)
const Promise = require(`bluebird`)

const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLEnumType,
} = require(`graphql`)

module.exports = (
  { type, store, pathPrefix, getNode, cache },
  pluginOptions
) => {
  if (type.name !== `Org`) {
    return {}
  }

  async function getHTML(orgNode) {
    return await new Promise((resolve, reject) => {
      const parser = new org.Parser()
      var orgDocument = parser.parse(orgNode.internal.content)
      const orgHTMLDocument = orgDocument.convert(org.ConverterHTML, {
        headerOffset: 1,
        exportFromLineNumber: false,
        suppressSubScriptHandling: false,
        suppressAutoLink: false
      })
      resolve(orgHTMLDocument.contentHTML)
    })
  }

  return new Promise((resolve, reject) => {
    return resolve({
      html: {
        type: GraphQLString,
        resolve(orgNode) {
          return getHTML(orgNode)
        }
      }
    })
  })
}
