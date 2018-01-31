const crypto = require(`crypto`)
const org = require(`org`)

module.exports = async function onCreateNode(
  { node, getNode, loadNodeContent, boundActionCreators },
  pluginOptions) {

  // We only care about org content. The mime is not useful for us. Use extension directly
  if (node.extension !== `org`) {
    return
  }

  const { createNode, createParentChildLink } = boundActionCreators
  const content = await loadNodeContent(node)

  const parser = new org.Parser()
  var orgDocument = parser.parse(content)
  const orgHTMLDocument = orgDocument.convert(org.ConverterHTML, {
    headerOffset: 1,
    exportFromLineNumber: false,
    suppressSubScriptHandling: false,
    suppressAutoLink: false
  })
  const title = orgHTMLDocument.title
  const date = orgDocument.directiveValues[`date:`]
  const tags = ( orgDocument.directiveValues[`keywords:`] || '' ).split(' ').filter(String)
  console.log(orgDocument.directiveValues)

  const contentDigest = crypto
        .createHash(`md5`)
        .update(JSON.stringify(`data`))
        .digest(`hex`)
  const orgNode = {
    id: `${node.id} >>> Orga`,
    children: [],
    parent: node.id,
    title,
    date,
    tags,
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
