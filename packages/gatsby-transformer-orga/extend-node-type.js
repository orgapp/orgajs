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

let pluginsCacheStr = ``
const astCacheKey = node =>
      `transformer-orga-ast-${
    node.internal.contentDigest
  }-${pluginsCacheStr}`

const contentCacheKey = node =>
      `transformer-orga-content-${
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

const ASTPromiseMap = new Map()

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
        tags: {
          type: GraphQLList(GraphQLString),
          resolve(section) {
            return section.tags || []
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
        resolve(orgNode) {
          return getContent(orgNode)
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
    return moment(timestamp, `YYYY-MM-DD ddd HH:mm`)
  }


  function getContentFromSection(ast, { category }) {
    // use the first headline for title
    const { headline, body } = decapitate(ast)
    if (headline.type !== `headline`) throw `section's first child is not headline`
    const title = select(`text`, headline).value
    // date
    const { EXPORT_DATE, CATEGORY } = getProperties(headline)
    const closedDate = (select(`planning`, headline) || {}).timestamp
    const date = getTimestamp(EXPORT_DATE || closedDate)
    return {
      title,
      date,
      category: CATEGORY || category,
      tags: headline.tags,
      html: getHTML(body),
    }

    function decapitate(ast) {
      const headline = ast.children[0]
      const children = ast.children.slice(1)
      return {
        headline,
        body: Object.assign({}, ast, { children }),
      }
    }
  }

  function getContentFromRoot(ast) {
    const { title, date, category, tags } = ast.meta || {}
    return {
      title,
      date,
      category,
      tags,
      html: getHTML(ast),
    }
  }

  async function getContent(orgNode) {
    const cachedContent = await cache.get(contentCacheKey(orgNode))
    if (cachedContent) return cachedContent
    const ast = await getAST(orgNode)
    const { orga_publish_keyword, category } = ast.meta
    let content
    if (orga_publish_keyword) {
      content = selectAll(`[keyword=${orga_publish_keyword}]`, ast)
        .map(n => getContentFromSection(n.parent, { category }))
    } else {
      content = [ getContentFromRoot(ast) ]
    }
    cache.set(contentCacheKey(orgNode), content)
    return content
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
    const cacheKey = astCacheKey(orgNode)
    const cachedAST = await cache.get(cacheKey)
    if (cachedAST) {
      return cachedAST
    }
    if (ASTPromiseMap.has(cacheKey)) return await ASTPromiseMap.get(cacheKey)
    const ASTGenerationPromise = getOrgAST(orgNode)
    ASTGenerationPromise.then(ast => {
      cache.set(cacheKey, ast)
      ASTPromiseMap.delete(cacheKey)
    }).catch(err => {
      ASTPromiseMap.delete(cacheKey)
      return err
    })

    // Save new AST to cache and return
    // We can now release promise, as we cached result
    ASTPromiseMap.set(cacheKey, ASTGenerationPromise)
    return ASTGenerationPromise
  }

  async function getOrgAST(orgNode) {
    return new Promise(resolve => {
      const parser = new Parser()
      const ast = parser.parse(orgNode.internal.content)
      resolve(ast)
    })
  }

  function getHTML(ast) {
    const highlight = pluginOptions.noHighlight !== true
    const handlers = { link: handleLink }
    const html = hastToHTML(toHAST(ast, { highlight, handlers }), { allowDangerousHTML: true })
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
}
