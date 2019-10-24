import PostsPage from "../components/posts"

const mapProps = Component => ({ data, pageContext }) =>
      Component({
        posts: pageContext.posts.map(p => ({ ...p.metadata, ...p.fields })),
        prev: pageContext.prev,
        next: pageContext.next,
        siteMetadata: data.site.siteMetadata,
      })

export default mapProps(PostsPage)

export const pageQuery = graphql`
query SiteInfoForPosts {
  site {
    siteMetadata {
      title
    }
  }
}
`
