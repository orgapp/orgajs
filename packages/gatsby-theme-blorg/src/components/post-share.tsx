/** @jsx jsx */
import { Button, Heading, jsx } from 'theme-ui'
import { useSiteMetadata } from '../hooks'

const objectToGetParams = (object) => {
  return (
    '?' +
    Object.keys(object)
      .filter((key) => !!object[key])
      .map((key) => `${key}=${encodeURIComponent(object[key])}`)
      .join('&')
  )
}

const TweetThisButton = ({ post: { title, slug } }) => {
  const { siteUrl, twitter } = useSiteMetadata()
  if (!twitter || twitter.length === 0) return null
  const link =
    `https://twitter.com/intent/tweet` +
    objectToGetParams({
      text: title,
      url: `${siteUrl}${slug}`,
      via: twitter,
    })

  return (
    <a href={link}>
      <Button
        sx={{
          width: '100%',
          px: 2,
        }}
      >
        <Heading as="h3">Tweet this.</Heading>
      </Button>
    </a>
  )
}

export default ({ post }) => (
  <div>
    <TweetThisButton post={post} />
  </div>
)
