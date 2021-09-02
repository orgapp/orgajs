import { GatsbyImage, getImage } from 'gatsby-plugin-image'

const PostHero = ({ post }) => (
  <div>
    {post?.image?.childImageSharp && (
      <GatsbyImage
        image={getImage(post.image)}
        alt={post.imageAlt ? post.imageAlt : post.excerpt}
      />
    )}
  </div>
)

export default PostHero
