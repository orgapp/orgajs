import React from 'react'
import { Link } from 'gatsby'
import Bio from "./bio"

const rootPath = `${__PATH_PREFIX__}/`

export default ({ children, title, ...props }) => {
  console.log(props)
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
        {props.location.pathname === rootPath && <Bio />}
      </div>
    </header>
  )
}
