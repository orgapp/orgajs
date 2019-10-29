import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"
import BioContent from "./bio-content"
import { useSiteMetadata } from '../hooks'
import {
  FaTwitter as TwitterIcon,
  FaGithub as GithubIcon,
  FaEnvelope as EmailIcon,
} from 'react-icons/fa'

const SocialBadges = () => {
  const { twitter, github, email } = useSiteMetadata()
  const badges = [
    [ twitter, v => `https://twitter.com/${v}`, TwitterIcon ],
    [ github, v => `https://github.com/${v}`, GithubIcon ],
    [ email, v => `mailto:${v}`, EmailIcon ],
  ].filter(([ value ]) => value && value.length > 0)
   .map(([ value, createLink, Icon ], i) => (
     <a href={createLink(value)} key={`badge-${i}`} css={{
       paddingRight: '0.5em',
     }}>
       <Icon/>
     </a>
   ))

  return (
    <div css={{
      display: 'flex',
    }}>{ badges }</div>
  )
}

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
        <div css={{
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div>
            <BioContent />
          </div>
          <SocialBadges />
        </div>
      </div>
      <div>
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
