import React from 'react'
import { Link } from 'gatsby'

export default ({ children }) => {
  return (
    <div>
      <Link to='/'>
        <pre>My Website</pre>
      </Link>
      <Link to='/blog'>
        <pre>Blog</pre>
      </Link>
      <main>
        { children }
      </main>
    </div>
  )
}
