import React from 'react'
import { OrgaProvider } from '@orgajs/react'

// TODO: process config

const wrapRootElement = ({ element, props }) => {
  return (
    <OrgaProvider components={{}}>
      { element }
    </OrgaProvider>
  )
}

export default wrapRootElement
