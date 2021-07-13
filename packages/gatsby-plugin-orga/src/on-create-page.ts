import { GatsbyNode } from "gatsby"
import * as fs from 'fs-extra'
import { compile } from './orga'
import { inspect } from 'util'
import * as _ from 'lodash/fp'

const onCreatePage: GatsbyNode['onCreatePage'] = async ({
  page, cache, actions,
}, options) => {
  if (page.context.properties) return

  const { deletePage, createPage } = actions

  const content = await fs.readFile(page.component, `utf8`)
  const { code, imports, properties } = await compile({ content, cache })
  deletePage(page)
  createPage({
    ...page,
    context: {
      ...page.context,
      properties,
    }
  })
  // console.log(inspect(properties, false, null, true))
}

export default onCreatePage
