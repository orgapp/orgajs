/** @jsx jsx */
import { PageProps, useStaticQuery, graphql } from 'gatsby'
import { get } from 'lodash'
import type { FC } from 'react'
import {
  jsx,
  useColorMode,
  Box,
  Flex,
  Themed,
  Button,
  Heading,
  Text,
} from 'theme-ui'

interface Props extends PageProps {
  title: string
  description: string
  data: any
}

const Layout: FC<Props> = ({ children, title }) => {
  const data = useStaticQuery(graphql`
    query HomePageQuery {
      site {
        siteMetadata {
          title
          description
        }
      }
    }
  `)

  const siteTitle = get(data, 'site.siteMetadata.title', 'untitled')
  const description = get(data, 'site.siteMetadata.description', '')

  const [colorMode, setColorMode] = useColorMode()

  return (
    <Box>
      <Flex
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          bg: 'highlight',
          p: '1em',
          borderBottom: '1px solid #c9c8c8',
          textAlign: 'center',
        }}
      >
        <Box>
          <Heading>{siteTitle}</Heading>
          <Text sx={{ color: 'gray' }}>{description}</Text>
        </Box>
        <Button
          onClick={() => setColorMode(colorMode === 'light' ? 'dark' : 'light')}
        >
          Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
        </Button>
      </Flex>
      <main sx={{ maxWidth: 700, mx: 'auto' }}>
        <Themed.h1 sx={{ color: 'accent' }}>{`${title}`}</Themed.h1>
        {children}
      </main>
    </Box>
  )
}

export default Layout
