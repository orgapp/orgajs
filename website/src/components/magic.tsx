import React from 'react'

const Magic = ({children}) => {
  const ambient = '#0af'
  return (
    <div style={{
      padding: '1em',
      backgroundColor: '#01010a',
      color: '#fff',
      textShadow: `
      0 0 7px #fff,
      0 0 10px #fff,
      0 0 21px #fff,
      0 0 42px ${ambient},
      0 0 82px ${ambient},
      0 0 92px ${ambient},
      0 0 102px ${ambient},
      0 0 151px ${ambient},
      `,
      textAlign: 'center',
      borderRadius: '0.4em',
    }}>
      {children}
    </div>
  )
}

export default Magic
