import { createContext, createElement, useContext, useMemo } from 'react'
import type { OrgaComponents as Components } from '@orgajs/orgx'

const OrgaContext = createContext<Components>({})

type MergeComponents = (components: Components) => Components

type Props = {
  components: Components | MergeComponents | null | undefined
  children: React.ReactNode | null | undefined
  disableParentContext?: boolean
}

export const useOrgaComponents = (
  components: Components | MergeComponents | null | undefined
) => {
  const contextComponents = useContext(OrgaContext)

  return useMemo(() => {
    // Custom merge via a function prop
    if (typeof components === 'function') {
      return components(contextComponents)
    }

    return { ...contextComponents, ...components }
  }, [])
}

const emptyObject: Components = {}

export const OrgaProvider = ({
  components,
  children,
  disableParentContext = false,
}: Props) => {
  let allComponents: Components
  if (disableParentContext) {
    allComponents =
      typeof components === 'function'
        ? components({})
        : components || emptyObject
  } else {
    allComponents = useOrgaComponents(components)
  }

  return createElement(
    OrgaContext.Provider,
    {
      value: allComponents,
    },
    children
  )
}
