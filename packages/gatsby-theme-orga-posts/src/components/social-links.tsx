/** @jsx jsx */
import {
  FaEnvelope as EmailIcon,
  FaGithub as GithubIcon,
  FaGlobe as WebsiteIcon,
  FaTwitter as TwitterIcon,
} from 'react-icons/fa'
import { Flex, IconButton, jsx, Text } from 'theme-ui'
import { useSiteMetadata } from '../hooks'

export default () => {
  const { social } = useSiteMetadata()

  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'twitter':
        return <TwitterIcon size="1.5em" />
      case 'email':
        return <EmailIcon size="1.5em" />
      case 'github':
        return <GithubIcon size="1.5em" />
      case 'website':
        return <WebsiteIcon size="1.5em" />
      default:
        return <Text>{name}</Text>
    }
  }

  return (
    <Flex>
      {social.map(({ name, url }) => (
        <a key={`social-${name}`} href={url}>
          <IconButton
            sx={{
              mx: 1,
              '&:hover': { bg: 'highlight' },
            }}
          >
            {getIcon(name)}
          </IconButton>
        </a>
      ))}
    </Flex>
  )
}
