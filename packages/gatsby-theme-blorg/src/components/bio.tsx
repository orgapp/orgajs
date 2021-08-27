/** @jsx jsx */
import { Box, Flex, jsx } from 'theme-ui'
import Avatar from './avatar'
import BioContent from './bio-content'
import SocialLinks from './social-links'

export default () => {
  return (
    <Flex>
      <Box sx={{ p: 2, flex: '0 0 auto', justifyContent: 'flex-start' }}>
        <Avatar />
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
