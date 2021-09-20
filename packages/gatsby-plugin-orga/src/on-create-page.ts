import * as fs from 'fs-extra'
import { GatsbyNode } from 'gatsby'
import metadata from '@orgajs/metadata'

const onCreatePage: GatsbyNode['onCreatePage'] = async (
  { page, cache, actions },
  options
) => {
  if (page.context.properties) return

  const { deletePage, createPage } = actions

  const content = await fs.readFile(page.component, `utf8`)
  const properties = metadata(content)
  console.log(properties)
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
