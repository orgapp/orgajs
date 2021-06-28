import React from 'react'

const Box = ({ children }) => {
  return (
    <div style={{
      backgroundColor: '#fae592',
      padding: '1em',
      borderRadius: '0.4em',
      boxShadow: '3px 3px',
      border: '2px solid black',
    }}>
      {children}
    </div>
  )
}

export default Box
