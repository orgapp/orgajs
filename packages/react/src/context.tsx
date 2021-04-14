/* @jsx React.createElement */
/* @jsxFrag React.Fragment */
import React from 'react'
import { ComponentDictionary, ComponentsProp } from './types'

const isFunction = obj => typeof obj === 'function'

const OrgaContext = React.createContext<ComponentsProp>({})

export const useOrgaComponents = (
  components: ComponentDictionary | ((props: ComponentsProp) => ComponentDictionary)
) => {
  const contextComponents = React.useContext(OrgaContext)

  // Custom merge via a function prop
  if (typeof components === 'function') {
    return components(contextComponents)
  }

  return { ...contextComponents, ...components }
}

export const OrgaProvider = ({ components, children }) => {
  const allComponents = useOrgaComponents(components)

  return (
    <OrgaContext.Provider value={allComponents}>{children}</OrgaContext.Provider>
  )
}

export default OrgaContext
