/** @jsx jsx */
import { jsx } from 'theme-ui'
import React from 'react'

const Notice: React.FC = ({ children }) => {
  return (
    <div
      sx={{
        backgroundColor: 'secondary',
        padding: '1em',
        borderRadius: '0.4em',
        boxShadow: '3px 3px',
        border: '2px solid black',
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'background',
      }}
    >
      {children}
    </div>
  )
}

export default Notice
