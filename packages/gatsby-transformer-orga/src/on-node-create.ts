import { parseTimestamp } from 'orga'
import { selectAll, select } from 'unist-util-select'
import {
  getProperties,
  sanitise,
  processMeta,
  getAST,
  cacheAST,
} from './orga-util'
import crypto from 'crypto'

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
    // const ast = orgFileNode.ast
    const ast = await getAST({ node: orgFileNode, cache })
    const { orga_publish_keyword = ``, category } = ast.meta
    let content = []
    const _keywords = orga_publish_keyword
          .split(' ').map(k => k.trim()).filter(k => k.length > 0)

    if (_keywords.length > 0) { // section
      const selector = `:matches(${_keywords.map(k => `[keyword=${k}]`).join(`,`)})headline`
      content = selectAll(selector, ast)
        .map(ast => {
          const { date, export_date, export_title, ...properties } = getProperties(ast)
          const title = export_title || select(`text`, ast).value

          const d = parseTimestamp(date) ||
                parseTimestamp(export_date) ||
                select(`timestamp`, ast) ||
                select(`planning[keyword=CLOSED]`, ast)

          const metadata = {
            title,
            export_file_name: sanitise(title),
            category: category || orgFileNode.fileName,
            keyword: ast.keyword,
            tags: ast.tags,
            ...properties,
          }

          if (d && d.date) { metadata.date = d.date }
          if (d && d.end) { metadata.end = d.end }

          const absolutePath = `${orgFileNode.fileAbsolutePath}::*${title}`
          return {
            metadata,
            getAST: () => ast.parent, // we need the secion of the headline
            absolutePath,
          }
        })
    } else { // root
        const metadata = {
          export_file_name: orgFileNode.fileName,
          ...ast.meta }
      metadata.title = metadata.title || 'Untitled'
      const absolutePath = `${orgFileNode.fileAbsolutePath}`
      content = [ {
        metadata,
        getAST: () => ast,
        absolutePath,
      } ]
    }

    content.forEach((node, index) => {
      const id = `${orgFileNode.id} >>> OrgContent[${index}]`
      const ast = node.getAST()
      const contentDigest =
            crypto.createHash(`md5`)
                  .update(JSON.stringify(ast, getCircularReplacer()))
                  .digest(`hex`)
      const n = {
        id,
        orga_id: id,
        children: [],
        parent: orgFileNode.id,
        internal: {
          contentDigest,
          type: `OrgContent`,
        },
        ...node,
        metadata: processMeta(node.metadata),
      }
      cacheAST({ ast, node: n, cache })
      createNode(n)
      createParentChildLink({ parent: orgFileNode, child: n })
    })
  }
}
