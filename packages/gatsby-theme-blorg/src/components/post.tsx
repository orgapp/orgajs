/** @jsx jsx */
import { Link } from 'gatsby'
import { Box, Button, Divider, Flex, Heading, jsx, Text } from 'theme-ui'
import { useSiteMetadata } from '../hooks'
import Bio from './bio'
import HTML from './html'
import Layout from './layout'
import PostDate from './post-date'
import PostTitle from './post-title'
import SEO from './seo'
import Tags from './tags'

const objectToGetParams = object => {
  return '?' + Object.keys(object)
    .filter(key => !!object[key])
    .map(key => `${key}=${encodeURIComponent(object[key])}`)
    .join('&')
}

const TweetThisButton = ({ title, slug }) => {
  const { siteUrl, twitter } = useSiteMetadata()
  if (!twitter || twitter.length === 0) return null
  const link = `https://twitter.com/intent/tweet` + objectToGetParams({
    text: title,
    url: `${siteUrl}${ slug }`,
    via: twitter,
  })

  return (
    <a href={link}>
      <Button sx={{
        width: '100%',
        px: 2,
        transition: '0.3s',
        '&:hover': {
          cursor: 'pointer',
          bg: 'highlight',
        }
      }}>
        <Heading as='h3'>Tweet this.</Heading>
      </Button>
    </a>
  )
}

export default ({ data }) => {
  const {
    title,
    date,
    excerpt,
    category,
    slug,
    html,
    tags,
  } = data.orgPost

  const { author } = useSiteMetadata()

  return (
    <Layout>
      <SEO
        title={title}
        description={excerpt}
        keywords={[category, ...(tags || [])]} />
      <main sx={{ flex: 1, pb: 4 }}>
        <article>
          <header sx={{ pb: 1 }}>
            <PostTitle>{ title }</PostTitle>
            <Flex sx={{ alignItems: 'center', mt: -4, mb: 3 }}>
              <Box sx={{ pr: 3 }}>
                <PostDate>{ date }</PostDate>
              </Box>
              <Tags tags={tags}/>
            </Flex>
          </header>
          <section>
            <HTML raw={ html }/>
          </section>
        </article>
      </main>
      <Box>
        <Link to={`/${category}`}>
          <Text sx={{ p: 2, textAlign: 'right' }}>
            Read more stories about "{category}" ->
          </Text>
        </Link>
        <TweetThisButton title={title} slug={slug} />
        <Divider/>
        <Bio/>
      </Box>
    </Layout>
  )
}
