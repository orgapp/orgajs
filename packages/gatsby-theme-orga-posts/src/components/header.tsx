/** @jsx jsx */
import { Link } from 'gatsby'
import { jsx, Text, useColorMode } from 'theme-ui'
import ThemeSwitch from './theme-switch'

// const rootPath = `${__PATH_PREFIX__}/`

export default ({ title }) => {
  return (
    <header
      sx={{
        '@media print': { display: 'none' },
        display: 'flex',
        py: 4,
        justifyContent: 'space-between',
      }}
    >
      <Link to="/">
        <Text
          sx={{
            px: 3,
            py: 1,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            border: '4px solid',
          }}
        >
          {title}
        </Text>
      </Link>
      <ThemeSwitch />
    </header>
  )
}
