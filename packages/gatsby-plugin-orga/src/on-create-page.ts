import * as fs from 'fs-extra'
import { GatsbyNode } from 'gatsby'
import { compile } from './orga'

const onCreatePage: GatsbyNode['onCreatePage'] = async (
  { page, cache, actions },
  options
) => {
  if (page.context.properties) return

  const { deletePage, createPage } = actions

  const content = await fs.readFile(page.component, `utf8`)
  const { code, imports, properties = {} } = await compile({ content, cache })
  deletePage(page)
  createPage({
    ...page,
    context: {
      ...page.context,
      properties,
      file: page.component,
    },
  })
}

export default onCreatePage
