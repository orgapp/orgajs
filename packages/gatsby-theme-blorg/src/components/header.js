import React from 'react'
import { Link } from 'gatsby'

export default ({ children, title }) => {
  return (
    <header>
      <div css={theme => ({
        display: 'flex',
        maxWidth: theme.maxWidth,
        margin: '0 auto',
      })}>
        <h1>
          <Link to='/'>{ title }</Link>
        </h1>
        { children }
      </div>
    </header>
  )
}
