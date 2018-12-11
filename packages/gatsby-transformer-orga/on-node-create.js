const { Parser } = require('orga')
const crypto = require(`crypto`)
const util = require('util')
const { selectAll } = require('unist-util-select')
const { getProperties } = require('./orga-util')

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
      // ast: await getAST(content),
      internal: {
        content,
        contentDigest,
        type: `OrgFile`,
      },
    }

    // Add path to the org-mode file path
    if (fileNode.internal.type === `File`) {
      orgFileNode.fileAbsolutePath = fileNode.absolutePath
      orgFileNode.fileName = fileNode.name
    }

    createNode(orgFileNode)
    createParentChildLink({ parent: fileNode, child: orgFileNode })
  }

  async function createOrgContentNodes(orgFileNode) {
    // const ast = orgFileNode.ast
    const ast = await getAST(orgFileNode)
    // console.log(`>>> ${util.inspect(orgFileNode, false, null, true)}`)
    const { orga_publish_keyword, category } = ast.meta
    let content
    if (orga_publish_keyword) {
      content = selectAll(`[keyword=${orga_publish_keyword}]`, ast)
        .map(n => n.parent)
    } else {
      content = [ ast ]
    }

    content.map((ast, index) => ({
      id: `${orgFileNode.id} >>> OrgContent[${index}]`,
      orga_id: `${orgFileNode.id} >>> OrgContent[${index}]`,
      children: [],
      parent: orgFileNode.id,
      ast,
      meta: ast.meta || getProperties(ast.children[0]), // TODO: this is not safe
      internal: {
        contentDigest: crypto.createHash(`md5`)
                             .update(JSON.stringify(ast, getCircularReplacer()))
                             .digest(`hex`),
        type: `OrgContent`,
      },
    })).forEach(n => {
      createNode(n)
      createParentChildLink({ parent: orgFileNode, child: n })
    })
  }

  // get AST from `OrgFile` node
  async function getAST(node) {
    const cacheKey = astCacheKey(node)
    const cachedAST = await cache.get(cacheKey)
    if (cachedAST) {
      return cachedAST
    }
    if (ASTPromiseMap.has(cacheKey)) return await ASTPromiseMap.get(cacheKey)
    const ASTGenerationPromise = getOrgAST(node)
    ASTGenerationPromise.then(ast => {
      cache.set(cacheKey, ast)
      ASTPromiseMap.delete(cacheKey)
    }).catch(err => {
      ASTPromiseMap.delete(cacheKey)
      return err
    })

    // Save new AST to cache and return
    // We can now release promise, as we cached result
    ASTPromiseMap.set(cacheKey, ASTGenerationPromise)
    return ASTGenerationPromise
  }

  async function getOrgAST(node) {
    return new Promise(resolve => {
      const parser = new Parser()
      const ast = parser.parse(node.internal.content)
      resolve(ast)
    })
  }
}
