import crypto from 'crypto'
import { Headline, parseTimestamp, Section } from 'orga'
import { select, selectAll } from 'unist-util-select'
import { cacheAST, getAST, processMeta, sanitise } from './orga-util'

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
    const { orga_publish_keyword = ``, category } = ast.properties || {}
    let content = []
    const _keywords = orga_publish_keyword
      .split(' ').map(k => k.trim()).filter(k => k.length > 0)

    if (_keywords.length > 0) { // section
      const selector = `:matches(${_keywords.map(k => `[keyword=${k}]`).join(`,`)})headline`

      const sections = selectAll('section', ast).filter((s: Section) => {
        const headline = s.children[0] as Headline
        return _keywords.includes(headline.keyword)
      })

      // content = selectAll(selector, ast)
      content = sections.map((ast: Section) => {
        const { date, export_date, export_title, ...properties } = ast.properties
        // const title = export_title || select(`text.plain`, ast).value

        const headline = select('headline', ast) as Headline
        const title = export_title || headline.content

        const d = parseTimestamp(date) ||
          parseTimestamp(export_date) ||
          select(`timestamp`, ast) ||
          select(`planning[keyword=CLOSED]`, ast)

        const metadata: any = {
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
          getAST: () => ast,
          absolutePath,
        }
      })
    } else { // root
      const metadata = {
        export_file_name: orgFileNode.fileName,
        ...ast.properties }
      metadata.title = metadata.title || 'Untitled'
      const absolutePath = `${orgFileNode.fileAbsolutePath}`
      const d = parseTimestamp(metadata.date) ||
        parseTimestamp(metadata.export_date)
      if (d && d.date) { metadata.date = d.date }
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
