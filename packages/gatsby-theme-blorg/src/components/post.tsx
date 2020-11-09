/** @jsx jsx */
import { Link } from 'gatsby'
import { Flex, Box, Button, Divider, Heading, Text, jsx } from 'theme-ui'
import { useSiteMetadata } from '../hooks'
import Bio from './bio'
import Footer from './footer'
import HTML from './html'
import Layout from './layout'
import PostDate from './post-date'
import PostTitle from './post-title'
import Tags from './tags'
import SEO from './seo'

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

export default ({ data, location, pageContext }) => {
  const {
    title,
    date,
    excerpt,
    category,
    fields: { slug },
    html,
    tags,
  } = data.orgContent

  const { author } = useSiteMetadata()

  return (
    <Layout location={location}>
      <SEO
        title={title}
        description={excerpt}
        keywords={[category, ...(tags || [])]} />
      <main sx={{ flex: 1 }}>
        <article>
          <header>
            <PostTitle>{ title }</PostTitle>
            <Flex sx={{ justifyContent: 'space-between', mt: -4, mb: 3 }}>
              <PostDate>{ date }</PostDate>
              <Tags tags={tags}/>
            </Flex>
          </header>
          <section>
            <HTML raw={ html }/>
          </section>
        </article>
      </main>
      <Box>
        <TweetThisButton title={title} slug={slug} />
        <Link to={`/${category}`}>
          <Text sx={{ p: 2, textAlign: 'right' }}>
            Read more stories about "{category}" ->
          </Text>
        </Link>
        <Divider/>
        <Bio/>
      </Box>
      <Footer/>
    </Layout>
  )
}