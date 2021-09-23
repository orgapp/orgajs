import { FC } from 'react'

const Layout: FC = ({ children }) => {
  return (
    <div style={{ background: '#fdffff', color: '#233d5c' }}>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          display: 'flex',
          justfiyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: 64,
          backgroundColor: '#233d5c',
          color: 'white',
        }}
      >
        <h1>This is a Special Layout</h1>
      </div>
      <main style={{ paddingTop: 64 }}>{children}</main>
    </div>
  )
}

export default Layout
