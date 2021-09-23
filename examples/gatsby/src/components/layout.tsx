import React, { FC } from 'react'
import { PageProps, useStaticQuery, graphql } from 'gatsby'
import { get } from 'lodash'

const Layout: FC<PageProps & { title: string }> = ({ children, title }) => {
  const data = useStaticQuery(graphql`
    query SiteQuery {
      site {
        siteMetadata {
          title
          description
        }
      }
    }
  `)

  const siteTitle = get(data, 'site.siteMetadata.title', 'untitled')
  const description = get(data, 'site.siteMetadata.description', '')

  return (
    <div
      style={{
        fontFamily: '-apple-system, Roboto, sans-serif, serif',
      }}
    >
      <div
        style={{
          padding: '1em',
          borderBottom: '1px solid #c9c8c8',
          textAlign: 'center',
        }}
      >
        <h1>{siteTitle}</h1>
        <p>{description}</p>
      </div>
      <main style={{ maxWidth: 700, margin: '0 auto' }}>
        <h1 style={{ color: 'purple' }}>{`${title}`}</h1>
        {children}
      </main>
    </div>
  )
}

export default Layout
