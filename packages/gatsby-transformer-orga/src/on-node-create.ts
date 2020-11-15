import crypto from 'crypto'
import { build } from 'orga-posts'
import { cacheAST } from './orga-util'

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

export = async function onCreateNode(
  { node, loadNodeContent, actions, cache, pathPrefix }) {

  const { createNode, createParentChildLink, createNodeField } = actions
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
    const orgFileNode: any = {
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
    const text = orgFileNode.internal.content
    const posts = await build({ text, filename: orgFileNode.fileName })

    posts.forEach(({ ast, ...post }, index) => {
      const id = `${orgFileNode.id} >>> OrgContent[${index}]`
      const absolutePath = `${orgFileNode.fileAbsolutePath}::*${post.title}`
      const contentDigest =
        crypto.createHash(`md5`)
          .update(JSON.stringify(ast, getCircularReplacer()))
          .digest(`hex`)
      const n = {
        id,
        children: [],
        parent: orgFileNode.id,
        metadata: post,
        internal: {
          contentDigest,
          type: `OrgContent`,
        },
        absolutePath,
      }
      cacheAST({ ast, node: n, cache })
      createNode(n)
      createParentChildLink({ parent: orgFileNode, child: n })
    })
  }
}
