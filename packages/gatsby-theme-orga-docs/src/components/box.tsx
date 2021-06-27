import React from 'react'

const Box = ({ children }) => {
  return (
    <div style={{
      backgroundColor: 'gold',
      padding: '1em',
      borderRadius: '0.4em',
      boxShadow: '4px 4px',
      border: '2px solid black',
    }}>
      {children}
    </div>
  )
}

export default Box
