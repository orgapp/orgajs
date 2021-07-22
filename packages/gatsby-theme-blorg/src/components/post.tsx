/** @jsx jsx */
import { Link } from 'gatsby'
import { Box, Container, Divider, Flex, jsx, Text } from 'theme-ui'
import Bio from './bio'
import HTML from './html'
import Layout from './layout'
import PostMeta from './post-meta'
import PostHero from './post-hero'
import PostShare from './post-share'
import PostTitle from './post-title'
import { FaTags as TagsIcon } from 'react-icons/fa'
import SEO from './seo'
import Tags from './tags'

export default ({ data }) => {
  const post = data.orgPost

  return (
    <Layout>
      <SEO
        title={post.title}
        description={post.excerpt}
        imageSource={post.image?.childImageSharp?.fluid.src}
        keywords={[post.category, ...(post.tags || [])]}
      />
      <Container variant="content">
        <main sx={{ flex: 1, pb: 4, mx: 'auto' }}>
          <article>
            <header sx={{ pb: 1 }}>
              <PostHero post={post} />
              <PostTitle>{post.title}</PostTitle>
              <Flex sx={{ alignItems: 'center', mt: -4, mb: 3 }}>
                <Box sx={{ pr: 3 }}>
                  <PostMeta post={post} />
                </Box>
              </Flex>
            </header>
            <section>
              <HTML raw={post.html} />
            </section>
          </article>
        </main>
        <Box>
          <Flex sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
            <TagsIcon sx={{ mr: 2 }} />
            <Tags tags={post.tags} />
          </Flex>
          <Link to={`/${post.category}`}>
            <Text sx={{ p: 2, textAlign: 'right' }}>
              Read more stories about "{post.category}"
            </Text>
          </Link>
          <PostShare post={post} />
          <Divider />
          <Bio />
        </Box>
      </Container>
    </Layout>
  )
}
