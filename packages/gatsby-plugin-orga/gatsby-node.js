const {
  getPathToContentComponent,
} = require('gatsby-core-utils/dist/parse-component-path')
const { promises: fs } = require('fs')
const path = require('path')
const { cachedImport } = require('./cache-helpers')
const { compile } = require('@orgajs/orgx')

/** @type {import('gatsby').GatsbyNode['resolvableExtensions']} */
exports.resolvableExtensions = () => ['.org']

/** @type {import('gatsby').GatsbyNode['onCreateWebpackConfig']} */
exports.onCreateWebpackConfig = async ({ actions, loaders }, pluginOptions) => {
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.org$/,
          use: ({ resourceQuery, issuer }) => [
            loaders.js({
              isPageTemplate: /async-requires/.test(issuer),
              resourceQuery,
            }),
            {
              loader: '@orgajs/loader',
              options: pluginOptions,
            },
          ],
        },
      ],
    },
  })
}

/** @type {import('gatsby').GatsbyNode['preprocessSource']} */
exports.preprocessSource = async ({ filename }, pluginOptions) => {
  const orgPath = getPathToContentComponent(filename)
  const ext = path.extname(orgPath)

  if (ext !== '.org') {
    return undefined
  }
  const contents = await fs.readFile(orgPath)
  const code = await compile(contents, pluginOptions)
  return code.toString()
}

/** @type {import('gatsby').GatsbyNode['createSchemaCustomization']} */
exports.createSchemaCustomization = ({ schema, actions }) => {
  const { createTypes } = actions
  const typeDefs = [
    schema.buildObjectType({
      name: 'Org',
      fields: {
        id: 'ID!',
        children: {
          type: '[Org]',
          resolve: (source) => source.children || [],
        },
      },
      extensions: { infer: true },
      interfaces: ['Node'],
    }),
  ]
  createTypes(typeDefs)
}

/** @type {import('gatsby').GatsbyNode['shouldOnCreateNode']} */
exports.shouldOnCreateNode = ({ node }) => {
  return node.internal.type === `File` && node.ext === '.org'
}

/** @type {import('gatsby').GatsbyNode['onCreateNode']} */
exports.onCreateNode = async ({
  node,
  createNodeId,
  actions,
  loadNodeContent,
}) => {
  const { createNode, createParentChildLink } = actions
  const content = await loadNodeContent(node)
  const { parse } = await cachedImport('@orgajs/metadata')
  const metadata = parse(content)
  const orgNode = {
    id: createNodeId(`${node.id} >>> Org`),
    children: [],
    parent: node.id,
    internal: {
      type: 'Org',
      contentDigest: node.internal.contentDigest,
      contentFilePath: node.absolutePath,
    },
    body: content,
    metadata,
  }
  createNode(orgNode)
  createParentChildLink({ parent: node, child: orgNode })

  return orgNode
}

/** @type {import('gatsby').GatsbyNode['onCreatePage']} */
exports.onCreatePage = async ({ page, actions, getNodesByType }) => {
  const { createPage, deletePage } = actions

  const mdxPath = getPathToContentComponent(page.component)
  const ext = path.extname(mdxPath)

  // Only apply on pages based on .mdx files
  if (ext !== '.org') {
    return
  }

  const fileNode = getNodesByType(`File`).find(
    (node) => node.absolutePath === mdxPath
  )
  if (!fileNode) {
    throw new Error(`Could not locate File node for ${mdxPath}`)
  }

  // Avoid loops
  if (!page.context?.metadata) {
    const content = await fs.readFile(mdxPath, `utf8`)
    const { parse } = await cachedImport('@orgajs/metadata')
    const metadata = parse(content)

    deletePage(page)
    createPage({
      ...page,
      context: {
        ...page.context,
        metadata,
      },
    })
  }
}

/** @type {import('gatsby').GatsbyNode['pluginOptionsSchema']} */
exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    jsx: Joi.boolean().description('Whether to keep JSX'),
    outputFormat: Joi.string()
      .valid(`program`, `function-body`)
      .description(`Whether to compile to a whole program or a function body`),
    reorgPlugins: Joi.array().description(
      `List of remark (mdast, markdown) plugins`
    ),
  })
    .unknown(true)
    .default({})
    .description('')
}
