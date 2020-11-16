/** @jsx jsx */
import { Link } from 'gatsby'
import { Box, Container, Divider, Flex, jsx, Text } from 'theme-ui'
import Bio from './bio'
import HTML from './html'
import Layout from './layout'
import PostDate from './post-date'
import PostHero from './post-hero'
import PostShare from './post-share'
import PostTitle from './post-title'
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
        keywords={[post.category, ...(post.tags || [])]} />
      <Container variant='content'>
        <main sx={{ flex: 1, pb: 4, mx: 'auto' }}>
          <article>
            <header sx={{ pb: 1 }}>
              <PostHero post={post}/>
              <PostTitle>{post.title}</PostTitle>
              <Flex sx={{ alignItems: 'center', mt: -4, mb: 3 }}>
                <Box sx={{ pr: 3 }}>
                  <PostDate>{post.date}</PostDate>
                </Box>
                <Tags tags={post.tags} />
              </Flex>
            </header>
            <section>
              <HTML raw={post.html} />
            </section>
          </article>
        </main>
        <Box>
          <Link to={`/${post.category}`}>
            <Text sx={{ p: 2, textAlign: 'right' }}>
              Read more stories about "{post.category}" ->
          </Text>
          </Link>
          <PostShare post={post}/>
          <Divider />
          <Bio />
        </Box>

      </Container>
    </Layout>
  )
}
