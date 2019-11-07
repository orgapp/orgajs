import React, { useContext } from 'react'
import Header from './header'
import { Global, css } from '@emotion/core'
import { ThemeProvider } from 'emotion-theming'
import { ThemeContext } from 'gatsby-plugin-themes'
import { getLuminance } from 'polished'
import { useSiteMetadata } from '../hooks'
import { FaAdjust } from 'react-icons/fa'
import { likeButton, tinted } from '../utils/styles'
import { light, dark } from '../utils/prism-themes'

export default ({ children, ...props }) => {

  const { theme, next } = useContext(ThemeContext)

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
        },
        'tt,code,pre': {
          ...tinted()(theme),
        },
      })}/>
      <Global styles={css(getLuminance(theme.color.background) > 0.179 ? light : dark)}/>
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
        padding: '0 1.5em 2em',
      })}>
        { children }
      </main>
    </ThemeProvider>
  )
}
