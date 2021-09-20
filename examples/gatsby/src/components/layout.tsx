import React, { FC } from 'react'
import { PageProps } from 'gatsby'
import { get } from 'lodash'

const Layout: FC<PageProps & { title: string }> = ({
  data,
  children,
  title,
}) => {
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
        <small
          style={{
            color: 'gray',
            padding: 5,
          }}
        >
          ☝ these data is coming from the inline graphql query
        </small>
      </div>
      <main style={{ maxWidth: 700, margin: '0 auto' }}>
        <h1 style={{ color: 'gold' }}>{`${title}`}</h1>
        {children}
      </main>
    </div>
  )
}

export default Layout
