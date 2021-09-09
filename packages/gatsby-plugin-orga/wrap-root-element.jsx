import { OrgaProvider } from '@orgajs/react'
import React from 'react'
import * as components from './dist/orga-components'

const WrapRootElement = ({ element }, options) => {
  // TODO: process config
  return <OrgaProvider components={{ ...components }}>{element}</OrgaProvider>
}

export default WrapRootElement
