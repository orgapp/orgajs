const fs = require(`fs`)
const path = require(`path`)
const mkdirp = require(`mkdirp`)
const Debug = require(`debug`)
const withDefaults = require('./utils/default-options')
const createIndex = require('./utils/create-index')
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
    isPost,
    basePath,
    pagination,
    buildIndex,
    buildCategoryIndex,
    buildTagIndex,
  } = withDefaults(themeOptions)

  const result = await graphql(`
  {
    allOrgContent(
      sort: { fields: [date, title], order: DESC }, limit: 1000
    ) {
      nodes {
        id
        category
        tags
        fields { slug }
      }
    }
  }
`)

  if (result.errors) {
    reporter.panic(result.errors)
  }

  const posts = result
        .data.allOrgContent.nodes
        .filter(isPost)

  // create posts
  posts.forEach(post => {
    createPage({
      path: post.fields.slug,
      component: PostTemplate,
      context: { id: post.id },
    })
  })

  // create category index
  if (buildCategoryIndex) {
    const categories = _.flow(
      _.map(_.get('category')),
      _.uniq,
      _.filter(Boolean),
    )(posts)

    categories.forEach(category => {
      createIndex({
        basePath: path.resolve(basePath, category),
        createPage,
        posts: _.filter({ category })(posts),
        pagination,
        component: PostsTemplate,
      })
    })
  }

  // create tag index
  if (buildTagIndex) {
    const tags = _.flow(
      _.flatMap(_.get('tags')),
      _.uniq,
    )(posts)

    tags.forEach(tag => {
      createIndex({
        basePath: path.resolve(basePath, `:${tag}:`),
        createPage,
        posts: posts.filter(p => p.tags.includes(tag)),
        pagination,
        component: PostsTemplate,
        context: { tag },
      })
    })
  }

  // create index for all
  if (buildIndex) {
    createIndex({
      basePath,
      createPage,
      posts,
      pagination,
      component: PostsTemplate,
    })
  }
}

// Add custom url pathname for blog posts.


exports.onCreateNode = ({ node, actions }, themeOptions) => {
  const { basePath, slug } = withDefaults(themeOptions)
  if (node.internal.type !== `OrgContent`) return
  const { createNodeField } = actions

  const generateSlug = () => {
    return slug.split('/').map(str => {
      if (str.startsWith('$')) {
        return _.get(str.substring(1))(node)
      }
      return str
    })
  }

  const paths = [ basePath, ...generateSlug() ]
        .filter(lpath => !!lpath)

  createNodeField({
    node,
    name: `slug`,
    value: path.posix.join(...paths),
  })
}
