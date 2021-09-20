import * as fs from 'fs-extra'
import { GatsbyNode } from 'gatsby'
import parse from '@orgajs/metadata'

const onCreatePage: GatsbyNode['onCreatePage'] = async ({ page, actions }) => {
  if (page.context.properties) return

  const { deletePage, createPage } = actions

  const content = await fs.readFile(page.component, `utf8`)
  const metadata = parse(content)
  deletePage(page)
  createPage({
    ...page,
    context: {
      ...page.context,
      metadata,
      file: page.component,
    },
  })
}

export default onCreatePage
