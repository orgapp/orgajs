/** @jsxImportSource theme-ui */
import { Themed, Box, Button, useColorMode } from 'theme-ui'
import type { FC } from 'react'

const Layout: FC<{ title: string }> = ({ children, title }) => {
  const [colorMode, setColorMode] = useColorMode()
  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <header
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Themed.h1>{title || 'Next + Orga'}</Themed.h1>
        <Button
          onClick={() => setColorMode(colorMode === 'light' ? 'dark' : 'light')}
        >
          Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
        </Button>
      </header>
      <hr />
      {children}
    </Box>
  )
}

export default Layout
