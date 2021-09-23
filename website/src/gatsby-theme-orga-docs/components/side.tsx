/** @jsx jsx */
import { graphql, Link, useStaticQuery } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import _ from 'lodash'
import React from 'react'
import { jsx, Box, Heading } from 'theme-ui'

const Side: React.FC = (props) => {
  const data = useStaticQuery(graphql`
    query {
      logo: file(relativePath: { eq: "logo.png" }) {
        childImageSharp {
          gatsbyImageData(layout: FIXED, width: 60)
        }
      }
      pages: allSitePage(
        filter: { context: { metadata: { published: { eq: "true" } } } }
        sort: { fields: path }
      ) {
        nodes {
          path
          context {
            metadata {
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
    const position =
      (positions[parents.join('.')] || 0) + Number(p.context.metadata.position)
    positions[parts.join('.')] = position

    return {
      text: p.context.metadata.title || _.last(parts),
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
        textDecoration: 'none',
      }}
    >
      {item.text}
    </Link>
  ))

  return (
    <Box {...props}>
      <Box
        sx={{
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
            textDecoration: 'none',
          }}
        >
          <GatsbyImage
            image={data.logo.childImageSharp.gatsbyImageData}
            alt="logo"
            style={{ borderRadius: '0.4em' }}
          />
          <Heading>Orgajs</Heading>
        </Link>
        {navItems}
      </Box>
    </Box>
  )
}

export default Side
