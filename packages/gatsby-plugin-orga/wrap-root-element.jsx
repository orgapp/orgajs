import { OrgaProvider } from '@orgajs/react'
import React from 'react'

// TODO: process config


const wrapRootElement = ({ element }, options) => {

  let wrapper = undefined

  const H1 = ({ children }) => <h1 style={{ color: 'gold' }}>{children}</h1>

  const Layout = ({ children }) => <div style={{ backgroundColor: 'gray' }}>{children}</div>

  return (
    <OrgaProvider components={{ h1: H1, wrapper: Layout }}>
      { element }
    </OrgaProvider>
  )
}

export default wrapRootElement
