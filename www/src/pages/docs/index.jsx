import React from 'react'
import Link from 'gatsby-link'
import style from './_style.module.scss'

class Index extends React.Component {
  render() {
    const posts = this.props.data.allOrga.edges
    const _posts = posts.map ( ({ node }) => {
      const title = node.meta.title || node.fields.slug
      return (
        <div>
          <h3 style={{ marginBottom: '0.2em' }}>
            <Link to={node.fields.slug}>{title}</Link>
          </h3>
        </div>
      )
    })
    return (
      <div className={style.container}>
        {_posts}
      </div>
    )
  }
}

export default Index

export const pageQuery = graphql`
  query IndexQuery {
    site {
      siteMetadata {
        title
      }
    }
    allOrga(sort: { fields: [meta___title], order: DESC }) {
      edges {
        node {
          fields {
            slug
          }
          meta {
            title
          }
        }
      }
    }
  }
`
