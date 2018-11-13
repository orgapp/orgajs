const crypto = require(`crypto`)

module.exports = async function onCreateNode(
  { node, loadNodeContent, actions }) {

  // We only care about org content. The mime is not useful for us. Use extension directly
  if (node.extension !== `org`) {
    return
  }

  const { createNode, createParentChildLink } = actions
  const content = await loadNodeContent(node)

  const contentDigest = crypto
        .createHash(`md5`)
        .update(content)
        .digest(`hex`)
  const orgNode = {
    id: `${node.id} >>> Orga`,
    children: [],
    parent: node.id,
    internal: {
      content,
      contentDigest,
      type: `Orga`,
    },
  }

  // Add path to the org-mode file path
  if (node.internal.type === `File`) {
    orgNode.fileAbsolutePath = node.absolutePath
  }

  createNode(orgNode)
  createParentChildLink({ parent: node, child: orgNode })
}
