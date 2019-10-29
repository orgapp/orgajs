import React from 'react'
import { Link } from 'gatsby'
import Layout from './layout'
import Footer from './footer'
import { useSiteMetadata } from '../hooks'
import Tag from './tag'

const Post = ({ title, date, category, slug, description }) => (
  <div key={slug}>
    <div css={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center' }}>
      <time css={theme => ({ color: theme.color.gray })}>
        <small>{ date }</small>
      </time>
      <Tag to={`/${category}`}>{ category }</Tag>
    </div>
    <h2 css={{ marginBottom: '.1em' }}>
      <Link to={slug} css={theme => ({
        color: 'inherit',
        '&:hover': {
          color: theme.color.primary,
        },
      })}>
        { title }
      </Link>
    </h2>
    <p css={theme => ({
      color: theme.color.gray,
    })}>{ description }</p>
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
