/** @jsx jsx */
import { Link } from 'gatsby'
import { Text, Badge, Flex, jsx } from 'theme-ui'

const Tags = ({ tags }: { tags: string[] }) => {
  return (
    <Flex sx={{ gap: 1, flexWrap: 'wrap' }}>
      { tags.map(tag =>
        <Badge key={`tag-${tag}`} variant='tag'>
          <Link to={`/:${tag}:`}>
            <Text color='text'>{ tag }</Text>
          </Link>
        </Badge>) }
    </Flex>
  )
}

export default Tags
