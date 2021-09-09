/** @jsxImportSource theme-ui */

const Layout = ({ children, title }) => {
  return (
    <div sx={{ maxWidth: 700, mx: 'auto' }}>
      <h1>{title || 'Next + Orga'}</h1>
      <hr />
      {children}
    </div>
  )
}

export default Layout
