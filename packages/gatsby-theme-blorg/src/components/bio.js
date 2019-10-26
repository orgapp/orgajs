import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"
import BioContent from "./bio-content"

export default () => {
  const {
    site: {
      siteMetadata: { author },
    },
    avatar,
  } = useStaticQuery(bioQuery)

  return (
    <div css={{
      display: 'flex',
      marginBottom: 4,
      alignItems: 'center',
    }}>
      {avatar ? (
        <Image
          fixed={avatar.childImageSharp.fixed}
          alt={author}
          css={{
            marginRight: `.4em`,
            marginBottom: 0,
            width: 48,
            flexShrink: 0,
            borderRadius: 99999,
          }}
        />
      ) : (
        <div
          css={{
            marginRight: `.4em`,
            marginBottom: 0,
            width: 48,
            flexShrink: 0,
            borderRadius: 99999,
          }}
          role="presentation"
        />
      )}
      <div>
        <BioContent />
      </div>
    </div>
  )
}

const bioQuery = graphql`
  query BioQuery {
    site {
      siteMetadata {
        author
      }
    }
    avatar: file(absolutePath: { regex: "/avatar.(jpeg|jpg|gif|png)/" }) {
      childImageSharp {
        fixed(width: 48, height: 48) {
          ...GatsbyImageSharpFixed
        }
      }
    }
  }
`
