/** @jsxImportSource theme-ui */
import { graphql, Link, useStaticQuery } from 'gatsby'
import _ from 'lodash'
import { GatsbyImage } from 'gatsby-plugin-image'

export default ({ style, ...props }) => {
  const data = useStaticQuery(graphql`
    query {
      logo: file(relativePath: { eq: "logo.png" }) {
        childImageSharp {
          gatsbyImageData(layout: FIXED, width: 60)
        }
      }
      pages: allSitePage(
        filter: { context: { properties: { published: { eq: "true" } } } }
        sort: { fields: path }
      ) {
        nodes {
          path
          context {
            properties {
              title
              position
            }
          }
        }
      }
    }
  `)

  const positions = {}

  const items = data.pages.nodes.map((p) => {
    const parts = p.path.split('/').filter(Boolean)
    const parents = _.dropRight(parts)
    let position =
      (positions[parents.join('.')] || 0) +
      Number(p.context.properties.position)
    positions[parts.join('.')] = position

    return {
      text: p.context.properties.title || _.last(parts),
      path: p.path,
      indent: parts.length - 1,
      position,
    }
  })

  const navItems = _.sortBy(items, ['position']).map((item) => (
    <Link
      key={`nav-${item.position}`}
      to={item.path}
      activeClassName="active"
      sx={{
        padding: `0.5em 0.5em 0.5em ${0.5 + 1 * item.indent}em`,
        borderRadius: '0.3em',
        color: 'text',
        '&.active': {
          color: 'text',
          backgroundColor: 'highlight',
          fontWeight: 'bold',
        },
      }}
    >
      {item.text}
    </Link>
  ))

  return (
    <div sx={{}} {...props}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        <Link
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '1em',
            pb: '1em',
          }}
        >
          <GatsbyImage
            image={data.logo.childImageSharp.gatsbyImageData}
            alt="logo"
            style={{ borderRadius: '0.4em' }}
          />
          <h1>Orgajs</h1>
        </Link>
        {navItems}
      </div>
    </div>
  )
}
