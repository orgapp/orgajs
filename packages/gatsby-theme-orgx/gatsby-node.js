const path = require('path')
const crypto = require('crypto')

const Template = require.resolve('./src/templates/document')

const extensions = ['.org']

const basePath = '/'

const orgxResolverPassthrough = fieldName => async (
  source,
  args,
  context,
  info
) => {
  const type = info.schema.getType(`Orga`)
  const mdxNode = context.nodeModel.getNodeById({
    id: source.parent
  })

  const resolver = type.getFields()[fieldName].resolve
  const result = await resolver(mdxNode, args, context, {
    fieldName
  })

  return result
}

const unstable_shouldOnCreateNode = ({ node }) => {
  return node.internal.type === 'Orga'
}

exports.unstable_shouldOnCreateNode  = unstable_shouldOnCreateNode

exports.sourceNodes = ({ actions, schema }) => {
  const { createTypes } = actions

  createTypes(
    schema.buildObjectType({
      name: 'Orgx',
      fields: {
        id: { type: 'ID!' },
        slug: { type: 'String!' },
        body: {
          type: 'String!',
          resolve: orgxResolverPassthrough('body'),
        },
      },
      interfaces: ['Node'],
    })
  )
}

exports.onCreateNode = async ({
  node, actions, getNode, createNodeId,
}) => {

  const { createNode, createParentChildLink } = actions

  if (!unstable_shouldOnCreateNode({ node })) {
    return
  }

  const getSlug = node => {
    const { dir } = path.parse(node.relativePath)
    const fullPath = [basePath, dir, node.name]
    return path.join(...fullPath)
  }

  const fileNode = getNode(node.parent)
  const slug = getSlug(fileNode)

  const fieldData = { slug }
  createNode({
    id: createNodeId(`${node.id} >>> Orga`),
    parent: node.id,
    children: [],
    internal: {
      type: 'Orgx',
      contentDigest: crypto.createHash('md5').update(JSON.stringify(fieldData)).digest('hex'),
      content: JSON.stringify(fieldData),
      description: 'Orgx',
    },
    slug: slug,
  })

  createParentChildLink({ parent: fileNode, child: node })
}

exports.createPages = async ({
  graphql, actions, reporter,
}) => {

  const result = await graphql(`
{
  documents: allOrgx {
    nodes { id slug }
  }
}
  `)
  if (result.errors) {
    reporter.panic(result.errors)
  }

  // @ts-ignore
  const documents = result.data.documents.nodes

  const { createPage } = actions

  documents.forEach((document, index) => {
    const { slug } = document
    createPage({
      path: slug,
      component: Template,
      context: {
        ...document,
      }
    })

  })

}
