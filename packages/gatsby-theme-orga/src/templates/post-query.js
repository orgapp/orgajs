import { graphql } from 'gatsby'
import PostPage from '../components/post'

export default PostPage

export const pageQuery = graphql`
query BlogPostBySlug($id: String!) {
  orgContent(id: { eq: $id }) {
    html
    meta { title }
    fields { slug }
  }
}
`
