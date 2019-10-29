import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"
import BioContent from "./bio-content"
import { useSiteMetadata } from '../hooks'

export default () => {
  const {
    avatar,
  } = useStaticQuery(bioQuery)

  const { author } = useSiteMetadata()

  return (
    <div>
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
    </div>
  )
}

const bioQuery = graphql`
  query BioQuery {
    avatar: file(absolutePath: { regex: "/avatar.(jpeg|jpg|gif|png)/" }) {
      childImageSharp {
        fixed(width: 48, height: 48) {
          ...GatsbyImageSharpFixed
        }
      }
    }
  }
`
