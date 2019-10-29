import React from 'react'

export default ({ children, ...props }) => (
  <button {...props} css={theme => ({
    textAlign: 'center',
    padding: '.2em 1.5em',
    color: theme.color.primary,
    border: 'none',
    backgroundColor: 'inherit',
    textDecoration: 'none',
    display: 'inline-block',
    cursor: 'pointer',
    '&:hover': {
      color: theme.color.secondary,
    },
    '&:focus': {
      outline: 0,
    },
  })}>
    { children }
  </button>
)
