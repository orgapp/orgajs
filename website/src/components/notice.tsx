/** @jsx jsx */
import { jsx } from 'theme-ui'
import React from 'react'

const Notice = ({ children }) => {
  return (
    <div sx={{
      backgroundColor: 'accent',
      padding: '1em',
      borderRadius: '0.4em',
      boxShadow: '3px 3px',
      border: '2px solid black',
      textAlign: 'center',
      fontWeight: 'bold',
    }}>
      {children}
    </div>
  )
}

export default Notice
