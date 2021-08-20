import React from 'react'

export default ({ children, ...props }) => {
  return (
    <pre>
      <code {...props}>{children}</code>
    </pre>
  )
}
