/**
 * @typedef {import('react').ReactNode} ReactNode
 * @typedef {import('@orgajs/orgx').OrgComponents} Components
 *
 * @typedef Props
 *   Configuration.
 * @property {Components | MergeComponents | null | undefined} [components]
 *   Mapping of names for JSX components to React components.
 * @property {boolean | null | undefined} [disableParentContext=false]
 *   Turn off outer component context.
 * @property {ReactNode | null | undefined} [children]
 *   Children.
 *
 * @callback MergeComponents
 *   Custom merge function.
 * @param {Components} currentComponents
 *   Current components from the context.
 * @returns {Components}
 *   Merged components.
 */

import React from 'react'

/** @type {import('react').Context<Components>} */
const OrgContext = React.createContext({})

/**
 * Get current components from the org context.
 *
 * @param {Components | MergeComponents | null | undefined} [components]
 *   Additional components to use or a function that takes the current
 *   components and filters/merges/changes them.
 * @returns {Components}
 *   Current components.
 */
export function useOrgComponents(components) {
  const contextComponents = React.useContext(OrgContext)

  // Memoize to avoid unnecessary top-level context changes
  return React.useMemo(() => {
    // Custom merge via a function prop
    if (typeof components === 'function') {
      return components(contextComponents)
    }

    return { ...contextComponents, ...components }
  }, [contextComponents, components])
}

/** @type {Components} */
const emptyObject = {}

/**
 * Provider for org context
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
export function OrgProvider({ components, children, disableParentContext }) {
  /** @type {Components} */
  let allComponents

  if (disableParentContext) {
    allComponents =
      typeof components === 'function'
        ? components({})
        : components || emptyObject
  } else {
    allComponents = useOrgComponents(components)
  }

  return React.createElement(
    OrgContext.Provider,
    { value: allComponents },
    children
  )
}
