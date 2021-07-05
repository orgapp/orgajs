import React from 'react'
import { Link } from 'gatsby'

export default () => {

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1em',
    }}>
      <Link to='/playground' style={{
        padding: '0.4em 0.6em',
        margin: '0.4em 0',
        borderColor: 'primary',
        borderWidth: '1px',
        borderStyle: 'solid',
        boxShadow: '3px 3px',
      }}>
        Playground
      </Link>
    </div>
  )
}
