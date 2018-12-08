const u = require('unist-builder')
const path = require('path')
const Promise = require('bluebird')
const { Parser } = require('orga')
const toHAST = require('oast-to-hast')
const hastToHTML = require('hast-util-to-html')
const mime = require('mime')
const fsExtra = require('fs-extra')
const { selectAll, select } = require('unist-util-select')
const moment = require('moment')

const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLEnumType,
} = require('gatsby/graphql')
const GraphQLJSON = require('graphql-type-json')

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
  { type, store, pathPrefix, getNode, getNodesByType, cache },
  pluginOptions
) => {
  if (type.name !== `Orga`) {
    return {}
  }


  return new Promise((resolve, reject) => {

    const OrgSectionType = new GraphQLObjectType({
      name: `OrgSection`,
      fields: {
        title: {
          type: GraphQLString,
          resolve(section) {
            return section.title
          },
        },
        category: {
          type: GraphQLString,
          resolve(section) {
            return section.category
          },
        },
        date: {
          type: GraphQLString,
          resolve(section) {
            return `${section.date}`
          },
        },
        html: {
          type: GraphQLString,
          resolve(section) {
            return section.html
          },
        },
      }
    })

    return resolve({
      content: {
        type: new GraphQLList(OrgSectionType),
        resolve(orgaNode) {
          return getContent(orgaNode)
        }
      }
    })
  })

  function getProperties(headline) {
    const drawer = selectAll(`drawer`, headline).find(d => d.name === `PROPERTIES`)
    if (!drawer) return {}
    const regex = /\s*:(.+):\s*(.+)\s*$/
    return drawer.value.split(`\n`).reduce((accu, current) => {
      let m = current.match(regex)
      accu[m[1]] = m[2]
      return accu
    }, {})
  }

  function getTimestamp(timestamp) {
    const format = `YYYY-MM-DD ddd HH:mm`
    return moment(timestamp, format)
  }

  function getSection(ast, { category }) {
    var title, date
    if (ast.type === `section`) {
      // use the first headline for title
      const headline = ast.children.shift()
      if (headline.type !== `headline`) throw `section's first child is not headline`
      title = select(`text`, headline).value
      // date
      const { EXPORT_DATE } = getProperties(headline)
      const closedDate = (select(`planning`, headline) || {}).timestamp
      date = getTimestamp(EXPORT_DATE || closedDate)
    } else {
      ({ title, date } = ast.meta || {})
    }
    return {
      title,
      date,
      category,
      html: hastToHTML(toHAST(ast), { allowDangerousHTML: true }),
    }
  }

  async function getContent(orgaNode) {
    // TODO: caching
    const ast = await getAST(orgaNode)
    const { orga_publish_keyword, category } = ast.meta
    if (orga_publish_keyword) {
      return selectAll(`[keyword=${orga_publish_keyword}]`, ast)
        .map(n => getSection(n.parent, { category }))
    }
    return [ getSection(ast) ]
  }

  const newLinkURL = (linkNode, destinationDir) => {
    return path.posix.join(
      `/`,
      pathPrefix,
      destinationDir || `static`,
      newFileName(linkNode))
  }

  const files = getNodesByType(`File`)

  const orgFiles = getNodesByType(`Orga`)

  async function getAST(orgNode) {
    return new Promise(resolve => {
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


  return new Promise(resolve => {
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
