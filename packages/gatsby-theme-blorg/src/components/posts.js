import React from 'react'
import { Link } from 'gatsby'
import Layout from './layout'
import Footer from './footer'
import { useSiteMetadata } from '../hooks'

const Post = ({ title, slug, description }) => (
  <div key={slug}>
    <h2>
      <Link to={slug} css={theme => ({
        color: 'inherit',
        '&:hover': {
          color: theme.color.primary,
        },
      })}>
        { title }
      </Link>
    </h2>
    <p>{ description }</p>
  </div>
)

const PaginationLink = ({ url, children }) => {
  if (!url) return <div></div>
  return (
    <Link to={url}>{ children }</Link>
  )
}

export default ({ posts, prev, next, location }) => {
  const { author } = useSiteMetadata()
  return (
    <Layout location={location}>
      <main>
        { posts.map(Post) }
      </main>
      <div css={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '3em 1em 0 1em',
      }}>
        <PaginationLink url={prev}>
          ◄ more recent
        </PaginationLink>
        <PaginationLink url={next}>
          older ►
        </PaginationLink>
      </div>
      <Footer>
        © {new Date().getFullYear()} {author}
      </Footer>
    </Layout>
  )
}
