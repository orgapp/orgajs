/** @jsxImportSource theme-ui */
import { Link } from 'gatsby'
import SEO from 'gatsby-theme-orga-docs/src/components/seo'
import { get } from 'lodash'
import { Flex, Heading, NavLink, Paragraph, Text } from 'theme-ui'
import Banner from './banner'

export default ({ children, pageContext }) => {
  const title = get(pageContext, 'properties.title')
  const subtitle = get(pageContext, 'properties.subtitle')

  const Bar = (props) => (
    <div
      sx={{
        width: 16,
        height: 100,
        background: '#808080',
        border: '2px solid #656565',
        borderRadius: '6px',
        margin: '0 0.4em',
        boxShadow: 'inset 5px 5px 10px #000000',
      }}
      {...props}
    ></div>
  )

  return (
    <>
      <SEO />
      <main
        sx={{
          maxWidth: 768,
          mx: 'auto',
          px: '1em',
          pb: '6em',
        }}
      >
        <Banner sx={{ py: '1em' }}>
          <Heading sx={{ fontFamily: 'Game Boy' }}>{title}</Heading>
          <Paragraph sx={{ fontFamily: 'Game Boy' }}>{subtitle}</Paragraph>
        </Banner>
        <Flex as="nav" sx={{ gap: '1em', py: 2 }}>
          <NavLink as={Link} to="/getting-started/">
            Documentation
          </NavLink>
          <NavLink as={Link} to="/playground/">
            Playground
          </NavLink>
          <NavLink href="https://github.com/orgapp/orgajs">GitHub</NavLink>
        </Flex>
        {children}
      </main>
      <footer
        sx={{
          padding: '4em',
          bg: '#c4bfbc',
        }}
      >
        <div
          sx={{
            display: 'flex',
            mx: 'auto',
            maxWidth: 768,
          }}
        >
          <div
            sx={{
              display: 'flex',
              flexGrow: 1,
              flexDirection: 'column',
              gap: '1em',
            }}
          >
            <NavLink as={Link} to="/getting-started/">
              Documentation
            </NavLink>
            <NavLink as={Link} to="/playground/">
              Playground
            </NavLink>
            <NavLink href="https://github.com/orgapp/orgajs">GitHub</NavLink>
          </div>
          <div
            sx={{
              display: 'flex',
              transform: 'rotate(-20deg)',
            }}
          >
            {[...Array(5)].map((_, i) => (
              <Bar key={`bar-${i}`} />
            ))}
          </div>
        </div>
      </footer>
    </>
  )
}
