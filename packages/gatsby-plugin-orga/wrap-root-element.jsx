import { OrgaProvider } from '@orgajs/react'
import React from 'react'

// TODO: process config

const wrapRootElement = ({ element, props }) => {
  return (
    <OrgaProvider components={{}}>
      { element }
    </OrgaProvider>
  )
}

export default wrapRootElement
