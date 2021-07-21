import React, { ComponentType } from 'react'
import { useOrgaComponents } from './context'
import { ComponentDictionary } from './types'

const TYPE_PROP_NAME = 'orgaType'

interface OrgaPropsType {
  children?: React.ReactNode;
  parentName: string;
  orgaType: string;
  originalType: string;
  components?: ComponentDictionary;
}

const DEFAULTS = {
  inlineCode: 'code',
  wrapper: ({ children }) => React.createElement(React.Fragment, {}, children),
}


const OrgaCreateElement = React.forwardRef<ComponentType, OrgaPropsType>((props, ref) => {
  const {
    components: propComponents,
    parentName,
    orgaType,
    originalType,
    ...etc
  } = props

  const type = orgaType

  const components = useOrgaComponents(propComponents)

  const Component =
    components[`${parentName}.${type}`] ||
    components[type] ||
    DEFAULTS[type] ||
    originalType

  return React.createElement(Component, { ref, ...etc })
})

OrgaCreateElement.displayName = 'OrgaCreateElement'

type CreateOrgaElement = typeof React.createElement & {
  Fragment: typeof React.Fragment
}

function orga(...args) {
  const [type, props] = args
  const orgaType = props && props.orgaType
  if (typeof type === 'string' || orgaType) {
    const argsLength = args.length

    const createElementArgArray = new Array(argsLength)
    createElementArgArray[0] = OrgaCreateElement

    const newProps: any = {}
    for (const key in props) {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        newProps[key] = props[key]
      }
    }

    newProps.originalType = type
    newProps[TYPE_PROP_NAME] = typeof type === 'string' ? type : orgaType

    createElementArgArray[1] = newProps

    for (let i = 2; i < argsLength; i++) {
      createElementArgArray[i] = args[i]
    }

    return React.createElement.apply(null, createElementArgArray)
  }
  return React.createElement.apply(null, args)
}

orga.Fragment = React.Fragment

export default orga
