/** @jsx jsx */
import { Flex, Box, Text, jsx } from "theme-ui"
import {
  FaCalendar as DateIcon,
  FaClock as TimeToReadIcon,
  FaPencilAlt as WordCountIcon,
} from 'react-icons/fa'
import { IconContext } from 'react-icons'

const Info = ({ children }) => (
  <Flex sx={{ alignItems: 'center' }}>
    { children.icon }
    <Box sx={{ px: 2 }}>{ children.info }</Box>
  </Flex>
)

const PostDate = ({ post }) => (
  <Flex sx={{ color: 'gray', alignItems: 'center', flexWrap: 'wrap', pt: 2 }}>
    <IconContext.Provider value={{ style: { verticalAlign: 'middle' } }}>
      <Info>{{
          icon: <DateIcon/>,
          info: post.date
        }}</Info>
      <Info>{{
          icon: <WordCountIcon/>,
          info: `${post.wordCount} words`
        }}</Info>
      <Info>{{
          icon: <TimeToReadIcon/>,
          info: `${post.timeToRead} minutes`
        }}</Info>
    </IconContext.Provider>
  </Flex>
)

export default PostDate
