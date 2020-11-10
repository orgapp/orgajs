/** @jsx jsx */
import { Container, jsx, Styled } from 'theme-ui'
import { useSiteMetadata } from '../hooks'
import Header from './header'
import 'highlight.js/styles/nord.css'

const Layout = ({ children }) => {
  const { title } = useSiteMetadata()
  return (
    <Styled.root>
      <Container
        sx={{ p: 3, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        <Header title={title}/>
        <div sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto' }}>
          { children }
        </div>
      </Container>
    </Styled.root>
  )
}

export default Layout
