const { Parser } = require('orga')
const crypto = require(`crypto`)
const util = require('util')

const astCacheKey = node =>
      `transformer-orga-ast-${
    node.internal.contentDigest
  }`

const ASTPromiseMap = new Map()

const getCircularReplacer = () => {
  const seen = new WeakSet()
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return
      }
      seen.add(value)
    }
    return value
  }
}

module.exports = async function onCreateNode(
  { node, loadNodeContent, actions, cache }) {

  const { createNode, createParentChildLink } = actions
  // We only care about org content. The mime is not useful for us. Use extension directly
  if (node.extension === `org`) {
    await createOrgFileNode(node)
  }

  if (node.internal.type === `OrgFile`) {
    await createOrgContentNodes(node)
  }

  async function createOrgFileNode(fileNode) {
    const content = await loadNodeContent(fileNode)

    const contentDigest = crypto
          .createHash(`md5`)
          .update(content)
          .digest(`hex`)
    const orgFileNode = {
      id: `${fileNode.id} >>> OrgFile`,
      children: [],
      parent: fileNode.id,
      ast: await getAST(content),
      internal: {
        content,
        contentDigest,
        type: `OrgFile`,
      },
    }

    // Add path to the org-mode file path
    if (fileNode.internal.type === `File`) {
      orgFileNode.fileAbsolutePath = fileNode.absolutePath
    }

    createNode(orgFileNode)
    createParentChildLink({ parent: fileNode, child: orgFileNode })
  }

  async function createOrgContentNodes(orgFileNode) {
    const ast = orgFileNode.ast
    // console.log(`>>> ${util.inspect(orgFileNode, false, null, true)}`)
    const { orga_publish_keyword, category } = ast.meta
    let content
    if (orga_publish_keyword) {
      content = selectAll(`[keyword=${orga_publish_keyword}]`, ast)
        .map(n => n.parent)
    } else {
      content = [ ast ]
    }

    content.map((_ast, index) => ({
      id: `${orgFileNode.id} >>> OrgContent[${index}]`,
      children: [],
      parent: orgFileNode.id,
      ast: _ast,
      internal: {
        contentDigest: crypto.createHash(`md5`)
                             .update(JSON.stringify(_ast, getCircularReplacer()))
                             .digest(`hex`),
        type: `OrgContent`,
      },
    })).forEach(n => {
      createNode(n)
      createParentChildLink({ parent: orgFileNode, child: n })
    })
  }

  async function getAST(content) {
    console.log(`>> getAST`)
    return new Promise(resolve => {
      const parser = new Parser()
      const ast = parser.parse(content)
      resolve(ast)
    })
  }
}
