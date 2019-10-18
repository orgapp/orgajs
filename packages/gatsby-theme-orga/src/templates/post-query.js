import { graphql } from 'gatsby'
import PostPage from '../components/post'

const mapProps = Component => ({ data, pageContext: { metadata } }) =>
      Component({
        ...metadata,
        body: data.orgContent.html,
        slug: data.orgContent.fields.slug,
      })

export default mapProps(PostPage)

export const pageQuery = graphql`
query PostById($id: String!) {
  orgContent(id: { eq: $id }) {
    html
    fields { slug }
  }
}
`
