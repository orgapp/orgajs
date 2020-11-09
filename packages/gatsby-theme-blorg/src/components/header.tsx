/** @jsx jsx */
import { Link } from 'gatsby'
import { jsx, Text } from 'theme-ui'

// const rootPath = `${__PATH_PREFIX__}/`

export default ({ children, title }) => {
  return (
    <header sx={{
      '@media print': { display: 'none' },
      display: 'flex',
      py: 4,
      // bg: 'red',
      justifyContent: 'space-between',
    }}>
      <Link to='/'>
        <Text sx={{
          px: 3, py: 1,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          border: '4px solid',
        }}>{ title }</Text>
      </Link>
      {/* <div sx={theme => ({ */}
      {/*   maxWidth: theme.maxWidth, */}
      {/*   margin: '0 auto', */}
      {/*   padding: '2em 1.5rem', */}
      {/* })}> */}
      {/*   <div sx={{ */}
      {/*     display: 'flex', */}
      {/*     justifyContent: 'space-between', */}
      {/*     alignItems: 'center', */}
      {/*     paddingBottom: '1em', */}
      {/*   }}> */}
      {/*     <Heading>{ title }</Heading> */}
      {/*     { children } */}
      {/*   </div> */}
      {/*   {_.get('location.pathname')(props) === rootPath && <Bio />} */}
      {/* </div> */}
    </header>
  )
}
