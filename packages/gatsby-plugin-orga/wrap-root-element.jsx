import { OrgaProvider } from '@orgajs/react'
import React, { ReactNode } from 'react'
import Link from './dist/components/link'
import * as components from './dist/orga-components'

const WrapRootElement = ({ element }) => {
  // TODO: process config

  return (
    <OrgaProvider
      components={{
        a: Link,
        ...components,
      }}
    >
      {element}
    </OrgaProvider>
  )
}

WrapRootElement.propTypes = {
  element: ReactNode,
}

export default WrapRootElement
