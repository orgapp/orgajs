/** @jsx jsx */
import { graphql, useStaticQuery, Link } from "gatsby"
import Image from "gatsby-image"
import {
  FaEnvelope as EmailIcon, FaGithub as GithubIcon, FaTwitter as TwitterIcon, FaGlobe as WebsiteIcon
} from 'react-icons/fa'
import { Flex, jsx, Box, Text, IconButton } from 'theme-ui'
import { useSiteMetadata } from '../hooks'
import BioContent from "./bio-content"

const SocialLinks = () => {
  const { social } = useSiteMetadata()

  const getIcon = name => {
    switch (name.toLowerCase()) {
      case 'twitter': return <TwitterIcon size='1.5em'/>
      case 'email': return <EmailIcon size='1.5em'/>
      case 'github': return <GithubIcon size='1.5em'/>
      case 'website': return <WebsiteIcon size='1.5em'/>
      default: return <Text>{ name }</Text>
    }
  }

  return (
    <Flex>
      { social.map(({ name, url }) =>
        <Link key={`social-${name}`} to={url}>
          <IconButton>
            { getIcon(name) }
          </IconButton>
        </Link>
      ) }
    </Flex>
  )
}

const Photo = ({ src }) => (
  <Image
    fluid={ src }
    sx={{
      width: [80, 120],
      borderRadius: '50%',
      border: '1px solid white' }}/>
)

export default (props) => {
  const {
    avatar,
  } = useStaticQuery(bioQuery)

  const { author } = useSiteMetadata()

  return (
    <Flex>
      <Box p={2}>
        <Photo src={avatar.childImageSharp.fluid} />
      </Box>
      <Flex sx={{ flexDirection: 'column' }}>
        <div>
          <BioContent />
        </div>
        <SocialLinks />
      </Flex>
    </Flex>
  )
}

const bioQuery = graphql`
  query BioQuery {
    avatar: file(absolutePath: { regex: "/avatar.(jpeg|jpg|gif|png)/" }) {
      childImageSharp {
        fluid(maxWidth: 120, maxHeight: 120) {
          ...GatsbyImageSharpFluid_noBase64
        }
      }
    }
  }
`
