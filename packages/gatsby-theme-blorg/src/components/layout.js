import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import Header from './header'
import Footer from './footer'
import { Global } from '@emotion/core'
import { ThemeProvider } from 'emotion-theming'

const theme = {
  color: {
    text: '#000',
    background: '#fff',
    primary: '#07c',
    secondary: '#05a',
    accent: '#609',
    muted: '#f6f6f6f',
  },
  maxWidth: 700,
}

export default ({ children }) => {

  const data = useStaticQuery(graphql`
query layoutQuery {
  site {
    siteMetadata { title author }
  }
}
`)

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
          '&:hover': {
            color: theme.color.accent,
          },
        }
      })}/>
      <Header title={title}/>
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
