/** @jsx jsx */
import { Box, Flex, Grid, Heading, Text, jsx } from 'theme-ui'
import { Link } from 'gatsby'
import Bio from './bio'
import _ from 'lodash/fp'
import { useSiteMetadata } from '../hooks'
import Footer from './footer'
import Layout from './layout'
import SEO from "./seo"
import Tags from './tags'
import PostList from './post-list'

const rootPath = `${__PATH_PREFIX__}/`

export const Post = ({ id, date, title, category, tags, excerpt, fields: { slug } }) => {
  return (
    <Flex key={`p-${id}`} sx={{
      bg: 'surface',
      px: 3,
      py: 2,
      borderRadius: 6,
      flexDirection: 'column',
      justifyContent: 'space-between',
      transition: '0.3s',
      '&:hover': { bg: 'highlight' },
    }}>
      <Link href={`${slug}`}>
        <Box py={2}>
          <Text variant='caption' color='gray'>{ date }</Text>
          <Heading as='h1' color='primary'>{ title }</Heading>
          <Text color='text'>{ excerpt }</Text>
        </Box>
      </Link>
      <Tags tags={tags}/>
    </Flex>
  )
}

const PaginationLink = ({ url, children }) => {
  if (!url) return <div></div>
  return (
    <Link to={url}>{ children }</Link>
  )
}

export default ({ data, location, pageContext }) => {
  const { author } = useSiteMetadata()
  const posts = data.allOrgContent.nodes
  const category = location.pathname.replace(new RegExp(`^${rootPath}`), '')
  const keywords = _.flow(
    _.reduce((all, p) => [...all, p.category, ...(p.tags || [])], []),
    _.uniq,
    _.compact,
  )(posts)

  const { next, prev } = pageContext

  return (
    <Layout location={location}>
      <SEO title='Home' keywords={keywords} />
      <main sx={{ flex: 1 }}>
        <Bio/>
        { category && category.length > 0 && isNaN(category) && (
            <Heading sx={{
              pt: 4, pb: 2,
              textTransform: 'uppercase',
              textAlign: 'center',
              letterSpacing: '0.1em' }}>{ category }</Heading>
          )}
        <PostList posts={posts}/>
      </main>
      <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
        <PaginationLink url={prev}>
          ◄ more recent posts
        </PaginationLink>
        <PaginationLink url={next}>
          older posts ►
        </PaginationLink>
      </Flex>
      <Footer/>
    </Layout>
  )
}
