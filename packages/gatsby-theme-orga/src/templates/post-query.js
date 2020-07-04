import { graphql } from 'gatsby'
import PostPage from '../components/post'

const mapProps = Component => ({ data, ...props }) => {
  var {pageContext: { metadata }} = props;
  return Component({
    ...metadata,
    body: data.orgContent.html,
    slug: data.orgContent.fields.slug,
    ...props,
  })
}

export default mapProps(PostPage)

export const pageQuery = graphql`
query PostById($id: String!) {
  orgContent(id: { eq: $id }) {
    html
    fields { slug }
  }
}
`
