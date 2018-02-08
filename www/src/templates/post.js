import React from "react"
import style from "./_style.module.scss"


class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.orga
    const { title, date } = post.meta

    return (
      <div>
        <center>
          <h1 className={style.title}>{title}</h1>
          <small>{date}</small>
        </center>
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
      </div>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    orga(fields: { slug: { eq: $slug }}) {
      html
      meta {
        title
        date
      }
    }
  }
`
