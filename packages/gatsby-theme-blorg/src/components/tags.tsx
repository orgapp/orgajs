/** @jsx jsx */
import { Link } from 'gatsby'
import { Text, Badge, Flex, jsx } from 'theme-ui'

const Tags = ({ tags }: { tags: string[] }) => {
  return (
    <Flex sx={{ gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      { tags.map(tag =>
        <Badge key={`tag-${tag}`}>
          <Link to={`/:${tag}:`}>
            <Text color='text'>{ tag }</Text>
          </Link>
        </Badge>) }
    </Flex>
  )
}

export default Tags
