const fs = require(`fs`)
const path = require(`path`)
const mkdirp = require(`mkdirp`)
const withDefaults = require('./utis/default-options')
const { paginate, createPages } = require('./paginate')
const _ = require('lodash/fp')

// Ensure that content directories exist at site-level
exports.onPreBootstrap = ({ store }, themeOptions) => {
  const { program } = store.getState()
  const { contentPath } = withDefaults(themeOptions)

  const dirs = [
    path.join(program.directory, contentPath),
  ]

  dirs.forEach(dir => {
    // debug(`Initializing ${dir} directory`)
    if (!fs.existsSync(dir)) {
      mkdirp.sync(dir)
    }
  })
}

// These templates are simply data-fetching wrappers that import components
const PostTemplate = require.resolve(`./src/templates/post-query`)
const PostsTemplate = require.resolve(`./src/templates/posts-query`)

exports.createPages = async ({ graphql, actions, reporter }, themeOptions) => {
  const { createPage } = actions

  console.log(themeOptions)

  // create note pages
  const result = await graphql(`
  {
    allOrgContent(
      sort: { fields: [meta___date], order: DESC }
    ) {
      edges {
        node {
          id
          meta { category }
          fields { slug }
        }
      }
    }
  }`)

  if (result.errors) {
    reporter.panic(result.errors)
  }


  const notes = result.data.allOrgContent.edges

  paginate({
    items: notes,
    createPage,
    pageLength: 10,
    pathPrefix: `notes`,
    component: PostsTemplate,
  })

  createPages({
    items: notes,
    createPage,
    getPath: _.get(['fields', 'slug']),
    getId: _.get('id'),
    component: PostTemplate,
  })
}

// Add custom url pathname for blog posts.

exports.onCreateNode = ({ node, actions }) => {
  if (node.internal.type !== `OrgContent`) return
  const { createNodeField } = actions
  const { category, export_file_name } = node.meta
  const paths = [
    `/`,
    category,
    export_file_name,
  ].filter(lpath => lpath)
  const slug = path.posix.join(...paths)
  createNodeField({
    node,
    name: `slug`,
    value: slug,
  })
}
