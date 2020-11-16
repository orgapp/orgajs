const fs = require(`fs`)
const path = require(`path`)
const mkdirp = require(`mkdirp`)
const Debug = require(`debug`)
const withDefaults = require('./utils/default-options')
const createIndex = require('./utils/create-index')
const _ = require('lodash/fp')
const { createContentDigest, slash } = require('gatsby-core-utils')


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
    interfaces: [`Node`],
  }))
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

exports.createPages = async ({ graphql, actions, reporter }, themeOptions) => {
  const { createPage } = actions

  const {
    pagination,
    indexPath,
    categoryIndexPath,
    tagIndexPath,
    imageMaxWidth,
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
      context: { id: post.id, maxWidth: imageMaxWidth },
    })
  })

  // create category index
  if (categoryIndexPath) {
    const categories = _.flow(
      _.map(_.get('category')),
      _.uniq,
      _.filter(Boolean),
    )(posts)

    categories.forEach(category => {
      const basePath = categoryIndexPath(category)
      if (!basePath) return
      createIndex({
        basePath,
        createPage,
        posts: _.filter({ category })(posts),
        pagination,
        component: PostsTemplate,
      })
    })
  }

  // create tag index
  if (tagIndexPath) {
    const tags = _.flow(
      _.flatMap(_.get('tags')),
      _.uniq,
    )(posts)

    tags.forEach(tag => {
      const basePath = tagIndexPath(tag)
      if (!basePath) return
      createIndex({
        basePath,
        createPage,
        posts: posts.filter(p => p.tags.includes(tag)),
        pagination,
        component: PostsTemplate,
        context: { tag },
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
    })
  }
}

// Add custom url pathname for blog posts.


exports.onCreateNode = async (
  { node, actions, getNode, createNodeId, store, cache },
  themeOptions
) => {
  const { postPath, filter } = withDefaults(themeOptions)
  if (node.internal.type !== `OrgContent`) return
  if (!filter(node.metadata)) return

  const { createNode, createParentChildLink } = actions

  // const generateSlug = () => {
  //   return slug.split('/').map(str => {
  //     if (str.startsWith('$')) {
  //       return _.get(str.substring(1))(node.metadata)
  //     }
  //     return str
  //   })
  // }

  const slug = postPath(node.metadata)
  if (!slug) return

  // const paths = [ basePath, ...generateSlug() ].filter(lpath => !!lpath)
  const orgaPostId = createNodeId(`${node.id} >>> OrgPost`)
  const fieldData = {
    ...node.metadata,
    slug,
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
    }
  })

  createParentChildLink({ parent: node, child: getNode(orgaPostId) })
}
