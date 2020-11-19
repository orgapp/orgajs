/** @jsx jsx */
import { Link } from 'gatsby'
import { Badge, Flex, jsx, Text } from 'theme-ui'

const Tags = ({ tags }: { tags: string[] }) => {
  return (
    <Flex sx={{ flexWrap: 'wrap', mx: -1, alignItems: 'center' }}>
      { tags.map(tag =>
        <Link to={`/:${tag}:`}>
          <Badge key={`tag-${tag}`} variant='tag' sx={{ mx: 1, my: 1 }}>
            <Text>{ tag }</Text>
          </Badge>
        </Link>
      ) }
    </Flex>
  )
}

export default Tags
