import React from 'react'

export default ({ children, pageContext }) => {

  const { title } = pageContext.properties || {}

  return (
    <div style={{ backgroundColor: 'lime' }}>
      <h1 style={{ color: 'purple' }}>{title}</h1>
      {children}
    </div>
  )
}
