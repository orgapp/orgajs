/** @jsxImportSource theme-ui */

const Layout = ({ children }) => {
  return (
    <div sx={{ maxWidth: 700, mx: 'auto' }}>
      <h1>Next + Orga</h1>
      <hr />
      {children}
    </div>
  )
}

export default Layout
