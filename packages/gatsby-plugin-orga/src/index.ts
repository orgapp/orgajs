import React, { useMemo } from 'react'

export function OrgaRenderer({
  children,
  ...props
}) {
  const End = useMemo(() => {
    const fn = new Function('_fn', `${children}`)
    return fn({})
  }, [children])
  return React.createElement(End, { ...props })
  // return server.renderToStaticMarkup(children)
}
