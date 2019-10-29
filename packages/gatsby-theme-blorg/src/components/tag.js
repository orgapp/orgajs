import React from 'react'
import { Link } from 'gatsby'

export default ({ children, ...props }) => {
  return (
    <Link css={theme => ({
      backgroundColor: 'green',
    })} {...props}>
      { children }
    </Link>
  )
}
