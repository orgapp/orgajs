import { FC } from 'react'

const Layout: FC<{ title: string }> = ({ children, title }) => {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1>{title || 'Next + Orga'}</h1>
      <hr />
      {children}
    </div>
  )
}

export default Layout
