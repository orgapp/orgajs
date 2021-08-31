import Image from 'gatsby-image'

const PostHero = ({ post }) => (
  <div>
    {post?.image?.childImageSharp && (
      <Image
        fluid={post.image.childImageSharp.fluid}
        alt={post.imageAlt ? post.imageAlt : post.excerpt}
      />
    )}
  </div>
)

export default PostHero
