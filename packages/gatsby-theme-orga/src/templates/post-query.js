import { graphql } from 'gatsby'
import PostPage from '../components/post'

const mapProps = Component => ({ data, pageContext: { metadata } }) =>
      Component({ body: data.orgContent.html, metadata })

export default mapProps(PostPage)

export const pageQuery = graphql`
query PostById($id: String!) {
  orgContent(id: { eq: $id }) {
    html
  }
}
`
