const fs = require(`fs`)
const path = require(`path`)
const mkdirp = require(`mkdirp`)
const Debug = require(`debug`)
const withDefaults = require('./utis/default-options')
const { createPages, createIndexPage } = require('./paginate')
const _ = require('lodash/fp')

const debug = Debug(`gatsby-theme-orga`)

// Ensure that content directories exist at site-level
exports.onPreBootstrap = ({ store }, themeOptions) => {
  const { program } = store.getState()
  const { contentPath } = withDefaults(themeOptions)

  const dirs = [
    path.join(program.directory, contentPath),
  ]

  dirs.forEach(dir => {
    debug(`Initializing ${dir} directory`)
    if (!fs.existsSync(dir)) {
      mkdirp.sync(dir)
    }
  })
}

// exports.createSchemaCustomization = ({ actions, schema }, themeOptions) => {
//   const def = _.flow(
//     _.reduce((o, m) => {
//       if (m.startsWith(`date(formatString:`)) return o
//       return { ...o, [m]: 'String' }
//     }, {}),
//     d => ({
//       ...d,
//       tags: `[String!]`,
//       date: `Date @dateformat`,
//     }),
//     _.toPairs,
//     _.map(([k, v]) => `${k}: ${v}`),
//     _.join(` `),
//   )(themeOptions.metadata)

//   const { createTypes } = actions
//   const typeDefs = `
//     type OrgContent implements Node {
//       metadata: Metadata
//     }
//     type Metadata {
//       ${ def }
//     }
//   `
//   createTypes(typeDefs)
// }

// These templates are simply data-fetching wrappers that import components
const PostTemplate = require.resolve(`./src/templates/post-query`)
const PostsTemplate = require.resolve(`./src/templates/posts-query`)

exports.createPages = async ({ graphql, actions, reporter }, themeOptions) => {
  const { createPage } = actions

  const {
    filter,
    basePath,
    pagination,
    buildIndexPage,
    buildCategoryIndexPage,
    metadata,
    sortBy,
    order,
  } = withDefaults(themeOptions)


  const metadataQuery = _.flow(
    m => buildCategoryIndexPage ? _.concat('category')(m) : m,
    _.uniq,
    _.join(' '),
    // q => `metadata { ${ q } }`,
  )(metadata)

  debug(`metadata query: ${metadataQuery}`)

  const sort = `
sort: {
  fields: [${sortBy.map(i => `${i}`).join(`,`)}]
  order: ${order}
}
`

  const result = await graphql(`
  {
    allOrgContent(${sort}) {
      edges {
        node {
          id
          ${ metadataQuery }
          fields { slug }
        }
      }
    }
  }`)

  if (result.errors) {
    reporter.panic(result.errors)
  }

  const items = _.flow([
    _.get(`data.allOrgContent.edges`),
    filter && typeof filter === `function` &&  _.filter(e => filter(e.node)),
  ].filter(Boolean))(result)

  if (buildIndexPage) {
    createIndexPage({
      items,
      createPage,
      pageLength: pagination,
      basePath,
      component: PostsTemplate,
    })
  }

  if (buildCategoryIndexPage) {
    _.flow([
      _.groupBy(_.get('node.category')),
      _.toPairs,
      _.map(([category, _items]) => {
        createIndexPage({
          items: _items,
          createPage,
          pageLength: 0,
          basePath: path.posix.join(...[basePath, `${category}`]),
          component: PostsTemplate,
        })
      })
    ])(items)
  }


  createPages({
    items,
    createPage,
    getPath: _.get(['fields', 'slug']),
    getId: _.get('id'),
    component: PostTemplate,
  })
}

// Add custom url pathname for blog posts.

exports.onCreateNode = ({ node, actions }, themeOptions) => {
  const { basePath, slug } = withDefaults(themeOptions)
  if (node.internal.type !== `OrgContent`) return
  const { createNodeField } = actions
  const paths = [ basePath ]
        .concat(slug.map(k => {
          if (k.startsWith('$')) {
            return _.get(k.substring(1))(node)
          }
          return k
        }))
        .filter(lpath => lpath)
  createNodeField({
    node,
    name: `slug`,
    value: path.posix.join(...paths),
  })
}
