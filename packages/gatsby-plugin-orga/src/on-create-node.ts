export default async ({
  node, actions, getNode, loadNodeContent, createNodeId, createContentDigest,
}) => {

  // if (!unstable_shouldOnCreateNode({ node })) {
  //   return
  // }

  const content = await loadNodeContent(node)
  const orgaNode: any = {
    id: createNodeId(`${node.id} >>> Orga`),
    children: [],
    parent: node.id,
    internal: {
      content: content,
      type: 'Orga',
      contentDigest: createContentDigest(content),
    },
  }

  if (node.internal.type === 'File') {
    orgaNode.fileAbsolutePath = node.absolutePath
  }

  actions.createNode(orgaNode)
}
