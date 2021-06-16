import { graphql, useStaticQuery } from 'gatsby'
import Img from 'gatsby-image'
import { range } from 'lodash'
import React from 'react'

const HEADER_HEIGHT = '48px'

const color = {
  background: '#ffffff',
  separator: '#e0e0e0',
  surface: '#f9f9f9',
}

export default ({ children, pageContext }) => {

  const { title } = pageContext.properties || {}

  const data = useStaticQuery(graphql`
  query {
    file(relativePath: {eq: "logo.png"}) {
      childImageSharp {
        fixed(width: 48, height: 48) {
          ...GatsbyImageSharpFixed
        }
      }
    }
  }`)

  const navItems = range(100).map(i => <li key={`nav-${i}`}>nav item {i}</li>)

  return (
    <main style={{
      display: 'grid',
      gridTemplateColumns: '250px 1fr',
      gridTemplateRows: `${HEADER_HEIGHT} 1fr`,
      alignContent: 'stretch',
      backgroundColor: color.background,
      height: '100%',
      gridTemplateAreas: `
      'nav header'
      'nav content'
      `,
    }}
    >
      <header style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: `1px solid ${color.separator}`,
        gridArea: 'header',
      }}>
      </header>
      <nav style={{
        height: '100%',
        overflow: 'auto',
        gridArea: 'nav',
        borderRight: `1px solid ${color.separator}`,
        backgroundColor: color.surface,
      }}>
        <div style={{
          display: 'flex',
          top: 0,
          alignItems: 'center',
          margin: '0 1em',
          gap: '1em',
        }}>
          <Img
            fixed={data.file.childImageSharp.fixed}
            style={{ borderRadius: '8px' }}
          />
          <h2>Orgajs</h2>
        </div>
        <ul>
          {navItems}
        </ul>
      </nav>
      <article style={{
        gridArea: 'content',
      }}>
        <h1>{title}</h1>
        {children}
      </article>
    </main>
  )
}
