import React from 'react'
import { get } from 'lodash'

const Layout = ({ data, children, pageContext }) => {

  const siteTitle = get(data ,'site.siteMetadata.title', 'untitled')
  const description = get(data, 'site.siteMetadata.description', '')
  const { title } = pageContext.properties

  return (
    <div style={{
      fontFamily: "-apple-system, Roboto, sans-serif, serif",
    }}>
      <div style={{
        padding: '1em',
        borderBottom: '1px solid #c9c8c8',
        textAlign: 'center',
      }}>
        <h1>{siteTitle}</h1>
        <small>{description}</small>
      </div>
      <h1 style={{ color: 'gold' }}>{`${title}`}</h1>
      {children}
    </div>
  )
}

export default Layout
