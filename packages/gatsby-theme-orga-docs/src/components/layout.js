/** @jsx jsx */
import { jsx, Button, Container } from 'theme-ui'
import Nav from './nav'

const HEADER_HEIGHT = '48px'

export default ({ children, pageContext }) => {

  const { title } = pageContext.properties || {};

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
      <header sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderBottom: `1px solid`,
        borderColor: `muted`,
        gridArea: 'header',
        marginX: '1em',
      }}>
        <Button>Playground</Button>
      </header>
      <Nav />
      <Container p={4} sx={{
        gridArea: 'content',
      }}>
        <h1>{title}</h1>
        {children}
      </Container>
    </main>
  )
}

