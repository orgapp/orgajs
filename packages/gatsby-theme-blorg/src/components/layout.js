import React from 'react'
import Header from './header'
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

export default ({ title, children }) => {
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
    </ThemeProvider>
  )
}
