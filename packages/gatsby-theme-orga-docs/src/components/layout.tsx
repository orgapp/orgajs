/** @jsx jsx */
import { jsx, Container } from 'theme-ui'
import { Link, PageProps } from 'gatsby'
import Nav from './nav'
import { get } from 'lodash'
import Header from './header'

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
      height: '100%',
      gridTemplateAreas: `
      'nav header'
      'nav content'
      `,
    }}
    >
      <Header right={
        <Link to='/playground'>
          Playground
        </Link>
      }/>
      <Nav />
      <Container p={4} sx={{
        gridArea: 'content',
      }}>
        {title && <h1 sx={{ fontSize: 6 }}>{title}</h1>}
        {children}
      </Container>
    </main>
  )
}

