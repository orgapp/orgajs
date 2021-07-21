import { OrgaProvider } from '@orgajs/react'
import React from 'react'
import * as components from './dist/orga-components'

// TODO: process config


const WrapRootElement = ({ element }, options) => {

  // let wrapper = undefined

  // const { components } = options

  // const H1 = ({ children }) => <h1 style={{ color: 'gold' }}>{children}</h1>

  // const Layout = ({ children }) => <div style={{ backgroundColor: 'gray' }}>{children}</div>

  // const Info = ({ children }) => { return <div style={{ backgroundColor: 'blue', padding: '1em' }}>{children}</div> }

  // const customComponents = _.mapValues(components, c => loadable(() => import(c)))

  // console.log({ components })

  return (
    <OrgaProvider components={{ ...components }}>
      { element }
    </OrgaProvider>
  )
}

export default WrapRootElement
