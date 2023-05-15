import { FC, ReactNode } from 'react'

function Layout({ children, title }: { title: string; children: ReactNode }) {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1>{title || 'Next + Orga'}</h1>
      <hr />
      {children}
    </div>
  )
}

export default Layout
