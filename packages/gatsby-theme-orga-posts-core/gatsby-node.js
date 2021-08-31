/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require(`fs`)
const path = require(`path`)
const mkdirp = require(`mkdirp`)
const Debug = require(`debug`)
const withDefaults = require('./utils/default-options')
const createIndex = require('./utils/create-index')
const _ = require('lodash/fp')
const { createContentDigest, slash, joinPath } = require('gatsby-core-utils')
const { createRemoteFileNode } = require('gatsby-source-filesystem')

const debug = Debug(`gatsby-theme-orga`)

// Ensure that content directories exist at site-level
exports.onPreBootstrap = ({ store }, themeOptions) => {
  const { program } = store.getState()
  const { contentPath } = withDefaults(themeOptions)

  const dirs = [path.join(program.directory, contentPath)]

  dirs.forEach((dir) => {
    debug(`Initializing ${dir} directory`)
    if (!fs.existsSync(dir)) {
      mkdirp.sync(dir)
    }
  })
}

const orgResolverPassthrough =
  (fieldName) => async (source, args, context, info) => {
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

function validURL(str) {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

exports.createSchemaCustomization = ({ actions, schema }, themeOptions) => {
  const { createTypes } = actions
  createTypes(
    schema.buildObjectType({
      name: 'OrgPost',
      fields: {
        id: { type: 'ID!' },
        title: { type: 'String!' },
        category: { type: 'String' },
        tags: { type: '[String]!' },
        slug: { type: 'String!' },
        redirects: { type: '[String]!' },
        timeToRead: {
          type: 'Int!',
          resolve: orgResolverPassthrough('timeToRead'),
        },
        wordCount: {
          type: 'Int!',
          resolve: orgResolverPassthrough('wordCount'),
        },
        keyword: { type: 'String' },
        date: { type: 'Date', extensions: { dateformat: {} } },
        excerpt: {
          type: 'String!',
          resolve: orgResolverPassthrough('excerpt'),
        },
        html: {
          type: 'String!',
          resolve: orgResolverPassthrough('html'),
        },
        image: {
          type: `File`,
          resolve: async (source, args, context, info) => {
            if (source.image___NODE) {
              return context.nodeModel.getNodeById({ id: source.image___NODE })
            } else if (source.image) {
              return processRelativeImage(source, context, `image`)
            }
          },
        },
      },
      interfaces: ['Node'],
    })
  )
}

function processRelativeImage(source, context, type) {
  // Image is a relative path - find a corresponding file
  const mdxFileNode = context.nodeModel.findRootNodeAncestor(
    source,
    (node) => node.internal && node.internal.type === `File`
  )
  if (!mdxFileNode) {
    return
  }
  const imagePath = slash(path.join(mdxFileNode.dir, source[type]))

  const fileNodes = context.nodeModel.getAllNodes({ type: `File` })
  for (const file of fileNodes) {
    if (file.absolutePath === imagePath) {
      return file
    }
  }
}

// These templates are simply data-fetching wrappers that import components
const PostTemplate = require.resolve(`./src/templates/post-query`)
const PostsTemplate = require.resolve(`./src/templates/posts-query`)

const withAndWithoutTrailingSlash = (v) => {
  return [v, v.endsWith('/') ? v.slice(0, -1) : `${v}/`]
}

exports.createPages = async ({ graphql, actions, reporter }, themeOptions) => {
  const { createPage, createRedirect } = actions

  const {
    pagination,
    indexPath,
    categoryIndexPath,
    tagIndexPath,
    imageMaxWidth,
    columns,
  } = withDefaults(themeOptions)

  const result = await graphql(`
    {
      allOrgPost(sort: { fields: [date, title], order: DESC }, limit: 1000) {
        nodes {
          id
          category
          tags
          slug
          redirects
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panic(result.errors)
  }

  const posts = result.data.allOrgPost.nodes

  // create posts
  posts.forEach((post) => {
    createPage({
      path: post.slug,
      component: PostTemplate,
      context: { id: post.id, maxWidth: imageMaxWidth },
    })

    // handle redirects
    post.redirects.forEach((oldPath) => {
      withAndWithoutTrailingSlash(oldPath).forEach((op) =>
        createRedirect({
          fromPath: op,
          toPath: post.slug,
          isPermanent: true,
          redirectInBrowser: true,
        })
      )
    })
  })

  // create category index
  if (categoryIndexPath) {
    const categories = _.flow(
      _.map(_.get('category')),
      _.uniq,
      _.filter(Boolean)
    )(posts)

    categories.forEach((category) => {
      const basePath = categoryIndexPath(category)
      if (!basePath) return
      createIndex({
        basePath,
        createPage,
        posts: _.filter({ category })(posts),
        pagination,
        component: PostsTemplate,
        context: { columns },
      })
    })
  }

  // create tag index
  if (tagIndexPath) {
    const tags = _.flow(_.flatMap(_.get('tags')), _.uniq)(posts)

    tags.forEach((tag) => {
      const basePath = tagIndexPath(tag)
      if (!basePath) return
      createIndex({
        basePath,
        createPage,
        posts: posts.filter((p) => p.tags.includes(tag)),
        pagination,
        component: PostsTemplate,
        context: { tag, columns },
      })
    })
  }

  // create index for all
  if (indexPath) {
    createIndex({
      basePath: indexPath,
      createPage,
      posts,
      pagination,
      component: PostsTemplate,
      context: { columns },
    })
  }
}

// Add custom url pathname for blog posts.

const makeAbsolute = (p) => joinPath('/', p)

exports.onCreateNode = async (
  { node, actions, getNode, createNodeId, store, cache, reporter },
  themeOptions
) => {
  const { postRedirect, filter } = withDefaults(themeOptions)
  if (node.internal.type !== `OrgContent`) return
  if (!filter(node.metadata)) return

  const { createNode, createParentChildLink } = actions

  let redirects = postRedirect({ ...node.metadata, joinPath }) || []
  if (typeof redirects === 'string') {
    redirects = [redirects]
  } else if (!Array.isArray(redirects)) {
    reporter.panic(
      `postRedirect returns wrong type, expecting string or array of strings, actually got ${typeof redirects}`
    )
  }

  const orgaPostId = createNodeId(`${node.id} >>> OrgPost`)
  const fieldData = {
    ...node.metadata,
    slug: node.slug,
    redirects: redirects.map(makeAbsolute),
  }

  if (validURL(node.metadata.image)) {
    // create a file node for image URLs
    const remoteFileNode = await createRemoteFileNode({
      url: node.metadata.image,
      parentNodeId: node.id,
      createNode,
      createNodeId,
      cache,
      store,
    })
    // if the file was created, attach the new node to the parent node
    if (remoteFileNode) {
      fieldData.image___NODE = remoteFileNode.id
    }
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
    },
  })

  createParentChildLink({ parent: node, child: getNode(orgaPostId) })
}
