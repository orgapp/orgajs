/** @jsxImportSource theme-ui */

const Layout = ({ children }) => {
  return (
    <div sx={{ bg: '#fdffff', color: '#233d5c' }}>
      <div
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          display: 'flex',
          justfiyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: 64,
          bg: '#233d5c',
          color: 'white',
        }}
      >
        <h1>This is a Special Layout</h1>
      </div>
      <main sx={{ pt: 64 }}>{children}</main>
    </div>
  )
}

export default Layout
