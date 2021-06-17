import React from 'react'
import colors from './colors'
import Nav from './nav'

const HEADER_HEIGHT = '48px'

export default ({ children, pageContext }) => {

  const { title } = pageContext.properties || {}


  return (
    <main style={{
      display: 'grid',
      gridTemplateColumns: '250px 1fr',
      gridTemplateRows: `${HEADER_HEIGHT} 1fr`,
      alignContent: 'stretch',
      backgroundColor: colors.background,
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
        borderBottom: `1px solid ${colors.separator}`,
        gridArea: 'header',
      }}>
      </header>
      <Nav />
      <article style={{
        gridArea: 'content',
      }}>
        <h1>{title}</h1>
        {children}
      </article>
    </main>
  )
}
