/** @jsx jsx */
import { ReactChild } from 'react'
import { Container, jsx, Themed } from 'theme-ui'
import { useSiteMetadata } from '../hooks'
import Footer from './footer'
import Header from './header'

type NamedChildrenSlots = {
  header?: ReactChild
  footer?: ReactChild
  body: ReactChild
}

const isNamedSlots = (children: any): children is NamedChildrenSlots =>
  typeof children === 'object' && 'body' in children

const Layout = ({ children }) => {
  const { title } = useSiteMetadata()

  let header: ReactChild = <Header title={title} />
  let footer: ReactChild = <Footer />
  let body = children

  if (isNamedSlots(children)) {
    header = children.header || header
    footer = children.footer || footer
    body = children.body
  }
  return (
    <Themed.root>
      <Container
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          maxWidth: 900,
        }}
      >
        {header}
        <div
          sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto' }}
        >
          {body}
        </div>
        {footer}
      </Container>
    </Themed.root>
  )
}

export default Layout
