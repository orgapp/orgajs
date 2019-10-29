import React, { useContext } from 'react'
import Header from './header'
import { Global } from '@emotion/core'
import { ThemeProvider } from 'emotion-theming'
import { ThemeContext } from 'gatsby-plugin-themes'
import { useSiteMetadata } from '../hooks'
import { FaAdjust } from 'react-icons/fa'
import { likeButton } from '../utils/styles'

export default ({ children, ...props }) => {

  const { theme, next } = useContext(ThemeContext)

  try {
    require(`prismjs/themes/prism-${theme.code}.css`)
  } catch {
    require(`prismjs/themes/prism.css`)
  }

  const { title } = useSiteMetadata()
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
            color: theme.color.secondary,
            textDecoration: 'none',
          },
        }
      })}/>
      <Header title={title} {...props}>
        <button
          css={likeButton}
          onClick={() => next() }>
          <FaAdjust/>
        </button>
      </Header>
      <main css={theme => ({
        maxWidth: theme.maxWidth,
        margin: '0 auto',
        padding: '2rem 1.5rem',
      })}>
        { children }
      </main>
    </ThemeProvider>
  )
}
