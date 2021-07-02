/** @jsx jsx */
import { Link, PageProps } from 'gatsby'
import { get } from 'lodash'
import { Container, jsx } from 'theme-ui'
import Header from './header'
import Nav from './nav'

const HEADER_HEIGHT = '48px'

export default ({ children, pageContext }: PageProps) => {

  const title = get(pageContext, 'properties.title')

  return (
    <main sx={{
      display: 'grid',
      gridTemplateColumns: '250px 1fr',
      gridTemplateRows: `${HEADER_HEIGHT} 1fr`,
      alignContent: 'stretch',
      backgroundColor: 'background',
      width: '100vw',
      height: '100vh',
      gridTemplateAreas: `
      'nav header'
      'nav content'
      `,
    }}
    >
      <Header right={
        <Link to='/playground' sx={{
          border: '1px solid',
          borderColor: 'text',
          padding: '0.4em 0.6em',
          boxShadow: '3px 3px',
        }}>
          Playground
        </Link>
      }/>
      <Nav />
      <Container p={4} sx={{
        gridArea: 'content',
        height: '100%',
        overflow: 'auto',
      }}>
        {title && <h1 sx={{ fontSize: 6 }}>{title}</h1>}
        {children}
      </Container>
    </main>
  )
}

