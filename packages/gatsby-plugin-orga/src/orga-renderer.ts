import React, { useMemo } from 'react'
import { orga } from '@orgajs/react'

function OrgaRenderer({
  children,
  ...props
}) {

  const End = useMemo(() => {

    if (!children) return null

    const fullScope = {
      React,
      orga,
    }

    const keys = Object.keys(fullScope)
    const values = keys.map(key => fullScope[key])

    const fn = new Function('_fn', ...keys, `${children}`)
    return fn({}, ...values)
  }, [children])

  return React.createElement(End, { ...props })
}

export default OrgaRenderer
