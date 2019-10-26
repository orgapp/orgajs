import React, { useContext } from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import Header from './header'
import Footer from './footer'
import { Global } from '@emotion/core'
import { ThemeProvider } from 'emotion-theming'
import { ThemeContext } from 'gatsby-plugin-themes'

export default ({ children, ...props }) => {

  const data = useStaticQuery(graphql`
query layoutQuery {
  site {
    siteMetadata { title author }
  }
}
`)

  const { theme, next } = useContext(ThemeContext)

  try {
    require(`prismjs/themes/prism-${theme.code}.css`)
  } catch {
    require(`prismjs/themes/prism.css`)
  }

  const { title, author } = data.site.siteMetadata
  return (
    <ThemeProvider theme={theme}>
      <Global styles={theme => ({
        body: {
          color: theme.color.text,
          background: theme.color.background,
        },
        a: {
          color: theme.color.primary,
          textDecoration: 'none',
          '&:hover': {
            color: theme.color.accent,
            textDecoration: 'none',
          },
        }
      })}/>
      <Header title={title} {...props}>
        <button onClick={() => next() }>switch</button>
      </Header>
      <main css={theme => ({
        maxWidth: theme.maxWidth,
        margin: '0 auto',
        padding: '2rem 1.5rem',
      })}>
        { children }
      </main>
      <Footer>
        <p>
          All materials &copy; <script>document.write(Date().getFullYear());</script>, {author}.
        </p>
      </Footer>
    </ThemeProvider>
  )
}
