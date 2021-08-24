/** @jsxImportSource theme-ui */
import { get } from 'lodash'
import { Link } from 'gatsby'
import { NavLink } from 'theme-ui'
import SEO from 'gatsby-theme-orga-docs/src/components/seo'

export default ({ children, pageContext }) => {
  const title = get(pageContext, 'properties.title')

  const bar = (
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
        }}
      >
        <h1
          sx={{
            fontSize: 6,
            textAlign: 'center',
          }}
        >
          {title}
        </h1>
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
            {[...Array(5)].map(() => bar)}
          </div>
        </div>
      </footer>
    </>
  )
}
