import PostsPage from "../components/posts"

const mapProps = Component => ({ data, pageContext }) =>
      Component({
        posts: pageContext.posts.map(p => ({ ...p.metadata, ...p.fields })),
        prev: pageContext.prev,
        next: pageContext.next,
      })

export default mapProps(PostsPage)
