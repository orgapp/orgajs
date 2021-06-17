import { css } from '@emotion/react'
import { graphql, Link, useStaticQuery } from 'gatsby'
import Img from 'gatsby-image'
import _ from 'lodash'
import React from 'react'
import colors from './colors'

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
    <Link to={item.path} style={{ textDecoration: 'none' }}>
      <div key={`nav-${item.position}`} css={css`
        padding: 0.5em 0.5em 0.5em ${0.5 + 1 * item.indent}em;
        border-radius: 0.3em;
        &:hover {
          background-color: ${colors.highlight};
        }
    `}>
        {item.text}
      </div>
    </Link>
  )

  return (
    <nav style={{
      height: '100%',
      overflow: 'auto',
      gridArea: 'nav',
      borderRight: `1px solid ${colors.separator}`,
      backgroundColor: colors.surface,
    }}>
      <div style={{
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
