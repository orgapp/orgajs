const fs = require(`fs`)
const path = require(`path`)
const mkdirp = require(`mkdirp`)
const Debug = require(`debug`)
const withDefaults = require('./utils/default-options')
const createIndex = require('./utils/create-index')
const _ = require('lodash/fp')
const { createContentDigest } = require('gatsby-core-utils')


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

const orgResolverPassthrough = (fieldName) => async (
  source,
  args,
  context,
  info
) => {
  const type = info.schema.getType('OrgContent')
  const mdxNode = context.nodeModel.getNodeById({
    id: source.parent,
  })
  const resolver = type.getFields()[fieldName].resolve
  const result = await resolver(mdxNode, args, context, {
    fieldName,
  })
  return result
}


exports.createSchemaCustomization = ({ actions, schema }, themeOptions) => {
  const { createTypes } = actions
  createTypes(schema.buildObjectType({
    name: 'OrgPost',
    fields: {
      id: { type: 'ID!' },
      title: { type: 'String!' },
      category: { type: 'String' },
      tags: { type: '[String]!' },
      slug: { type: 'String!' },
      keyword: { type: 'String' },
      date: { type: 'Date' },
      excerpt: {
        type: 'String!',
        resolve: orgResolverPassthrough('excerpt'),
      },
      html: {
        type: 'String!',
        resolve: orgResolverPassthrough('html'),
      },
    },
    interfaces: [`Node`],
  }))
}

// These templates are simply data-fetching wrappers that import components
const PostTemplate = require.resolve(`./src/templates/post-query`)
const PostsTemplate = require.resolve(`./src/templates/posts-query`)

exports.createPages = async ({ graphql, actions, reporter }, themeOptions) => {
  const { createPage } = actions

  const {
    basePath,
    pagination,
    buildIndex,
    buildCategoryIndex,
    buildTagIndex,
  } = withDefaults(themeOptions)

  const result = await graphql(`
  {
    allOrgPost(
      sort: { fields: [date, title], order: DESC }, limit: 1000
    ) {
      nodes {
        id
        category
        tags
        slug
      }
    }
  }
`)

  if (result.errors) {
    reporter.panic(result.errors)
  }

  const posts = result
        .data.allOrgPost.nodes

  // create posts
  posts.forEach(post => {
    createPage({
      path: post.slug,
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

exports.onCreateNode = async ({ node, actions, getNode, createNodeId }, themeOptions) => {
  const { basePath, slug, filter } = withDefaults(themeOptions)
  if (node.internal.type !== `OrgContent`) return
  if (!filter(node.metadata)) return

  const { createNode, createParentChildLink } = actions

  const generateSlug = () => {
    return slug.split('/').map(str => {
      if (str.startsWith('$')) {
        return _.get(str.substring(1))(node.metadata)
      }
      return str
    })
  }

  const paths = [ basePath, ...generateSlug() ].filter(lpath => !!lpath)
  const orgaPostId = createNodeId(`${node.id} >>> OrgPost`)
  const fieldData = {
    ...node.metadata,
    slug: path.posix.join(...paths),
  }
  await createNode({
    ...fieldData,
    id: orgaPostId,
    parent: node.id,
    children: [],
    internal: {
      type: 'OrgPost',
      contentDigest: createContentDigest(fieldData),
      content: JSON.stringify(fieldData),
      description: 'Orga implementation of the BlogPost interface',
    }
  })

  createParentChildLink({ parent: node, child: getNode(orgaPostId) })
}
