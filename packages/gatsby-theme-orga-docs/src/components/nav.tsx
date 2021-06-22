/** @jsx jsx */
import { jsx } from 'theme-ui'
import { graphql, Link, useStaticQuery } from 'gatsby'
import Img from 'gatsby-image'
import _ from 'lodash'
import React from 'react'

const Nav = () => {

  const data = useStaticQuery(graphql`
  query {
    logo: file(relativePath: {eq: "logo.png"}) {
      childImageSharp {
        fixed(width: 48, height: 48) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    pages: allSitePage(
      filter: {context: {properties: {published: {eq: "true"}}}}
      sort: {fields: path}
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
  }`)

  const positions = {}

  const items = data.pages.nodes.map((p) => {
    const parts = p.path.split('/').filter(Boolean)
    const parents = _.dropRight(parts)
    let position = (positions[parents.join('.')] || 0) + Number(p.context.properties.position)
    positions[parts.join('.')] = position

    return {
      text: p.context.properties.title || _.last(parts),
      path: p.path,
      indent: parts.length - 1,
      position,
    }
  })

  const navItems = _.sortBy(items, ['position']).map(item =>
    <Link
      key={`nav-${item.position}`}
      to={item.path}
      sx={{
        textDecoration: 'none'
      }}
    >
      <div sx={{
        padding: `0.5em 0.5em 0.5em ${0.5 + 1 * item.indent}em`,
        borderRadius: '0.3em',
        color: 'primary',
        '&:hover': {
          backgroundColor: 'highlight',
        }
      }}>
        {item.text}
      </div>
    </Link>
  )

  return (
    <nav sx={{
      height: '100%',
      overflow: 'auto',
      gridArea: 'nav',
      borderRight: `1px solid`,
      borderColor: `muted`,
      backgroundColor: 'surface',
    }}>
      <div sx={{
        display: 'flex',
        top: 0,
        alignItems: 'center',
        margin: '0 1em',
        gap: '1em',
      }}>
        <Img
          fixed={data.logo.childImageSharp.fixed}
          style={{ borderRadius: '8px' }}
        />
        <h2>Orgajs</h2>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        margin: '1em',
      }}>
        {navItems}
      </div>
    </nav>
  )
}

export default Nav
