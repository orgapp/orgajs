import React, { useState } from 'react'

const playground = () => {

  const [text, setText] = useState('')

  return (
    <div style={{
      display: 'flex',
      alignItems: 'stretch',
      minHeight: '540px',
    }}>
      <textarea style={{
        width: '100%',
        margin: '1em',
        padding: '1em',
        backgroundColor: 'black',
        color: '#80ff7e',
      }} value={text} onChange={e => setText(e.target.value)}/>
      <div style={{
        width: '100%',
        margin: '1em',
      }}>rendered content</div>
    </div>
  )
}

export default playground
