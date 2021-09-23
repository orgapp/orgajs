import { OrgaProvider } from '@orgajs/react'
import React from 'react'
import * as components from './dist/orga-components'

const WrapRootElement = ({ element }) => {
  // TODO: process config

  return (
    <OrgaProvider
      components={{
        ...components,
      }}
    >
      {element}
    </OrgaProvider>
  )
}

WrapRootElement.propTypes = {
  element: React.ReactNode,
}

export default WrapRootElement
