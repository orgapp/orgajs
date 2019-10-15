import React from 'react'
import { Link } from 'gatsby'
import Layout from '../../components/layout'

const Post = ({ fields, metadata }) => (
  <div key={fields.slug}>
    <Link to={fields.slug}>
      { metadata.title }
    </Link>
  </div>
)

const PaginationLink = ({ url, children }) => {
  if (!url) return null
  return (
    <Link to={url}>{ children }</Link>
  )
}

export default ({ posts, prev, next }) => {
  return (
    <Layout>
      <div>
        { posts.map(Post) }
      </div>
      <div style={{ display: 'flex' }}>
        <PaginationLink url={prev}>
          ◄ See more recent notes
        </PaginationLink>
        <PaginationLink url={next}>
          See older notes ►
        </PaginationLink>
      </div>
    </Layout>
  )
}
