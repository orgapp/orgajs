import React from 'react'

const Box = ({ children }) => (
  <div
    style={{
      padding: 20,
      backgroundColor: 'tomato',
      color: 'white',
    }}
  >
    {children}
  </div>
)

export default Box
