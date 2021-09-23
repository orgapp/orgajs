import React from 'react'

const Box = (props) => (
  <div
    style={{
      padding: 20,
      backgroundColor: 'tomato',
      color: 'white',
    }}
    {...props}
  />
)

export default Box
