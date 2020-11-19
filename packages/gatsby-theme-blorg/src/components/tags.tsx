/** @jsx jsx */
import { Link } from 'gatsby'
import { Badge, Flex, jsx, Text } from 'theme-ui'

const Tags = ({ tags }: { tags: string[] }) => {
  return (
    <Flex sx={{ flexWrap: 'wrap', mx: -1, alignItems: 'center' }}>
      { tags.map(tag =>
        <Badge key={`tag-${tag}`} variant='tag' sx={{ mx: 1, my: 1 }}>
          <Link to={`/:${tag}:`}>
            <Text color='text'>{ tag }</Text>
          </Link>
        </Badge>) }
    </Flex>
  )
}

export default Tags
